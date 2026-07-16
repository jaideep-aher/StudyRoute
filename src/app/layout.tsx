import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyRoute",
  description: "A learning resource recommender that makes room for exploration.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
