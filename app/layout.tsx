import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medal Forge",
  description: "Generate medal and metal plate models from SVG files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
