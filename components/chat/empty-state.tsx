import {
  Code2Icon,
  LightbulbIcon,
  LineChartIcon,
  PencilLineIcon,
  type LucideIcon,
} from "lucide-react";

/*
 * Empty state from Stitch's "Empty State" screen.
 *
 *   - Greeting scales from 4xl → 5xl and uses a zinc-900 → zinc-500
 *     linear gradient on the text itself so it reads as a single
 *     editorial masthead.
 *   - Subline sits directly under it in on-surface-variant at a larger
 *     body size.
 *   - Suggestions render in a 2×2 bento: each tile is top-aligned with
 *     a top-left icon that flips from zinc to Cobalt on hover, plus a
 *     subtle primary→transparent gradient overlay that fades in. This
 *     is our one "Digital Intelligence moment" per designMd.
 */

type SuggestedPrompt = {
  icon: LucideIcon;
  title: string;
  caption: string;
  prompt: string;
};

const suggestions: SuggestedPrompt[] = [
  {
    icon: LineChartIcon,
    title: "Analyze a Dataset",
    caption: "Extract key insights and trends",
    prompt: "Summarize this project in three bullets.",
  },
  {
    icon: Code2Icon,
    title: "Draft a Component",
    caption: "Generate structured UI code",
    prompt: "Scaffold a React component for a data table with sorting.",
  },
  {
    icon: PencilLineIcon,
    title: "Refine Copy",
    caption: "Edit for tone, clarity and brevity",
    prompt: "Rewrite my draft into a crisp release note.",
  },
  {
    icon: LightbulbIcon,
    title: "Brainstorm Ideas",
    caption: "Explore new angles and concepts",
    prompt: "Give me five directions to take this product next quarter.",
  },
];

type EmptyStateProps = {
  greeting: string;
  subline: string;
  onSelectPrompt: (prompt: string) => void;
};

export function EmptyState({ greeting, subline, onSelectPrompt }: EmptyStateProps) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center gap-12 px-4 py-10 md:px-0">
      <header className="space-y-3">
        <h2 className="bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-4xl font-bold tracking-[-0.02em] text-transparent md:text-5xl">
          {greeting}
        </h2>
        <p className="text-lg font-medium text-on-surface-variant md:text-xl">
          {subline}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {suggestions.map((item) => (
          <SuggestionTile item={item} key={item.title} onSelect={onSelectPrompt} />
        ))}
      </div>
    </div>
  );
}

function SuggestionTile({
  item,
  onSelect,
}: {
  item: SuggestedPrompt;
  onSelect: (prompt: string) => void;
}) {
  const { icon: Icon, title, caption, prompt } = item;
  return (
    <button
      className="group relative flex flex-col items-start overflow-hidden rounded-xl bg-surface-container-low p-5 text-left transition-colors duration-300 hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onClick={() => onSelect(prompt)}
      type="button"
    >
      {/* Cobalt bleed-in overlay — reveals only on hover, very subtle. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <Icon className="relative z-10 mb-4 size-7 text-on-surface-variant/70 transition-colors group-hover:text-primary" />
      <span className="relative z-10 mb-1 font-semibold text-on-surface">
        {title}
      </span>
      <span className="relative z-10 text-sm text-on-surface-variant">
        {caption}
      </span>
    </button>
  );
}
