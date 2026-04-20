import type { ReactNode } from "react";
import { SideNav } from "./side-nav";
import { TopAppBar } from "./top-app-bar";

/*
 * Three-zone desktop shell from Stitch: persistent SideNav (w-64), a
 * fixed-height TopAppBar (h-16, backdrop-blur), and a main canvas that
 * fills the rest. Mobile collapses to just the canvas + top bar; the
 * sidebar is hidden below md per the Stitch layout.
 */

type AppShellProps = {
  title: string;
  isConfigured: boolean;
  canClear: boolean;
  onOpenSettings: () => void;
  onClearConversation: () => void;
  children: ReactNode;
};

export function AppShell({
  title,
  isConfigured,
  canClear,
  onOpenSettings,
  onClearConversation,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-surface text-on-surface antialiased">
      <SideNav
        canClear={canClear}
        onNewChat={onClearConversation}
        onOpenSettings={onOpenSettings}
      />

      <main className="relative flex h-dvh min-w-0 flex-1 flex-col bg-surface">
        <TopAppBar
          canClear={canClear}
          isConfigured={isConfigured}
          onClearConversation={onClearConversation}
          title={title}
        />
        {children}
      </main>
    </div>
  );
}
