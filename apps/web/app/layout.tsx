import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PaceLab — F1 Strategy Intelligence",
  description:
    "Predict tire degradation, simulate pit strategies, and understand what F1 teams should have done.",
  keywords: ["F1", "Formula 1", "race strategy", "tire degradation", "pit stop"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
