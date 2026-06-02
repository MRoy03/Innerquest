import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InnerQuest — Level Up Your Life",
  description:
    "A gamified wellness platform combining brain training, fitness, nutrition, and mental wellness into an RPG experience.",
  keywords: ["wellness", "gamification", "brain training", "fitness", "nutrition", "mental health"],
  openGraph: {
    title: "InnerQuest — Level Up Your Life",
    description: "Turn your daily wellness habits into an epic RPG adventure.",
    type: "website",
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
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="min-h-full bg-bg text-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
