import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { TRPCProvider } from "@/trpc/client";

import { Noto_Sans_SC, Noto_Serif_SC, Readex_Pro } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/scroll-to-top";
import Script from "next/script";

const readex = Readex_Pro({ subsets: ["latin"] });
const notoSansSC = Noto_Sans_SC({
  display: "swap",
  preload: false,
  variable: "--font-noto-sans-sc",
  weight: "variable",
});
const notoSerifSC = Noto_Serif_SC({
  display: "swap",
  preload: false,
  variable: "--font-noto-serif-sc",
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://p.yueyong.fun",
  ),
  title: {
    template: "%s - YueYong Photography",
    default: "YueYong Photography",
  },
  description:
    "Photography and field notes shaped by places, distance, and time.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${readex.className} ${notoSansSC.variable} ${notoSerifSC.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <TRPCProvider>{children}</TRPCProvider>
          <Toaster />
          <ScrollToTop />
        </ThemeProvider>
        {process.env.VERCEL ? (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        ) : null}
        <Script
          src="https://ackee.yueyong.fun/script.js"
          data-website-id="906aecd4-e8b8-402d-83c5-eb31b98256bb"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
