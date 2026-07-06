import { cn } from "@/lib/utils";

export function CustomerAvatar({ name, hasOrders }: { name: string; hasOrders: boolean }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0 border",
        hasOrders
          ? "border-[#ff6b00] shadow-[0_0_10px_rgba(255,107,0,0.2)]"
          : "border-[#3a3939]"
      )}
    >
      <span
        className={cn(
          "text-sm font-bold",
          hasOrders ? "text-[#ff6b00]" : "text-[#9a9898]"
        )}
      >
        {initials}
      </span>
    </div>
  );
}
