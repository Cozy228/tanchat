import { BotIcon, CopyIcon, PencilIcon, RefreshCwIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { Response } from "@/components/elements/response";
import type { ChatMessage } from "@/lib/chat-types";

/*
 * Message bubbles from Stitch's Active Conversation screen.
 *
 *   User      bg-zinc-900 + text-zinc-50, rounded-2xl rounded-tr-sm,
 *             right-aligned, ambient on-surface shadow. This is the one
 *             place we intentionally use a near-black surface — it
 *             anchors the user's voice as "primary authorship" against
 *             the Zinc canvas.
 *   Assistant bg-zinc-100 + on-surface, rounded-2xl rounded-tl-sm, a
 *             smart_toy avatar rendered on a primary-gradient chip with
 *             a product signature label above the bubble.
 *
 * Hover exposes a compact action rail (copy / edit / regenerate /
 * thumbs) — ghost chrome, no borders.
 */

type MessageBubbleProps = {
  message: ChatMessage;
  productName: string;
  onCopy?: (message: ChatMessage) => void;
};

export function MessageBubble({ message, productName, onCopy }: MessageBubbleProps) {
  if (message.role === "user") {
    return <UserBubble message={message} />;
  }

  return <AssistantBubble message={message} onCopy={onCopy} productName={productName} />;
}

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <div
      className="group ml-auto flex w-full max-w-3xl flex-row justify-end"
      data-testid="message-user"
    >
      <div className="flex w-full flex-col items-end gap-1">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-900 px-5 py-4 text-base leading-relaxed text-zinc-50 shadow-[0_10px_20px_color-mix(in_oklab,var(--on-surface)_6%,transparent)]">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="mt-1 flex items-center gap-1 pr-1 text-on-surface-variant/80 opacity-0 transition-opacity group-hover:opacity-100">
          <HoverAction label="Edit message">
            <PencilIcon className="size-4" />
          </HoverAction>
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({
  message,
  onCopy,
  productName,
}: {
  message: ChatMessage;
  onCopy?: (message: ChatMessage) => void;
  productName: string;
}) {
  return (
    <div
      className="group mr-auto flex w-full max-w-3xl flex-row justify-start"
      data-testid="message-assistant"
    >
      <div className="flex w-full items-start gap-4">
        <div
          aria-hidden="true"
          className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-primary-gradient text-on-primary shadow-[var(--shadow-primary-glow)]"
        >
          <BotIcon className="size-[18px]" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-semibold text-on-surface">{productName}</span>

          <div className="max-w-full rounded-2xl rounded-tl-sm bg-zinc-100 px-6 py-5 text-base leading-relaxed text-on-surface">
            <Response>{message.content}</Response>
          </div>

          <div className="flex items-center gap-1 pl-1 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100">
            <HoverAction label="Copy response" onClick={() => onCopy?.(message)}>
              <CopyIcon className="size-4" />
            </HoverAction>
            <HoverAction label="Regenerate response">
              <RefreshCwIcon className="size-4" />
            </HoverAction>
            <HoverAction label="Good response">
              <ThumbsUpIcon className="size-4" />
            </HoverAction>
            <HoverAction label="Bad response">
              <ThumbsDownIcon className="size-4" />
            </HoverAction>
          </div>
        </div>
      </div>
    </div>
  );
}

function HoverAction({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="grid size-8 place-items-center rounded-full transition-colors hover:bg-surface-container-highest hover:text-on-surface"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}
