import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Floor Plan Studio — PRiMAX Tech Challenge",
  description: "2D to 3D floor plan conversion with brand fidelity — powered by a deterministic ProjectManifest pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
