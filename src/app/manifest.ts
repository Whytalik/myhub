import type { MetadataRoute } from "next";

// Next.js App Router convention — auto-linked into <head>, no other wiring
// needed. The "shortcuts" entry is what lets an installed PWA jump straight
// into thought capture from a home-screen long-press.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyHub",
    short_name: "MyHub",
    description: "Personal operating system for life, habits, and food planning.",
    start_url: "/life/journal",
    display: "standalone",
    background_color: "#1c1c1e",
    theme_color: "#1c1c1e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Quick capture",
        short_name: "Capture",
        description: "Jot a thought straight into the Inbox",
        url: "/life/journal?capture=1",
      },
    ],
  };
}
