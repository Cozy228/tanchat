import type { EndpointConfig } from "@/lib/chat-config";
import type { ChatMessage } from "@/lib/chat-types";

/*
 * Union of shapes we've seen in the wild across "OpenAI-compatible" endpoints:
 *
 *   - OpenAI Chat Completions: choices[0].message.content (string or parts[])
 *   - OpenAI Responses API:    output_text (flat) or output[].content[].text
 *   - Anthropic Messages API:  top-level content[] of {type:"text", text}
 *
 * Proxies sometimes mix these (e.g. Anthropic payload wrapped in an OpenAI
 * envelope), so the extractor below falls through each shape in turn rather
 * than dispatching on a provider flag.
 */
type ContentPart = { text?: string; type?: string };
type ContentField = string | ContentPart[];

type UniversalReplyPayload = {
  choices?: Array<{
    message?: {
      content?: ContentField;
    };
  }>;
  content?: ContentField;
  output_text?: string;
  output?: Array<{ content?: ContentPart[] }>;
  error?: {
    message?: string;
  };
};

function getNetworkErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    throw error;
  }

  if (error instanceof TypeError) {
    return "Couldn't reach the configured endpoint. Check the URL and browser CORS access.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The configured endpoint request failed.";
}

function toChatCompletionMessages(config: EndpointConfig, messages: ChatMessage[]) {
  const requestMessages = messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  if (!config.systemPrompt) {
    return requestMessages;
  }

  return [{ role: "system", content: config.systemPrompt }, ...requestMessages];
}

function contentToText(content: ContentField | undefined): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part.text?.trim())
      .filter((part): part is string => Boolean(part))
      .join("\n")
      .trim();
  }

  return "";
}

/*
 * Some proxies (e.g. Bedrock Access Gateway) use an OpenAI Chat Completions
 * envelope but set choices[0].message.content to the raw Anthropic Messages
 * JSON string. If the extracted text looks like JSON, try to unwrap it as an
 * Anthropic payload before giving up.
 */
function tryUnwrapNestedJson(text: string): string {
  if (!text.trimStart().startsWith("{")) {
    return text;
  }

  try {
    const inner = JSON.parse(text) as UniversalReplyPayload;
    const nested = contentToText(inner.content);
    if (nested) {
      return nested;
    }
  } catch {
    // not JSON — return as-is
  }

  return text;
}

function extractAssistantReply(payload: UniversalReplyPayload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  // OpenAI Chat Completions (possibly with a nested Anthropic JSON string).
  const openAIReply = contentToText(payload.choices?.[0]?.message?.content);
  if (openAIReply) {
    return tryUnwrapNestedJson(openAIReply);
  }

  // Anthropic Messages (content[] at the top level).
  const anthropicReply = contentToText(payload.content);
  if (anthropicReply) {
    return anthropicReply;
  }

  // OpenAI Responses API (output[].content[]).
  const responsesReply = payload.output
    ?.flatMap((item) => item.content ?? [])
    .map((part) => part.text?.trim())
    .filter((part): part is string => Boolean(part))
    .join("\n")
    .trim();
  if (responsesReply) {
    return responsesReply;
  }

  throw new Error("The endpoint response did not include an assistant message.");
}

export async function requestOpenAICompatibleReply({
  config,
  messages,
  signal,
}: {
  config: EndpointConfig;
  messages: ChatMessage[];
  signal?: AbortSignal;
}) {
  try {
    const response = await fetch(config.endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: config.model,
        messages: toChatCompletionMessages(config, messages),
        stream: false,
      }),
      signal,
    });

    const payload = (await response.json().catch(() => null)) as UniversalReplyPayload | null;

    if (!response.ok) {
      const errorMessage = payload?.error?.message || `The endpoint returned ${response.status}.`;
      throw new Error(errorMessage);
    }

    if (!payload) {
      throw new Error("The endpoint returned an empty response.");
    }

    return extractAssistantReply(payload);
  } catch (error) {
    const message = getNetworkErrorMessage(error);
    throw new Error(message);
  }
}
