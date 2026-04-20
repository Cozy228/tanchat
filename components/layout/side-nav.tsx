import { MessageCircleIcon, PlusIcon, Settings2Icon, type LucideIcon } from "lucide-react";

/*
 * Left side nav, 64-wide, desktop-only per Stitch.
 *
 *  - Brand block: gradient mark + product wordmark + plan caption.
 *  - "New Chat" CTA: tonal zinc button sitting on the quiet sidebar
 *    surface, relying on a faint ambient shadow for lift.
 *  - Conversation list: one entry today ("Current Analysis"). When
 *    multi-chat lands we'll render real items from storage here.
 *  - Footer: the Settings entry. This is the single settings entry
 *    point in the app — the top bar intentionally does not duplicate
 *    it.
 */

export type SideNavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
  testId?: string;
};

type SideNavProps = {
  onNewChat: () => void;
  onOpenSettings: () => void;
  canClear: boolean;
};

export function SideNav({ onNewChat, onOpenSettings, canClear }: SideNavProps) {
  const conversations: SideNavItem[] = [
    {
      key: "current",
      label: "Current Analysis",
      icon: MessageCircleIcon,
      active: true,
    },
  ];

  return (
    <aside
      aria-label="Primary navigation"
      className="sticky top-0 z-20 hidden h-dvh w-64 shrink-0 flex-col gap-2 bg-surface-container-low p-4 md:flex"
    >
      <BrandBlock />

      <button
        className="group mb-4 flex w-full items-center justify-between rounded-xl bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-on-surface shadow-[var(--shadow-ambient)] transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canClear}
        onClick={onNewChat}
        type="button"
      >
        <span>New Chat</span>
        <PlusIcon className="size-4 text-on-surface-variant transition-colors group-hover:text-primary" />
      </button>

      <nav aria-label="Conversations" className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {conversations.map((item) => (
          <NavLink item={item} key={item.key} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 pt-4">
        <NavLink
          item={{
            key: "settings",
            label: "Settings",
            icon: Settings2Icon,
            onClick: onOpenSettings,
            testId: "chat-config-button",
          }}
        />
      </div>
    </aside>
  );
}

function BrandBlock() {
  return (
    <div className="mb-2 flex items-center gap-3 px-3 py-4">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-gradient text-sm font-bold text-on-primary shadow-[var(--shadow-primary-glow)]">
        T
      </div>
      <div className="flex min-w-0 flex-col leading-none">
        <span className="truncate text-lg font-bold tracking-tight text-on-surface">TanChat</span>
        <span className="mt-1 text-xs font-medium text-on-surface-variant">Local dev</span>
      </div>
    </div>
  );
}

function NavLink({ item }: { item: SideNavItem }) {
  const { label, icon: Icon, active, onClick, testId } = item;
  const base =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm tracking-tight transition-colors";
  const tone = active
    ? "bg-surface-container-highest font-semibold text-on-surface"
    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface disabled:cursor-default";

  /*
   * Decorative items (no onClick) render as disabled buttons so
   * assistive tech treats them as inactive controls rather than
   * broken anchors. When they get real routes, swap to Link.
   */
  return (
    <button
      aria-current={active ? "page" : undefined}
      className={`${base} ${tone}`}
      data-testid={testId}
      disabled={!onClick && !active}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-[18px] shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
