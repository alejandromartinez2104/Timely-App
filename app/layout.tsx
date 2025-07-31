import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TIMELY - Professional Time Tracking",
  description: "Professional time tracking app with biometric authentication and PDF export",
  // next-pwa will generate manifest.json, no need to link it here
  themeColor: "#1e3a8a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TIMELY",
    // next-pwa will generate startup images, but we can specify a default
    startupImage: "/icon-512.png",
  },
  icons: {
    // next-pwa will handle icon generation based on manifest, but we can provide defaults
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  keywords: ["time tracking", "productivity", "timesheet", "work timer", "PWA"],
  authors: [{ name: "TIMELY Team" }],
  creator: "TIMELY",
  publisher: "TIMELY",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "TIMELY - Professional Time Tracking",
    description: "Track your time professionally with biometric authentication",
    type: "website",
    locale: "en_US",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e3a8a",
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* next-pwa will inject manifest and service worker links */}
        {/* We keep explicit apple-touch-icon for broader compatibility */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TIMELY" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1e3a8a" />
        {/* next-pwa handles msapplication-config via manifest */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
