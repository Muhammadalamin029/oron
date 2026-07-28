"use client"

import { useEffect } from "react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[#ff6b00] font-mono text-xs tracking-[0.2em] uppercase">Admin / Error</p>
      <h1 className="font-display font-bold text-2xl text-[#e5e2e1]">This panel hit an error</h1>
      <p className="text-[#9a9898] text-sm max-w-md font-mono">
        {error.digest ? `Ref: ${error.digest}` : "No error reference available."}
      </p>
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={() => reset()}
          className="bg-[#ff6b00] text-white font-bold text-xs tracking-widest px-6 py-3 rounded-lg hover:bg-[#ff8533] transition-all active:scale-95"
        >
          TRY AGAIN
        </button>
        <a
          href="/admin"
          className="border border-[#353534] text-[#c6c6c6] font-bold text-xs tracking-widest px-6 py-3 rounded-lg hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all"
        >
          BACK TO DASHBOARD
        </a>
      </div>
    </div>
  )
}
