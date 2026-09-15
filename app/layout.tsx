import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarkStore — Your AI's memory, everywhere.",
  description:
    "Store, sync, version, and access the Markdown and JSON files that make your AI agents smarter.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
