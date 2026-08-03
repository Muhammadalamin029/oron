"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Mail, Megaphone, Plus, Send, Users } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/lib/get-error-message";
import { formatDateTime } from "@/lib/status-utils";
import { newsletterApi } from "@/services/newsletter";
import {
  notificationsApi,
  type BroadcastMessage,
} from "@/services/notifications";

const emptyForm = {
  title: "System Update",
  subject: "Announcement",
  message: "",
  includeCustomers: false,
  includeNewsletter: false,
  customRecipients: "",
  unsubscribeUrl: "",
  isHtml: false,
};

export default function AdminBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const [form, setForm] = useState(emptyForm);

  const loadBroadcasts = async () => {
    const data = await notificationsApi.getBroadcasts();
    setBroadcasts(data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await loadBroadcasts();
        const subscribers = await newsletterApi.list();
        if (!cancelled) setSubscriberCount(subscribers.length);
      } catch (error: unknown) {
        if (!cancelled)
          toast.error(getErrorMessage(error, "Failed to load broadcast history"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const closeModal = () => {
    if (sendingRef.current) return;
    setOpen(false);
  };

  const handleSubmit = async () => {
    // Synchronous guard first — closes the race window a state-only check
    // leaves open between a fast double-click and the re-render that
    // disables the button (this is what caused broadcasts to send twice).
    if (sendingRef.current) return;

    if (!form.title.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Title, subject, and message are required.");
      return;
    }

    const customRecipients = form.customRecipients
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (!form.includeCustomers && !form.includeNewsletter && customRecipients.length === 0) {
      toast.error("Select at least one recipient group or add custom recipients.");
      return;
    }

    sendingRef.current = true;
    setSending(true);

    try {
      const result = await notificationsApi.sendBroadcast({
        title: form.title.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        include_customers: form.includeCustomers,
        include_newsletter: form.includeNewsletter,
        custom_recipients: customRecipients,
        is_html: form.isHtml,
        unsubscribe_url: form.unsubscribeUrl.trim() || undefined,
      });
      toast.success(`Broadcast sent to ${result.recipient_count} recipient${result.recipient_count === 1 ? "" : "s"}`);
      setForm(emptyForm);
      setOpen(false);
      await loadBroadcasts();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to send broadcast"));
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const totalRecipients = broadcasts.reduce((sum, item) => sum + item.recipient_count, 0);
  const customerSends = broadcasts.filter((item) => item.include_customers).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="BROADCAST"
        sub="/ CUSTOMER MESSAGES"
        action={
          <OrangeButton pill onClick={() => setOpen(true)}>
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> NEW BROADCAST
            </span>
          </OrangeButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile label="Total Sends" value={broadcasts.length} icon={Megaphone} />
        <StatTile label="Customers Included" value={customerSends} icon={Users} />
        <StatTile label="Recipients Reached" value={totalRecipients} icon={Mail} />
      </div>

      <GlassCard className="overflow-hidden">
        <SectionHeader title="RECENT BROADCASTS" sub="MESSAGE HISTORY" />
        {loading ? (
          <SkeletonRows count={4} height="h-14" />
        ) : broadcasts.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="h-8 w-8" />}
            title="No broadcasts sent yet"
            message="Send your first message to customers and newsletter subscribers."
            action={
              <OrangeButton onClick={() => setOpen(true)}>NEW BROADCAST</OrangeButton>
            }
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

      <AdminModal open={open} onClose={closeModal} title="SEND BROADCAST" maxWidth="sm:max-w-2xl">
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Title
            </label>
            <DarkInput
              value={form.title}
              onChange={(v) => setForm((p) => ({ ...p, title: v }))}
              placeholder="System Update"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Subject
            </label>
            <DarkInput
              value={form.subject}
              onChange={(v) => setForm((p) => ({ ...p, subject: v }))}
              placeholder="Announcement"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Message
            </label>
            <DarkTextarea
              value={form.message}
              onChange={(v) => setForm((p) => ({ ...p, message: v }))}
              placeholder="Write the announcement here..."
              rows={5}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Recipients
            </label>
            <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Registered customers</p>
                <p className="text-xs text-muted-foreground mt-0.5">All non-admin accounts</p>
              </div>
              <Switch
                checked={form.includeCustomers}
                onCheckedChange={(v) => setForm((p) => ({ ...p, includeCustomers: v }))}
              />
            </div>
            <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Newsletter subscribers</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {subscriberCount === null ? "Loading…" : `${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"}`}
                </p>
              </div>
              <Switch
                checked={form.includeNewsletter}
                onCheckedChange={(v) => setForm((p) => ({ ...p, includeNewsletter: v }))}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                Custom recipients (optional)
              </label>
              <DarkTextarea
                value={form.customRecipients}
                onChange={(v) => setForm((p) => ({ ...p, customRecipients: v }))}
                placeholder="customer@example.com, another@example.com"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#1a1a1a]">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                Unsubscribe URL (optional)
              </label>
              <DarkInput
                value={form.unsubscribeUrl}
                onChange={(v) => setForm((p) => ({ ...p, unsubscribeUrl: v }))}
                placeholder="https://your-site.com/unsubscribe"
              />
            </div>
            <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Send as HTML</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Message is treated as raw HTML instead of plain text
                </p>
              </div>
              <Switch
                checked={form.isHtml}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isHtml: v }))}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#1a1a1a] flex justify-end gap-4 bg-[#0a0a0a]/50 shrink-0">
          <button
            type="button"
            onClick={closeModal}
            disabled={sending}
            className="px-6 py-2 rounded-full border border-[#1a1a1a] text-muted-foreground text-[10px] font-bold tracking-widest uppercase hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            CANCEL
          </button>
          <OrangeButton onClick={handleSubmit} disabled={sending} pill className="px-8">
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
