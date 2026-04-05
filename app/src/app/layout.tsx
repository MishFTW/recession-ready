import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Recession Ready — Are You Prepared?",
  description:
    "A life audit built on lessons from the 1930s Great Depression. 8 questions, an honest score, and a personalized survival playbook.",
  openGraph: {
    title: "Recession Ready — Are You Prepared?",
    description:
      "8 questions. An honest score. A personalized survival playbook.",
    type: "website",
    siteName: "Recession Ready",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recession Ready — Are You Prepared?",
    description:
      "8 questions. An honest score. A personalized survival playbook.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
