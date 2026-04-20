import { ArrowUpIcon, PaperclipIcon, SquareIcon } from "lucide-react";
import type { ChangeEventHandler, KeyboardEventHandler } from "react";

/*
 * Fixed-bottom composer from Stitch's Active & Errors screens.
 *
 * Visual anatomy:
 *   1. A gradient fade from `--surface` up to transparent hides
 *      messages that scroll underneath, so the composer always has
 *      clean contrast without needing a divider line.
 *   2. The input card sits on surface-container-lowest with a 2px
 *      ghost border (outline-variant @ 15%). On focus the border
 *      lifts to primary @ 50% and a tinted glow appears.
 *   3. Left: a ghost attach-file icon button (placeholder today).
 *      Middle: textarea on transparent, auto-grows up to ~max-h-32.
 *      Right: a small Cobalt-gradient send chip, rounded-lg, with a
 *      tinted primary glow. During streaming, it flips to a neutral
 *      Stop square.
 *   4. A small centered disclaimer caption under the card.
 */

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  status: "idle" | "sending";
  disclaimer?: string;
};

const DEFAULT_DISCLAIMER =
  "TanChat is powered by your configured model. Verify critical code.";

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  status,
  disclaimer = DEFAULT_DISCLAIMER,
}: ComposerProps) {
  const isSending = status === "sending";
  const canSend = value.trim().length > 0 && !isSending;

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    onChange(event.target.value);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        onSend();
      }
    }
  };

  return (
    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 bg-gradient-to-t from-surface via-surface to-transparent px-4 pt-12 pb-6 md:px-8">
      <div className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-3">
        <div className="flex items-end gap-2 rounded-xl border-2 border-outline-variant/15 bg-surface-container-lowest p-2 shadow-[var(--shadow-ambient)] transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-[var(--shadow-primary-glow)]">
          <button
            aria-label="Attach file"
            className="grid size-10 shrink-0 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            disabled
            title="Attachments coming soon"
            type="button"
          >
            <PaperclipIcon className="size-5" />
          </button>

          <textarea
            className="max-h-32 min-h-11 w-full resize-none bg-transparent px-2 py-3 text-base leading-6 text-on-surface outline-none placeholder:text-on-surface-variant/60"
            data-testid="chat-message-input"
            disabled={isSending}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message TanChat Engine…"
            rows={1}
            value={value}
          />

          {isSending ? (
            <button
              aria-label="Stop generating"
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-container-highest text-on-surface transition-colors hover:bg-surface-container-high"
              data-testid="chat-stop-button"
              onClick={onStop}
              type="button"
            >
              <SquareIcon className="size-4" />
            </button>
          ) : (
            <button
              aria-label="Send message"
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-gradient text-on-primary shadow-[var(--shadow-primary-glow)] transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
              data-testid="chat-send-button"
              disabled={!canSend}
              onClick={onSend}
              type="button"
            >
              <ArrowUpIcon className="size-5" />
            </button>
          )}
        </div>

        <p className="text-center text-xs font-medium tracking-wide text-on-surface-variant/70">
          {disclaimer}
        </p>
      </div>
    </div>
  );
}
