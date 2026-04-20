import type { EndpointConfig } from "@/lib/chat-config";
import type { ChatMessage } from "@/lib/chat-types";

function wait(durationMs: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      resolve();
    }, durationMs);

    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException("Request aborted.", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function createMockAssistantReply({
  config,
  messages,
  signal,
}: {
  config: EndpointConfig;
  messages: ChatMessage[];
  signal?: AbortSignal;
}) {
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ?? "";

  const endpointHost = config.endpointUrl ? new URL(config.endpointUrl).host : "custom endpoint";

  await wait(240, signal);

  return [
    `Mock reply using \`${config.model || "your configured model"}\`.`,
    "",
    `Saved endpoint: ${endpointHost}.`,
    "",
    `Latest prompt: ${latestUserMessage}`,
  ].join("\n");
}
