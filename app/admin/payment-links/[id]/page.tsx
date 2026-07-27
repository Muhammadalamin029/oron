"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { paymentLinksApi } from "@/services/payment-links";
import type { PaymentLink, Order, User } from "@/types/api";
import { formatNGN, formatDate, formatDateTime } from "@/lib/admin-utils";
import {
  AdminPageHeader,
  GlassCard,
  StatusBadge,
  SkeletonRows,
  OrangeButton,
  CustomerCell,
  EmptyState,
} from "@/components/admin-ui";

export default function PaymentLinkDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [sessions, setSessions] = useState<(Order & { user?: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  const load = async () => {
    const [linkRes, sessionsRes] = await Promise.all([
      paymentLinksApi.get(params.id),
      paymentLinksApi.sessions(params.id),
    ]);
    setLink(linkRes);
    setSessions(sessionsRes);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (err: any) {
        if (!cancelled) toast.error(err?.message || "Failed to load payment link");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const shareUrl = link ? `${window.location.origin}/pay/${link.slug}` : "";

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleActive = async () => {
    if (!link) return;
    try {
      setTogglingActive(true);
      const updated = await paymentLinksApi.update(link.id, { is_active: !link.is_active });
      setLink(updated);
      toast.success(updated.is_active ? "Link activated" : "Link deactivated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update link");
    } finally {
      setTogglingActive(false);
    }
  };

  const handleDelete = async () => {
    if (!link) return;
    if (!window.confirm("Permanently delete this payment link? Existing orders are kept, but this link's own record and grouping is gone forever.")) {
      return;
    }
    try {
      await paymentLinksApi.remove(link.id);
      toast.success("Payment link deleted");
      router.push("/admin/payment-links");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete link");
    }
  };

  if (loading || !link) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="PAYMENT LINK" sub="/ LOADING..." />
        <GlassCard className="overflow-hidden">
          <SkeletonRows count={4} />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={link.title}
        sub="/ PAYMENT LINK"
          action={
            <button
              onClick={() => router.push("/admin/payment-links")}
              className="border border-[#353534] text-[#9a9898] hover:text-white transition-colors px-6 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase"
            >
              BACK TO LINKS
            </button>
          }
        />

        <GlassCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
                Shareable Link
              </p>
              <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#353534] rounded-lg p-3">
                <span className="flex-1 font-mono text-sm text-[#e5e2e1] truncate">
                  {shareUrl}
                </span>
                <button
                  onClick={copyUrl}
                  className="text-[#9a9898] hover:text-[#ff6b00] transition-colors flex-shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-[#9a9898] mt-2">
                Created {formatDate(link.created_at)} · {link.items.length} product
                {link.items.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-col justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold tracking-[0.15em] uppercase ${
                    link.is_active
                      ? "border-green-900 bg-green-900/20 text-green-400"
                      : "border-[#353534] bg-[#1c1b1b] text-[#9a9898]"
                  }`}
                >
                  {link.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <div className="flex gap-2">
                <OrangeButton onClick={toggleActive} disabled={togglingActive} className="flex-1 justify-center">
                  {link.is_active ? "DEACTIVATE" : "ACTIVATE"}
                </OrangeButton>
              </div>
              <button
                onClick={handleDelete}
                className="border border-red-900 text-red-400 hover:bg-red-900/20 font-bold text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 rounded-lg transition-all"
              >
                Delete Link
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-3">
              Products on this link
            </p>
            <div className="space-y-2">
              {link.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-[#0a0a0a]/50 rounded-lg px-4 py-2.5"
                >
                  <span className="text-sm text-[#e5e2e1]">{item.product.name}</span>
                  <span className="text-xs text-[#9a9898]">
                    {formatNGN(item.product.price)} · default qty {item.default_quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <div>
          <h3 className="font-display font-bold text-lg text-white uppercase tracking-widest mb-4">
            Sessions ({sessions.length})
          </h3>
          <GlassCard className="overflow-hidden">
            {sessions.length === 0 ? (
              <EmptyState
                title="No sessions yet"
                message="Orders placed through this link will show up here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#0a0a0a]/50">
                      {["TXN ID", "Date", "Customer", "NGN Total", "Status"].map((h) => (
                        <th
                          key={h}
                          className="p-4 text-[10px] font-bold tracking-[0.15em] text-[#9a9898] uppercase font-normal"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {sessions.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="border-l-2 border-transparent hover:border-[#ff6b00] hover:bg-white/[0.02] transition-all cursor-pointer group"
                      >
                        <td className="p-4 font-mono text-[#9a9898] text-xs truncate max-w-[110px]">
                          #{order.id.slice(0, 10).toUpperCase()}
                        </td>
                        <td className="p-4 text-[#c6c6c6] text-sm whitespace-nowrap">
                          {formatDateTime(order.created_at)}
                        </td>
                        <td className="p-4">
                          <CustomerCell
                            name={order.user?.full_name || "Customer"}
                            email={order.user?.email || order.user_id}
                          />
                        </td>
                        <td className="p-4 font-display font-bold text-lg text-white">
                          {formatNGN(order.total_amount)}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
  );
}
