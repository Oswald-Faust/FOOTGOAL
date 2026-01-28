import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FOOTGOAL - Watch Live Football Matches | Stream Soccer Online",
  description: "Watch live football matches from Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and Champions League. Free live streaming of all football games.",
  keywords: "live football, stream soccer, premier league live, la liga stream, champions league live, free football streaming",
  openGraph: {
    title: "FOOTGOAL - Live Football Streaming",
    description: "Watch all football matches live. Free streaming of Premier League, La Liga, Serie A, and more.",
    type: "website",
    locale: "en_US",
    siteName: "FOOTGOAL",
  },
  twitter: {
    card: "summary_large_image",
    title: "FOOTGOAL - Live Football Streaming",
    description: "Watch all football matches live. Free streaming of all major leagues.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
