import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "尊爵嚴選 · 一夜女伴預約平台",
  description: "新竹地區高端一日女伴、美甲精油模特兒預約平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body className="bg-[#0B0F19] text-white antialiased">{children}</body>
    </html>
  );
}
