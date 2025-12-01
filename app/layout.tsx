import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'
import JsonLd from "@/components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.codemindai.dev'),
  title: {
    default: "CodeMindAI - Advanced Code Analysis & Understanding",
    template: "%s | CodeMindAI"
  },
  description: "CodeMindAI is an intelligent code analysis tool that helps developers understand, debug, and optimize their codebase with AI-powered insights.",
  keywords: ["code analysis", "AI coding assistant", "static analysis", "code understanding", "developer tools", "nextjs", "react", "typescript"],
  authors: [{ name: "CodeMindAI Team" }],
  creator: "CodeMindAI",
  publisher: "CodeMindAI",
  openGraph: {
    title: "CodeMindAI - Advanced Code Analysis & Understanding",
    description: "Intelligent code analysis tool for developers. Understand, debug, and optimize your codebase with AI.",
    url: "https://www.codemindai.dev",
    siteName: "CodeMindAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeMindAI - Advanced Code Analysis & Understanding",
    description: "Intelligent code analysis tool for developers. Understand, debug, and optimize your codebase with AI.",
    creator: "@codemindai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.codemindai.dev',
  },
};

import { ThemeProvider } from "@/components/theme-provider"

import { AuthProvider } from "@/contexts/AuthContext"

import { ProjectProvider } from "@/contexts/ProjectContext"

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ProjectProvider>
              {children}
            </ProjectProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <JsonLd />
      </body>
    </html>
  );
}
