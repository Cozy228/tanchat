import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkspace } from "@/components/chat-workspace";

export const Route = createFileRoute("/(chat)/")({
  component: Home,
});

function Home() {
  return <ChatWorkspace />;
}
