import {
  ArrowDownIcon,
  LoaderCircleIcon,
  Settings2Icon,
  SparklesIcon,
  SquareIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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
import { Response } from "./elements/response";
import { ChatConfigSheet } from "./chat-config-sheet";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const suggestedPrompts = [
  "Summarize this project in three bullets.",
  "Rewrite my draft into a crisp release note.",
  "Turn a rough idea into an implementation checklist.",
];

export function ChatWorkspace() {
  const [config, setConfig] = useState(defaultEndpointConfig);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const abortControllerRef = useRef<AbortController | null>(null);

  const { containerRef, isAtBottom, scrollToBottom } = useScrollToBottom();

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

  const endpointSummary = useMemo(() => {
    if (!isConfigured) {
      return "Open settings to add an endpoint and model.";
    }

    return `${config.model} via ${endpointHost ?? "custom endpoint"}`;
  }, [config.model, endpointHost, isConfigured]);

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
        {
          id: generateUUID(),
          role: "assistant",
          content: assistantReply,
        },
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

  return (
    <>
      <ChatConfigSheet
        config={config}
        onOpenChange={setIsSettingsOpen}
        onReset={resetConfig}
        onSave={saveConfig}
        open={isSettingsOpen}
      />

      <main className="mx-auto flex min-h-[100dvh] w-full max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <section className="glass-panel relative flex w-full min-w-0 flex-col overflow-hidden rounded-[32px] border bg-background">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.14)_0%,transparent_58%)]" />

          <header className="relative border-b px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border bg-card text-foreground shadow-sm">
                    <SparklesIcon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">TanChat</h1>
                    <p className="truncate text-sm text-muted-foreground">{endpointSummary}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className="rounded-full px-3 py-1"
                  data-testid="chat-config-status"
                  variant={isConfigured ? "default" : "secondary"}
                >
                  {isConfigured ? "Configured" : "Setup required"}
                </Badge>

                <Button
                  data-testid="chat-config-button"
                  onClick={() => setIsSettingsOpen(true)}
                  type="button"
                  variant="outline"
                >
                  <Settings2Icon />
                  Settings
                </Button>

                <Button
                  disabled={messages.length === 0}
                  onClick={clearConversation}
                  type="button"
                  variant="ghost"
                >
                  <Trash2Icon />
                  Clear
                </Button>
              </div>
            </div>
          </header>

          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto px-4 py-6 md:px-6 md:py-8" ref={containerRef}>
                {messages.length === 0 ? (
                  <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center gap-10 py-6">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
                        <SparklesIcon className="size-4" />
                        <span>{isConfigured ? endpointSummary : "Open settings to begin."}</span>
                      </div>

                      <div className="space-y-3">
                        <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                          How can I help?
                        </h2>
                        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                          Start with a prompt below or type your own message.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {suggestedPrompts.map((prompt) => (
                        <button
                          className="rounded-[24px] border bg-background/80 px-4 py-4 text-left text-sm font-medium shadow-sm transition hover:-translate-y-px hover:border-primary/30 hover:bg-accent active:translate-y-0"
                          key={prompt}
                          onClick={() => {
                            void sendMessage(prompt);
                          }}
                          type="button"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-end gap-6">
                    {messages.map((message) => {
                      const isUser = message.role === "user";

                      return (
                        <div
                          className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                          data-testid={`message-${message.role}`}
                          key={message.id}
                        >
                          {!isUser && (
                            <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-2xl border bg-card text-foreground shadow-sm">
                              <SparklesIcon className="size-4" />
                            </div>
                          )}

                          <div
                            className={`flex max-w-[min(100%,44rem)] flex-col gap-2 ${
                              isUser ? "items-end" : "items-start"
                            }`}
                          >
                            <span className="px-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                              {isUser ? "You" : "Assistant"}
                            </span>

                            <div
                              className={`rounded-[28px] px-4 py-3 shadow-sm md:px-5 md:py-4 ${
                                isUser
                                  ? "bg-primary text-primary-foreground"
                                  : "border bg-card/90 text-card-foreground"
                              }`}
                            >
                              {isUser ? (
                                <p className="whitespace-pre-wrap text-sm leading-7">
                                  {message.content}
                                </p>
                              ) : (
                                <Response>{message.content}</Response>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <button
              aria-label="Scroll to bottom"
              className={`absolute right-6 bottom-32 rounded-full border bg-background/95 p-2 shadow-lg transition ${
                isAtBottom
                  ? "pointer-events-none scale-95 opacity-0"
                  : "pointer-events-auto scale-100 opacity-100"
              }`}
              onClick={() => scrollToBottom("smooth")}
              type="button"
            >
              <ArrowDownIcon className="size-4" />
            </button>

            <div className="relative border-t bg-background/90 px-4 py-4 backdrop-blur-sm md:px-6 md:py-5">
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
                <div className="rounded-[28px] border bg-background p-3 shadow-sm">
                  <Textarea
                    className="min-h-[120px] resize-none border-0 bg-transparent px-1 py-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    data-testid="chat-message-input"
                    disabled={status === "sending"}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        if (status === "idle") {
                          void sendMessage();
                        }
                      }
                    }}
                    placeholder="Write a message"
                    rows={4}
                    value={input}
                  />

                  <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {status === "sending" ? (
                        <>
                          <LoaderCircleIcon className="size-4 animate-spin" />
                          <span>Waiting for reply</span>
                        </>
                      ) : (
                        <span>
                          {isConfigured
                            ? `Ready to chat with ${endpointSummary}`
                            : "Open settings to add your endpoint and model."}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end">
                      {status === "sending" ? (
                        <Button
                          data-testid="chat-stop-button"
                          onClick={stopGeneration}
                          type="button"
                          variant="outline"
                        >
                          <SquareIcon />
                          Stop
                        </Button>
                      ) : (
                        <Button
                          data-testid="chat-send-button"
                          disabled={!input.trim()}
                          onClick={() => {
                            void sendMessage();
                          }}
                          type="button"
                        >
                          Send
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
