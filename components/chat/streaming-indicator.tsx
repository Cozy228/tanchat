import { ZapIcon } from "lucide-react";

/*
 * Streaming assistant placeholder from Stitch's "UI States & Errors"
 * screen. Matches the assistant bubble layout (small branded avatar +
 * signature + bubble) but replaces the response body with a pulsing
 * skeleton and three bouncing dots in primary. The avatar uses the
 * bolt icon + a tinted primary glow to signal "engine active".
 */

type StreamingIndicatorProps = {
  productName: string;
  label?: string;
};

export function StreamingIndicator({
  productName,
  label = "Thinking through your request…",
}: StreamingIndicatorProps) {
  return (
    <div
      className="mr-auto flex w-full max-w-3xl flex-row justify-start"
      data-testid="message-streaming"
    >
      <div className="flex w-full items-start gap-4">
        <div
          aria-hidden="true"
          className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-primary-gradient text-on-primary shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
        >
          <ZapIcon className="size-[18px]" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-semibold text-on-surface">{productName}</span>

          <div className="max-w-full rounded-2xl rounded-tl-sm bg-surface-container-lowest px-6 py-5 text-base leading-relaxed text-on-surface shadow-[var(--shadow-ambient)]">
            <p className="mb-4 text-on-surface-variant">{label}</p>

            <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4">
              <SkeletonLine width="75%" />
              <SkeletonLine width="100%" />
              <SkeletonLine width="83%" />

              <div className="mt-2 flex gap-2" role="status" aria-live="polite">
                <span className="sr-only">Loading</span>
                <BouncingDot delay={0} />
                <BouncingDot delay={120} />
                <BouncingDot delay={240} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonLine({ width }: { width: string }) {
  return (
    <div
      className="h-4 animate-pulse rounded bg-[color-mix(in_oklab,var(--on-surface)_10%,transparent)]"
      style={{ width }}
    />
  );
}

function BouncingDot({ delay }: { delay: number }) {
  return (
    <span
      aria-hidden="true"
      className="size-2 animate-bounce rounded-full bg-primary"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
