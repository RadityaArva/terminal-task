import type { Metadata, Viewport } from "next";
import "./globals.css";
import InstallPrompt from "@/components/terminal-ui/InstallPrompt";

export const metadata: Metadata = {
  title: "TermFlow - Terminal Task Organizer",
  description: "Terminal-first keyboard-driven project and task manager UI",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "TermFlow",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col font-mono bg-[var(--bg-app)] text-[var(--text-main)] antialiased">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
