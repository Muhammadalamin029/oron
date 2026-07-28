import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#131313] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-32 text-center">
        <p className="text-[#ff6b00] font-mono text-xs tracking-widest uppercase">404</p>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-white">Page not found</h1>
        <p className="text-[#9a9898] text-sm max-w-md">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-2 bg-[#ff6b00] text-white font-bold text-xs tracking-widest px-6 py-3 rounded-lg hover:bg-[#ff8533] transition-all active:scale-95"
        >
          BACK TO HOME
        </Link>
      </main>
      <Footer />
    </div>
  )
}
