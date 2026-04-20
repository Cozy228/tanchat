import type { EndpointConfig } from "@/lib/chat-config";
import type { ChatMessage } from "@/lib/chat-types";

type ChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ text?: string; type?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
  output_text?: string;
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

function contentToText(
  content: string | Array<{ text?: string; type?: string }> | undefined,
): string {
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

function extractAssistantReply(payload: ChatCompletionsResponse) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const choice = payload.choices?.[0];
  const reply = contentToText(choice?.message?.content);

  if (reply) {
    return reply;
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

    const payload = (await response.json().catch(() => null)) as ChatCompletionsResponse | null;

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
