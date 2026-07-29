export * from "@/lib/status-utils"

/* ─────────────────────────────────────────────
   Build userId → User lookup map
───────────────────────────────────────────── */
export function buildUserMap<T extends { id: string }>(users: T[]): Map<string, T> {
  const map = new Map<string, T>()
  for (const u of users) map.set(u.id, u)
  return map
}

/* ─────────────────────────────────────────────
   Admin-driven order status flow
   Mirrors backend/services/orders.py's ORDER_STATUS_FLOW —
   "paid" is reached only via payment webhook/verify, never admin-set.
───────────────────────────────────────────── */
export const ORDER_STATUS_FLOW = ["paid", "processing", "shipped", "delivered"] as const
export const CANCELLABLE_FROM_STATUSES = ["paid", "processing", "shipped"]
export const TERMINAL_ORDER_STATUSES = ["delivered", "cancelled"]
export const PAYMENT_GATED_STATUSES = ["pending", "unpaid", "expired"]

export const NEXT_STATUS_LABEL: Record<string, string> = {
  paid: "Mark as Processing",
  processing: "Mark as Shipped",
  shipped: "Mark as Delivered",
}

export function getNextOrderStatus(current: string): string | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current as (typeof ORDER_STATUS_FLOW)[number])
  if (idx === -1 || idx === ORDER_STATUS_FLOW.length - 1) return null
  return ORDER_STATUS_FLOW[idx + 1]
}
