"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, X, CreditCard } from "lucide-react"
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
} from "@/components/admin-ui"
import { cn } from "@/lib/utils"

const STATUSES = ["ALL", "PENDING", "SUCCESS", "FAILED", "EXPIRED"]

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <GlassCard className="p-5">
      <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-2">{label}</p>
      <p className="font-display font-bold text-2xl text-white">{value}</p>
    </GlassCard>
  )
}

function PaymentDetailModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/5 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]/50">
          <h3 className="font-display font-bold text-xl text-white tracking-tight">
            PAYMENT <span className="text-[#9a9898] font-mono text-base">/ #{payment.id.slice(0, 10).toUpperCase()}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-[#9a9898] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Reference</p>
              <p className="text-[#e5e2e1] font-mono text-sm">{payment.reference}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Amount</p>
              <p className="font-display font-bold text-xl text-[#ff6b00]">{formatNGN(payment.amount)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Status</p>
              <StatusBadge status={payment.status} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Provider</p>
              <p className="text-[#e5e2e1] text-sm capitalize">{payment.provider}</p>
            </div>
            {payment.bank_name && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Bank</p>
                <p className="text-[#e5e2e1] text-sm">{payment.bank_name}</p>
              </div>
            )}
            {payment.account_number && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Account Number</p>
                <p className="text-[#e5e2e1] font-mono text-sm">{payment.account_number}</p>
              </div>
            )}
          </div>

          {payment.order && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#ff6b00] uppercase mb-3">Order</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Order ID</p>
                  <p className="text-[#e5e2e1] font-mono text-sm">#{payment.order.id.slice(0, 10).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Customer</p>
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
                      <span className="text-[#e5e2e1]">
                        {item.product?.name || "Product"} × {item.quantity}
                      </span>
                      <span className="font-mono text-[#9a9898]">{formatNGN(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
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
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load payment data")
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
                  ? "bg-[#ff6b00] text-white"
                  : "bg-[#0a0a0a] border border-[#1a1a1a] text-[#9a9898] hover:border-[#ff6b00] hover:text-[#ff6b00]"
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#0a0a0a]/50">
                  {["Payment", "Customer", "Order", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="p-4 text-[10px] font-bold tracking-[0.15em] text-[#9a9898] uppercase font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => handleViewDetails(payment)}
                    className="border-l-2 border-transparent hover:border-[#ff6b00] hover:bg-white/[0.02] transition-all cursor-pointer group"
                  >
                    <td className="p-4">
                      <p className="font-mono text-sm text-[#e5e2e1]">{payment.id.slice(0, 10).toUpperCase()}</p>
                      <p className="text-xs text-[#9a9898] capitalize">{payment.provider}</p>
                    </td>
                    <td className="p-4">
                      <CustomerCell
                        name={payment.order?.user?.full_name || "Customer"}
                        email={payment.order?.user?.email || "—"}
                      />
                    </td>
                    <td className="p-4 font-mono text-[#9a9898] text-xs">
                      {payment.order?.id ? `#${payment.order.id.slice(0, 10).toUpperCase()}` : "—"}
                    </td>
                    <td className="p-4 font-display font-bold text-white">{formatNGN(payment.amount)}</td>
                    <td className="p-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="p-4 text-[#c6c6c6] text-sm whitespace-nowrap">
                      {formatDateTime(payment.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {selectedPayment && (
        <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      )}
    </div>
  )
}
