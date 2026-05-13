"use client"

import { useEffect, useState } from "react"

type Status = "checking" | "online" | "offline"

export function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking")

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
    fetch(`${apiUrl}/health`)
      .then((r) => r.json())
      .then((body) => {
        setStatus(body?.data?.status === "ok" ? "online" : "offline")
      })
      .catch(() => setStatus("offline"))
  }, [])

  const config: Record<Status, { color: string; label: string; dot: string }> = {
    checking: {
      color: "text-[#6B6B7A]",
      label: "CONNECTING",
      dot: "bg-[#6B6B7A] animate-pulse",
    },
    online: {
      color: "text-[#00D2BE]",
      label: "API ONLINE",
      dot: "bg-[#00D2BE]",
    },
    offline: {
      color: "text-[#E8002D]",
      label: "API OFFLINE",
      dot: "bg-[#E8002D] animate-pulse",
    },
  }

  const { color, label, dot } = config[status]

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-2 font-mono text-xs tracking-widest z-50">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className={color}>{label}</span>
    </div>
  )
}
