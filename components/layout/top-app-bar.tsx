import { Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/*
 * Top app bar, fixed to the top of the canvas.
 *
 *   Left   Product h1 — rendered as the active model name, falling
 *          back to the product name when no endpoint is configured.
 *   Right  A single "Clear" action and a passive Live/Setup status
 *          pill. The pill is display-only: the Settings entry point
 *          lives in the SideNav, so we don't duplicate it here.
 */

type TopAppBarProps = {
  title: string;
  isConfigured: boolean;
  canClear: boolean;
  onClearConversation: () => void;
};

export function TopAppBar({
  title,
  isConfigured,
  canClear,
  onClearConversation,
}: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] px-4 backdrop-blur-md md:px-6">
      <h1 className="truncate text-xl font-black tracking-tight text-on-surface">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <button
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          disabled={!canClear}
          onClick={onClearConversation}
          type="button"
        >
          <Trash2Icon className="size-4" />
          <span className="hidden sm:inline">Clear</span>
        </button>

        <Badge
          aria-label={isConfigured ? "Connection live" : "Setup required"}
          data-testid="chat-config-status"
          variant={isConfigured ? "primary" : "default"}
        >
          {isConfigured ? "Live" : "Setup required"}
        </Badge>
      </div>
    </header>
  );
}
