"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { CircuitPath } from "./circuit-path"

const NAV_ITEMS = ["Strategy", "Drivers", "Circuits", "Live"] as const

const STATS = [
  { value: "2019–2024", label: "Race Seasons" },
  { value: "10,000×", label: "Monte Carlo Runs" },
  { value: "SC-Aware", label: "Simulation Engine" },
] as const

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#0D0D0F]">

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-[#1E1E24]"
      >
        <span className="font-mono text-white text-lg font-bold tracking-[0.15em] uppercase">
          PACE<span className="text-[#E8002D]">LAB</span>
        </span>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <span
              key={item}
              className="text-[#6B6B7A] text-xs font-mono uppercase tracking-[0.2em] hover:text-white transition-colors cursor-pointer"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8002D]" />
          <span className="text-[#6B6B7A] text-xs font-mono tracking-widest">
            2026 SEASON
          </span>
        </div>
      </motion.nav>

      {/* Circuit background animation */}
      <CircuitPath />

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8 py-16">

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="h-px w-8 bg-[#E8002D]" />
          <span className="text-[#E8002D] font-mono text-xs uppercase tracking-[0.4em]">
            F1 Strategy Intelligence Platform
          </span>
          <span className="h-px w-8 bg-[#E8002D]" />
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="font-mono font-bold leading-none tracking-tight text-white mb-4"
          style={{ fontSize: "clamp(56px, 10vw, 96px)" }}
        >
          PACE<span className="text-[#E8002D]">LAB</span>
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="h-px w-48 bg-gradient-to-r from-transparent via-[#1E1E24] to-transparent mb-6"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="text-[#6B6B7A] font-mono text-sm leading-relaxed max-w-md mb-10"
        >
          Predict. Simulate. Understand.
          <br />
          Every strategic decision, decoded.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mb-20"
        >
          <Link
            href="/strategy"
            className="inline-flex items-center justify-center bg-[#E8002D] text-white font-mono text-xs uppercase tracking-[0.2em] px-8 py-3 hover:bg-[#FF1040] active:bg-[#C00020] transition-colors"
          >
            Enter Strategy Room →
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center border border-[#1E1E24] text-[#6B6B7A] font-mono text-xs uppercase tracking-[0.2em] px-8 py-3 hover:border-[#6B6B7A] hover:text-white transition-colors"
          >
            API Docs
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="flex items-center gap-0 border border-[#1E1E24]"
        >
          {STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className={`px-8 py-4 text-center ${
                i < STATS.length - 1 ? "border-r border-[#1E1E24]" : ""
              }`}
            >
              <p className="font-mono text-xl font-bold text-white">{value}</p>
              <p className="font-mono text-[10px] text-[#6B6B7A] uppercase tracking-[0.2em] mt-1">
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 2.4, duration: 1.2 }}
        className="h-px bg-gradient-to-r from-transparent via-[#E8002D] to-transparent"
      />
    </div>
  )
}
