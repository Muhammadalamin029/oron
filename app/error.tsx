"use client"

import { useEffect } from "react"

export default function Error({
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#131313] text-[#e5e2e1] px-6 text-center">
      <p className="text-[#ff6b00] font-mono text-xs tracking-widest uppercase">Something broke</p>
      <h1 className="font-display font-bold text-2xl md:text-3xl">We hit a snag loading this page</h1>
      <p className="text-[#9a9898] text-sm max-w-md">
        Try again, or head back to the homepage. If this keeps happening, let us know through Support.
      </p>
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={() => reset()}
          className="bg-[#ff6b00] text-white font-bold text-xs tracking-widest px-6 py-3 rounded-lg hover:bg-[#ff8533] transition-all active:scale-95"
        >
          TRY AGAIN
        </button>
        <a
          href="/"
          className="border border-[#353534] text-[#c6c6c6] font-bold text-xs tracking-widest px-6 py-3 rounded-lg hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all"
        >
          GO HOME
        </a>
      </div>
    </div>
  )
}
