"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Copy, Plus } from "lucide-react";
import { paymentLinksApi } from "@/services/payment-links";
import type { PaymentLink } from "@/types/api";
import { formatDate } from "@/lib/admin-utils";
import {
  AdminPageHeader,
  GlassCard,
  SkeletonRows,
  DarkInput,
  OrangeButton,
  EmptyState,
} from "@/components/admin-ui";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/get-error-message"

const STATUSES = ["ALL", "ACTIVE", "INACTIVE"];

export default function AdminPaymentLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");

  const load = async () => {
    const res = await paymentLinksApi.list();
    setLinks(res);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (err: unknown) {
        if (!cancelled) toast.error(getErrorMessage(err, "Failed to load payment links"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return links.filter((l) => {
      const hay = `${l.title} ${l.slug}`.toLowerCase();
      const matchesSearch = hay.includes(search.toLowerCase());
      const matchesStatus =
        activeStatus === "ALL" ||
        (activeStatus === "ACTIVE" ? l.is_active : !l.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [links, search, activeStatus]);

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/pay/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="PAYMENT LINKS"
        sub="/ SHAREABLE CHECKOUT LINKS"
        action={
          <Link href="/admin/payment-links/create">
            <OrangeButton>
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> CREATE LINK
              </span>
            </OrangeButton>
          </Link>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <DarkInput
          placeholder="Search title, slug..."
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
                  : "bg-[#0a0a0a] border border-[#1a1a1a] text-[#9a9898] hover:border-[#ff6b00] hover:text-[#ff6b00]",
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
            title="No payment links found"
            message="Try adjusting your search or filter, or create a new link."
            action={
              <OrangeButton
                onClick={() => {
                  setSearch("");
                  setActiveStatus("ALL");
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
                  {["Title", "Link", "Products", "Status", "Created", "Action"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "p-4 text-[10px] font-bold tracking-[0.15em] text-[#9a9898] uppercase font-normal",
                          i === 5 && "text-center",
                        )}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((link) => (
                  <tr
                    key={link.id}
                    onClick={() => router.push(`/admin/payment-links/${link.id}`)}
                    className="border-l-2 border-transparent hover:border-[#ff6b00] hover:bg-white/[0.02] transition-all cursor-pointer group"
                  >
                    <td className="p-4 text-[#e5e2e1] text-sm font-semibold">
                      {link.title}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#9a9898] text-xs truncate max-w-[140px]">
                          /pay/{link.slug}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyLink(link.slug);
                          }}
                          className="text-[#9a9898] group-hover:text-[#ff6b00] transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-[#c6c6c6] text-sm">
                      {link.items?.length ?? 0}
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold tracking-[0.15em] uppercase",
                          link.is_active
                            ? "border-green-900 bg-green-900/20 text-green-400"
                            : "border-[#353534] bg-[#1c1b1b] text-[#9a9898]",
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                            link.is_active ? "bg-green-400" : "bg-[#9a9898]",
                          )}
                        />
                        {link.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="p-4 text-[#c6c6c6] text-sm whitespace-nowrap">
                      {formatDate(link.created_at)}
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/admin/payment-links/${link.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#9a9898] group-hover:text-[#ff6b00] transition-colors text-xs font-bold tracking-wider uppercase"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
