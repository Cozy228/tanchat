import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import appCss from "./globals.css?url";

/*
 * Locked to the "Zinc Cobalt" light palette (Stitch DS asset 913d8a5d…).
 * `theme-color` mirrors --surface so mobile browser chrome blends with
 * the interface.
 */
const THEME_COLOR = "#fbf8ff";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { name: "theme-color", content: THEME_COLOR },
      { name: "color-scheme", content: "light" },
      { title: "TanChat" },
      {
        name: "description",
        content: "Chat with a custom OpenAI-compatible endpoint.",
      },
      { property: "og:title", content: "TanChat" },
      {
        property: "og:description",
        content: "Chat with a custom OpenAI-compatible endpoint.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "TanChat" },
      {
        name: "twitter:description",
        content: "Chat with a custom OpenAI-compatible endpoint.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
  component: RootLayout,
  notFoundComponent: () => {
    return (
      <div className="flex h-dvh items-center justify-center">
        <h1>Not Found</h1>
      </div>
    );
  },
});

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <Toaster position="top-center" />
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
