"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Bell,
  CheckCircle,
  Clock,
  Package,
  CreditCard,
  AlertTriangle,
  Headphones,
  Send,
  Radio,
  ShoppingBag,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { notificationsApi, type BroadcastMessage } from "@/services/notifications";
import { newsletterApi } from "@/services/newsletter";
import type { Notification } from "@/types/api";
import {
  AdminPageHeader,
  GlassCard,
  SectionHeader,
  SkeletonRows,
  EmptyState,
  StatTile,
  OrangeButton,
  DarkInput,
  DarkTextarea,
  AdminModal,
  AdminTable,
  AdminTr,
  AdminTd,
} from "@/components/admin-ui";
import { formatDateTime } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/get-error-message";

const ICONS: Record<string, typeof Bell> = {
  order: Package,
  payment: CreditCard,
  dispute: AlertTriangle,
  support: Headphones,
  product: ShoppingBag,
};

const ICON_COLORS: Record<string, string> = {
  order: "bg-blue-900/20 text-blue-400",
  payment: "bg-green-900/20 text-green-400",
  dispute: "bg-red-900/20 text-red-400",
  support: "bg-amber-900/20 text-amber-400",
  product: "bg-purple-900/20 text-purple-400",
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [broadcastsLoading, setBroadcastsLoading] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("System Update");
  const [broadcastSubject, setBroadcastSubject] = useState("Announcement");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [includeCustomers, setIncludeCustomers] = useState(false);
  const [includeNewsletter, setIncludeNewsletter] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await notificationsApi.getNotifications();
        if (!cancelled) setNotifications(data);
      } catch (error: unknown) {
        if (!cancelled)
          toast.error(getErrorMessage(error, "Failed to load notifications"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadBroadcasts = async () => {
    const data = await notificationsApi.getBroadcasts();
    setBroadcasts(data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setBroadcastsLoading(true);
        await loadBroadcasts();
        const subscribers = await newsletterApi.list();
        if (!cancelled) setSubscriberCount(subscribers.length);
      } catch (error: unknown) {
        if (!cancelled)
          toast.error(getErrorMessage(error, "Failed to load broadcast history"));
      } finally {
        if (!cancelled) setBroadcastsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(unread.map((n) => notificationsApi.markAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const closeBroadcastModal = () => {
    if (sending) return;
    setBroadcastOpen(false);
  };

  const handleBroadcast = async () => {
    const title = broadcastTitle.trim() || "System Update";
    const subject = broadcastSubject.trim() || "Announcement";

    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message before sending the broadcast.");
      return;
    }

    if (!includeCustomers && !includeNewsletter) {
      toast.error("Select at least one recipient group.");
      return;
    }

    try {
      setSending(true);
      const result = await notificationsApi.sendBroadcast({
        title,
        subject,
        message: broadcastMessage.trim(),
        include_customers: includeCustomers,
        include_newsletter: includeNewsletter,
      });
      toast.success(`Broadcast sent to ${result.recipient_count} recipient${result.recipient_count === 1 ? "" : "s"}`);
      setBroadcastTitle("System Update");
      setBroadcastSubject("Announcement");
      setBroadcastMessage("");
      setIncludeCustomers(false);
      setIncludeNewsletter(false);
      setBroadcastOpen(false);
      await loadBroadcasts();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send broadcast"));
    } finally {
      setSending(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const stats = [
    { label: "Total", value: notifications.length },
    { label: "Unread", value: unreadCount, accent: true },
    {
      label: "Orders",
      value: notifications.filter((n) => n.type === "order").length,
    },
    {
      label: "Disputes",
      value: notifications.filter((n) => n.type === "dispute").length,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="NOTIFICATIONS"
        sub="/ SYSTEM ALERTS"
        action={
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="border border-border text-muted-foreground hover:text-white hover:border-primary transition-colors px-6 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase"
              >
                Mark All Read
              </button>
            )}
            <OrangeButton pill onClick={() => setBroadcastOpen(true)}>
              <span className="flex items-center gap-2">
                <Radio className="h-4 w-4" /> SEND BROADCAST
              </span>
            </OrangeButton>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatTile
            key={stat.label}
            label={stat.label}
            value={stat.value}
            highlight={stat.accent}
          />
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        {loading ? (
          <SkeletonRows count={5} height="h-16" />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-8 w-8" />}
            title="No notifications yet"
            message="You'll see notifications here when important events occur."
          />
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-4 p-5",
                    !n.is_read && "bg-white/2",
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                      ICON_COLORS[n.type] ||
                        "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white text-sm">
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded border border-border uppercase tracking-widest text-[9px] font-bold">
                        {n.type}
                      </span>
                    </div>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                      aria-label="Mark as read"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <SectionHeader title="BROADCAST HISTORY" sub="PAST ANNOUNCEMENTS" />
        {broadcastsLoading ? (
          <SkeletonRows count={3} height="h-14" />
        ) : broadcasts.length === 0 ? (
          <EmptyState
            icon={<Radio className="h-8 w-8" />}
            title="No broadcasts sent yet"
            message="Announcements you send will show up here."
          />
        ) : (
          <AdminTable headers={["Subject", "Recipients", "Sent To", "Date"]}>
            {broadcasts.map((b) => (
              <AdminTr key={b.id}>
                <AdminTd className="font-medium text-white">
                  {b.subject}
                  <p className="text-xs text-muted-foreground mt-0.5 font-normal">{b.title}</p>
                </AdminTd>
                <AdminTd mono>{b.recipient_count}</AdminTd>
                <AdminTd>
                  <div className="flex flex-wrap gap-1.5">
                    {b.include_customers && (
                      <span className="px-2 py-0.5 rounded border border-border text-[9px] font-bold uppercase tracking-widest">
                        Customers
                      </span>
                    )}
                    {b.include_newsletter && (
                      <span className="px-2 py-0.5 rounded border border-border text-[9px] font-bold uppercase tracking-widest">
                        Newsletter
                      </span>
                    )}
                  </div>
                </AdminTd>
                <AdminTd className="whitespace-nowrap">{formatDateTime(b.created_at)}</AdminTd>
              </AdminTr>
            ))}
          </AdminTable>
        )}
      </GlassCard>

      <AdminModal
        open={broadcastOpen}
        onClose={closeBroadcastModal}
        title="SEND BROADCAST"
      >
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Title
            </label>
            <DarkInput
              value={broadcastTitle}
              onChange={setBroadcastTitle}
              placeholder="System Update"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Subject
            </label>
            <DarkInput
              value={broadcastSubject}
              onChange={setBroadcastSubject}
              placeholder="Announcement"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Message
            </label>
            <DarkTextarea
              value={broadcastMessage}
              onChange={setBroadcastMessage}
              placeholder="Enter your message here..."
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Recipients
            </label>
            <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Registered customers</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All non-admin accounts
                </p>
              </div>
              <Switch checked={includeCustomers} onCheckedChange={setIncludeCustomers} />
            </div>
            <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Newsletter subscribers</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {subscriberCount === null ? "Loading…" : `${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"}`}
                </p>
              </div>
              <Switch checked={includeNewsletter} onCheckedChange={setIncludeNewsletter} />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#1a1a1a] flex justify-end gap-4 bg-[#0a0a0a]/50 shrink-0">
          <button
            type="button"
            onClick={closeBroadcastModal}
            disabled={sending}
            className="px-6 py-2 rounded-full border border-[#1a1a1a] text-muted-foreground text-[10px] font-bold tracking-widest uppercase hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            CANCEL
          </button>
          <OrangeButton onClick={handleBroadcast} disabled={sending} pill className="px-8">
            <span className="flex items-center gap-2">
              <Send className="h-3.5 w-3.5" />
              {sending ? "SENDING..." : "SEND"}
            </span>
          </OrangeButton>
        </div>
      </AdminModal>
    </div>
  );
}
