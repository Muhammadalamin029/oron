import { cn } from "@/lib/utils";

export function CustomerStatus({ verified, orderCount }: { verified?: boolean; orderCount: number }) {
  if (!verified)
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#3a3939]/50 border border-[#3a3939] text-[#9a9898] text-[10px] font-bold tracking-[0.15em] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9a9898]" />
        Unverified
      </span>
    );
  if (orderCount > 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#3a3939]/50 border border-[#3a3939] text-[#e5e2e1] text-[10px] font-bold tracking-[0.15em] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
        Active
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#3a3939]/50 border border-[#3a3939] text-[#9a9898] text-[10px] font-bold tracking-[0.15em] uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] shadow-[0_0_5px_rgba(255,107,0,0.8)]" />
      Idle
    </span>
  );
}
