"use client"

import { useEffect } from "react"

// Catches errors that escape the root layout itself (e.g. a provider throwing).
// Next.js requires this file to render its own <html>/<body> — it fully
// replaces the root layout when it activates, so it can't rely on
// AuthProvider/CartProvider or the fonts set up there.
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          background: "#131313",
          color: "#e5e2e1",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#ff6b00", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Application error
        </p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Something went seriously wrong</h1>
        <p style={{ color: "#9a9898", fontSize: "0.875rem", maxWidth: "28rem" }}>
          Please try reloading the page. If this keeps happening, contact support.
        </p>
        <button
          onClick={() => reset()}
          style={{
            background: "#ff6b00",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          RELOAD
        </button>
      </body>
    </html>
  )
}
