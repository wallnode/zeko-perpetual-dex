import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ZEKO Perpetual DEX",
  description: "Perpetual Futures on Mina Layer 2",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
