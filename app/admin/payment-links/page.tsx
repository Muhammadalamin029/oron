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
  AdminTable,
  AdminTr,
  AdminTd,
  StatusBadge,
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
                  ? "bg-primary text-white"
                  : "bg-[#0a0a0a] border border-[#1a1a1a] text-muted-foreground hover:border-primary hover:text-primary",
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
          <AdminTable headers={["Title", "Link", "Products", "Status", "Created", "Action"]}>
            {filtered.map((link) => (
              <AdminTr
                key={link.id}
                onClick={() => router.push(`/admin/payment-links/${link.id}`)}
              >
                <AdminTd className="text-foreground font-semibold">
                  {link.title}
                </AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground text-xs truncate max-w-[140px]">
                      /pay/{link.slug}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyLink(link.slug);
                      }}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </AdminTd>
                <AdminTd>{link.items?.length ?? 0}</AdminTd>
                <AdminTd>
                  <StatusBadge status={link.is_active ? "active" : "inactive"} />
                </AdminTd>
                <AdminTd className="whitespace-nowrap">{formatDate(link.created_at)}</AdminTd>
                <AdminTd className="text-right">
                  <Link
                    href={`/admin/payment-links/${link.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground group-hover:text-primary transition-colors text-xs font-bold tracking-wider uppercase"
                  >
                    View
                  </Link>
                </AdminTd>
              </AdminTr>
            ))}
          </AdminTable>
        )}
      </GlassCard>
    </div>
  );
}
