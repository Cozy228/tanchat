import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Composer } from "@/components/chat/composer";
import { EmptyState } from "@/components/chat/empty-state";
import { MessageBubble } from "@/components/chat/message-bubble";
import { StreamingIndicator } from "@/components/chat/streaming-indicator";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import {
  clearEndpointConfig,
  defaultEndpointConfig,
  getEndpointHost,
  isEndpointConfigReady,
  readEndpointConfig,
  type EndpointConfig,
  writeEndpointConfig,
} from "@/lib/chat-config";
import type { ChatMessage } from "@/lib/chat-types";
import { createMockAssistantReply } from "@/lib/openai-compatible";
import { generateUUID, getErrorMessage } from "@/lib/utils";
import { ChatConfigSheet } from "./chat-config-sheet";

/*
 * Workspace orchestrator — owns chat state and wires it through the
 * three-zone shell (SideNav / TopAppBar / canvas + composer).
 *
 * The visual vocabulary lives in the subcomponents so this file stays
 * focused on behavior: configure → send → mock reply, with clean stop
 * and clear transitions.
 */

const PRODUCT_NAME = "TanChat Engine";
const GREETING = "Good afternoon.";
const SUBLINE = "How can I help you with your editorial workflow today?";

export function ChatWorkspace() {
  const [config, setConfig] = useState(defaultEndpointConfig);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const abortControllerRef = useRef<AbortController | null>(null);
  const { containerRef, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    setConfig(readEndpointConfig());
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollToBottom("instant");
    });
  }, [messages, scrollToBottom]);

  const isConfigured = isEndpointConfigReady(config);
  const endpointHost = getEndpointHost(config);

  // Title follows Stitch's "GPT-4o Intelligence" pattern — it's the
  // currently selected model, falling back to the product name when no
  // endpoint is wired yet.
  const pageTitle = useMemo(() => {
    if (!isConfigured) {
      return "TanChat";
    }
    return config.model || "TanChat";
  }, [config.model, isConfigured]);

  const endpointSummary = useMemo(() => {
    if (!isConfigured) {
      return "Add your endpoint and model to start chatting.";
    }
    return `Connected to ${endpointHost ?? "custom endpoint"}`;
  }, [endpointHost, isConfigured]);

  const saveConfig = (nextConfig: EndpointConfig) => {
    setConfig(nextConfig);
    writeEndpointConfig(nextConfig);
  };

  const resetConfig = () => {
    clearEndpointConfig();
    setConfig(defaultEndpointConfig);
    toast.success("Endpoint settings cleared.");
  };

  const clearConversation = () => {
    abortControllerRef.current?.abort();
    setMessages([]);
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
  };

  const copyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success("Copied response.");
    } catch {
      toast.error("Couldn't copy to clipboard.");
    }
  };

  const sendMessage = async (submittedText?: string) => {
    const content = (submittedText ?? input).trim();
    if (!content) {
      return;
    }

    if (!isConfigured) {
      setIsSettingsOpen(true);
      toast.error("Add an endpoint URL and model before sending a message.");
      return;
    }

    const userMessage: ChatMessage = {
      id: generateUUID(),
      role: "user",
      content,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setStatus("sending");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const assistantReply = await createMockAssistantReply({
        config,
        messages: nextMessages,
        signal: controller.signal,
      });

      setMessages((current) => [
        ...current,
        { id: generateUUID(), role: "assistant", content: assistantReply },
      ]);
    } catch (error) {
      if (controller.signal.aborted) {
        toast.message("Request stopped.");
        return;
      }

      toast.error(getErrorMessage(error));
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      setStatus("idle");

      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
    }
  };

  const canClear = messages.length > 0 || status === "sending";

  return (
    <>
      <ChatConfigSheet
        config={config}
        onOpenChange={setIsSettingsOpen}
        onReset={resetConfig}
        onSave={saveConfig}
        open={isSettingsOpen}
      />

      <AppShell
        canClear={canClear}
        isConfigured={isConfigured}
        onClearConversation={clearConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        title={pageTitle}
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-hidden">
            <div
              className="h-full overflow-y-auto px-4 pt-6 pb-40 md:px-8 md:pt-10"
              ref={containerRef}
            >
              {messages.length === 0 && status === "idle" ? (
                <EmptyState
                  greeting={GREETING}
                  onSelectPrompt={(prompt) => {
                    void sendMessage(prompt);
                  }}
                  subline={isConfigured ? SUBLINE : endpointSummary}
                />
              ) : (
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onCopy={copyMessage}
                      productName={PRODUCT_NAME}
                    />
                  ))}

                  {status === "sending" ? (
                    <StreamingIndicator productName={PRODUCT_NAME} />
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <Composer
            onChange={setInput}
            onSend={() => {
              void sendMessage();
            }}
            onStop={stopGeneration}
            status={status}
            value={input}
          />
        </div>
      </AppShell>
    </>
  );
}
