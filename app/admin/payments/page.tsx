"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, CreditCard } from "lucide-react"
import { paymentsApi } from "@/services/payments"
import type { Payment } from "@/types/api"
import { formatNGN, formatDateTime } from "@/lib/admin-utils"
import {
  AdminPageHeader,
  GlassCard,
  StatusBadge,
  SkeletonRows,
  DarkInput,
  OrangeButton,
  CustomerCell,
  EmptyState,
  AdminTable,
  AdminTr,
  AdminTd,
  StatTile,
  AdminModal,
} from "@/components/admin-ui"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/get-error-message"

const STATUSES = ["ALL", "PENDING", "SUCCESS", "FAILED", "EXPIRED"]

function PaymentDetailModal({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  return (
    <AdminModal
      open={!!payment}
      onClose={onClose}
      title={
        <>
          PAYMENT{" "}
          {payment && (
            <span className="text-muted-foreground font-mono text-base">
              / #{payment.id.slice(0, 10).toUpperCase()}
            </span>
          )}
        </>
      }
    >
      {payment && (
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">Reference</p>
              <p className="text-foreground font-mono text-sm">{payment.reference}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">Amount</p>
              <p className="font-display font-bold text-xl text-primary">{formatNGN(payment.amount)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">Status</p>
              <StatusBadge status={payment.status} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">Provider</p>
              <p className="text-foreground text-sm capitalize">{payment.provider}</p>
            </div>
            {payment.bank_name && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">Bank</p>
                <p className="text-foreground text-sm">{payment.bank_name}</p>
              </div>
            )}
            {payment.account_number && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">Account Number</p>
                <p className="text-foreground font-mono text-sm">{payment.account_number}</p>
              </div>
            )}
          </div>

          {payment.order && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-3">Order</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">Order ID</p>
                  <p className="text-foreground font-mono text-sm">#{payment.order.id.slice(0, 10).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">Customer</p>
                  <CustomerCell
                    name={payment.order.user?.full_name || "Customer"}
                    email={payment.order.user?.email || payment.order.user_id}
                  />
                </div>
              </div>

              {payment.order.items && payment.order.items.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {payment.order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-foreground">
                        {item.product?.name || "Product"} × {item.quantity}
                      </span>
                      <span className="font-mono text-muted-foreground">{formatNGN(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AdminModal>
  )
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeStatus, setActiveStatus] = useState("ALL")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await paymentsApi.getAllPayments()
        if (!cancelled) setPayments(data)
      } catch (error: unknown) {
        if (!cancelled) toast.error(getErrorMessage(error, "Failed to load payment data"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const hay = `${p.id} ${p.reference} ${p.order?.id || ""} ${p.order?.user?.full_name || ""} ${p.order?.user?.email || ""}`.toLowerCase()
      const matchesSearch = hay.includes(search.toLowerCase())
      const matchesStatus = activeStatus === "ALL" || p.status.toLowerCase() === activeStatus.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [payments, search, activeStatus])

  const handleViewDetails = async (payment: Payment) => {
    try {
      const detailed = await paymentsApi.getPaymentDetails(payment.id)
      setSelectedPayment(detailed)
    } catch {
      toast.error("Failed to fetch payment details")
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="PAYMENTS" sub="/ ALL TRANSACTIONS" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Total" value={payments.length} />
        <StatTile label="Successful" value={payments.filter((p) => p.status === "success").length} />
        <StatTile label="Pending" value={payments.filter((p) => p.status === "pending").length} />
        <StatTile label="Failed" value={payments.filter((p) => p.status === "failed").length} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <DarkInput
          placeholder="Search by payment ID, reference, order, customer..."
          value={search}
          onChange={setSearch}
          icon={<Search className="h-4 w-4" />}
          className="w-full md:w-96"
        />
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all",
                activeStatus === s
                  ? "bg-primary text-white"
                  : "bg-[#0a0a0a] border border-[#1a1a1a] text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        {loading ? (
          <SkeletonRows count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No payments found"
            message="Try adjusting your search or status filter."
            icon={<CreditCard className="h-8 w-8" />}
            action={
              <OrangeButton
                onClick={() => {
                  setSearch("")
                  setActiveStatus("ALL")
                }}
              >
                CLEAR FILTERS
              </OrangeButton>
            }
          />
        ) : (
          <AdminTable headers={["Payment", "Customer", "Order", "Amount", "Status", "Date"]} lastRight={false}>
            {filtered.map((payment) => (
              <AdminTr key={payment.id} onClick={() => handleViewDetails(payment)}>
                <AdminTd>
                  <p className="font-mono text-sm text-foreground">{payment.id.slice(0, 10).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground capitalize">{payment.provider}</p>
                </AdminTd>
                <AdminTd>
                  <CustomerCell
                    name={payment.order?.user?.full_name || "Customer"}
                    email={payment.order?.user?.email || "—"}
                  />
                </AdminTd>
                <AdminTd mono className="text-xs">
                  {payment.order?.id ? `#${payment.order.id.slice(0, 10).toUpperCase()}` : "—"}
                </AdminTd>
                <AdminTd className="font-display font-bold text-white">{formatNGN(payment.amount)}</AdminTd>
                <AdminTd>
                  <StatusBadge status={payment.status} />
                </AdminTd>
                <AdminTd className="whitespace-nowrap">
                  {formatDateTime(payment.created_at)}
                </AdminTd>
              </AdminTr>
            ))}
          </AdminTable>
        )}
      </GlassCard>

      <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
    </div>
  )
}
