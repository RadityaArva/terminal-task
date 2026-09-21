import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TermFlow - Terminal Task Organizer",
  description: "Terminal-first keyboard-driven project and task manager UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col font-mono bg-[var(--bg-app)] text-[var(--text-main)] antialiased">
        {children}
      </body>
    </html>
  );
}
