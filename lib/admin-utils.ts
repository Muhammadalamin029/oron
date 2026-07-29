import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────
   Currency formatter (NGN)
───────────────────────────────────────────── */
export const formatNGN = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)

/* ─────────────────────────────────────────────
   Date formatter
───────────────────────────────────────────── */
export const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-NG") : "—"

export const formatDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("en-NG") : "—"

/* ─────────────────────────────────────────────
   Order status config
───────────────────────────────────────────── */
export type StatusKey =
  | "paid" | "completed" | "success"
  | "processing" | "shipped" | "pending"
  | "cancelled" | "canceled" | "failed"
  | "delivered" | "open" | "under_review"
  | "resolved" | "rejected" | "answered" | "closed"
  | "live" | "active" | "inactive"

interface StatusConfig {
  dot: string
  badge: string
  label: string
}

export const statusConfig: Record<string, StatusConfig> = {
  paid:         { dot: "bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]",  badge: "border-green-900 bg-green-900/20 text-green-400",     label: "PAID"         },
  completed:    { dot: "bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]",  badge: "border-green-900 bg-green-900/20 text-green-400",     label: "COMPLETED"    },
  success:      { dot: "bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]",  badge: "border-green-900 bg-green-900/20 text-green-400",     label: "PAID"         },
  delivered:    { dot: "bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]",  badge: "border-green-900 bg-green-900/20 text-green-400",     label: "DELIVERED"    },
  processing:   { dot: "bg-amber-400 animate-pulse",                           badge: "border-amber-900 bg-amber-900/20 text-amber-400",     label: "PROCESSING"   },
  shipped:      { dot: "bg-purple-400",                                         badge: "border-purple-900 bg-purple-900/20 text-purple-400", label: "SHIPPED"      },
  pending:      { dot: "bg-yellow-400",                                         badge: "border-yellow-900 bg-yellow-900/20 text-yellow-400", label: "PENDING"      },
  unpaid:       { dot: "bg-yellow-400",                                         badge: "border-yellow-900 bg-yellow-900/20 text-yellow-400", label: "UNPAID"       },
  expired:      { dot: "bg-red-400",                                            badge: "border-red-900 bg-red-900/20 text-red-400",          label: "EXPIRED"      },
  cancelled:    { dot: "bg-red-400",                                            badge: "border-red-900 bg-red-900/20 text-red-400",          label: "CANCELLED"    },
  canceled:     { dot: "bg-red-400",                                            badge: "border-red-900 bg-red-900/20 text-red-400",          label: "CANCELLED"    },
  failed:       { dot: "bg-red-400",                                            badge: "border-red-900 bg-red-900/20 text-red-400",          label: "FAILED"       },
  // Dispute statuses
  open:         { dot: "bg-red-400 animate-pulse",                             badge: "border-red-900 bg-red-900/20 text-red-400",          label: "OPEN"         },
  under_review: { dot: "bg-amber-400 animate-pulse",                           badge: "border-amber-900 bg-amber-900/20 text-amber-400",    label: "UNDER REVIEW" },
  resolved:     { dot: "bg-green-400",                                          badge: "border-green-900 bg-green-900/20 text-green-400",    label: "RESOLVED"     },
  rejected:     { dot: "bg-muted-foreground",                                  badge: "border-border bg-muted text-muted-foreground",       label: "REJECTED"     },
  // Support ticket statuses ("open" shared with disputes above)
  answered:     { dot: "bg-blue-400",                                          badge: "border-blue-900 bg-blue-900/20 text-blue-400",       label: "ANSWERED"     },
  closed:       { dot: "bg-muted-foreground",                                  badge: "border-border bg-muted text-muted-foreground",       label: "CLOSED"       },
  // Review / payment-link active states
  live:         { dot: "bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]",  badge: "border-green-900 bg-green-900/20 text-green-400",     label: "LIVE"         },
  active:       { dot: "bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]",  badge: "border-green-900 bg-green-900/20 text-green-400",     label: "ACTIVE"       },
  inactive:     { dot: "bg-muted-foreground",                                  badge: "border-border bg-muted text-muted-foreground",       label: "INACTIVE"     },
}

export const getFallbackStatus = (raw: string): StatusConfig => ({
  dot:   "bg-muted-foreground",
  badge: "border-border bg-muted text-muted-foreground",
  label: (raw || "—").toUpperCase(),
})

export const getStatusConfig = (status: string): StatusConfig =>
  statusConfig[(status || "").toLowerCase()] ?? getFallbackStatus(status)

/* ─────────────────────────────────────────────
   Build userId → User lookup map
───────────────────────────────────────────── */
export function buildUserMap<T extends { id: string }>(users: T[]): Map<string, T> {
  const map = new Map<string, T>()
  for (const u of users) map.set(u.id, u)
  return map
}

/* ─────────────────────────────────────────────
   Paid order statuses
───────────────────────────────────────────── */
export const PAID_STATUSES = ["paid", "completed", "success", "delivered", "shipped"]

export const isPaidStatus = (status: string) =>
  PAID_STATUSES.includes((status || "").toLowerCase())

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
