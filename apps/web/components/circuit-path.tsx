"use client"

import { motion } from "framer-motion"

export function CircuitPath() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none select-none">
      <svg
        viewBox="0 0 800 500"
        className="w-full max-w-5xl"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Main circuit outline */}
        <motion.path
          d="M 150 260
             L 150 155 Q 150 75 225 75
             L 415 75 Q 525 75 525 155
             L 525 185 Q 525 225 585 225
             L 655 225 Q 710 225 710 275
             L 710 330 Q 710 390 645 390
             L 395 390 Q 310 390 270 348
             L 235 308 Q 195 268 150 260 Z"
          stroke="#E8002D"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.8, ease: "easeInOut", delay: 0.3 }}
        />

        {/* Inner racing line — teal */}
        <motion.path
          d="M 175 260
             L 175 170 Q 175 105 230 105
             L 410 105 Q 495 105 495 170
             L 495 195 Q 495 255 570 255
             L 648 255 Q 678 255 678 285
             L 678 318 Q 678 358 635 358
             L 400 358 Q 330 358 295 325
             L 262 294 Q 220 265 175 260 Z"
          stroke="#00D2BE"
          strokeWidth="1"
          strokeDasharray="4 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 2.8, ease: "easeInOut", delay: 1.2 }}
        />

        {/* DRS zone 1 */}
        <motion.line
          x1="145" y1="200" x2="155" y2="200"
          stroke="#00D2BE"
          strokeWidth="5"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 3.0 }}
        />
        <motion.line
          x1="145" y1="215" x2="155" y2="215"
          stroke="#00D2BE"
          strokeWidth="5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.1 }}
        />

        {/* DRS zone 2 */}
        <motion.line
          x1="520" y1="148" x2="530" y2="148"
          stroke="#00D2BE"
          strokeWidth="5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2 }}
        />
        <motion.line
          x1="520" y1="163" x2="530" y2="163"
          stroke="#00D2BE"
          strokeWidth="5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.3 }}
        />

        {/* Start/finish line */}
        <motion.line
          x1="145" y1="248" x2="155" y2="272"
          stroke="#FFFFFF"
          strokeWidth="3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 3.5 }}
        />

        {/* Sector markers */}
        {[
          { x1: 370, y1: 72, x2: 370, y2: 78 },
          { x1: 640, y1: 385, x2: 640, y2: 395 },
        ].map((line, i) => (
          <motion.line
            key={i}
            {...line}
            stroke="#6B6B7A"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.6 + i * 0.1 }}
          />
        ))}

        {/* Pit lane indicator */}
        <motion.path
          d="M 160 262 L 160 280 Q 160 295 175 295 L 300 295"
          stroke="#FF8000"
          strokeWidth="1.5"
          strokeDasharray="3 5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.2, delay: 3.2 }}
        />
      </svg>
    </div>
  )
}
