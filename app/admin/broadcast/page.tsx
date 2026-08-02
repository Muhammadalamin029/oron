"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock3,
  Mail,
  Megaphone,
  Plus,
  Send,
  Users,
} from "lucide-react";

import { AdminPageHeader, GlassCard } from "@/components/admin-ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  notificationsApi,
  type BroadcastMessage,
  type BroadcastPayload,
} from "@/services/notifications";

const emptyForm = {
  title: "",
  subject: "",
  message: "",
  include_customers: true,
  custom_recipients: "",
  is_html: false,
  unsubscribe_url: "",
};

export default function AdminBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadBroadcasts = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getBroadcasts();
      setBroadcasts(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load broadcasts"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBroadcasts();
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Title, subject, and message are required.");
      return;
    }

    const recipients = form.custom_recipients
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (recipients.length === 0 && !form.include_customers) {
      toast.error("Add at least one email or include customers.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: BroadcastPayload = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        include_customers: form.include_customers,
        custom_recipients: recipients,
        is_html: form.is_html,
        unsubscribe_url: form.unsubscribe_url.trim() || undefined,
      };

      await notificationsApi.sendBroadcast(payload);
      toast.success("Broadcast sent successfully.");
      setForm(emptyForm);
      setOpen(false);
      await loadBroadcasts();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to send broadcast"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="BROADCAST"
        sub="/ CUSTOMER MESSAGES"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition hover:opacity-90">
                <Plus className="h-4 w-4" />
                New broadcast
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl bg-[#111111] border border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">
                  Create broadcast
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Send a message to selected customers or your full customer
                  list.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Title
                    </label>
                    <input
                      value={form.title}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
                      placeholder="Flash sale this week"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Subject line
                    </label>
                    <input
                      value={form.subject}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          subject: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-primary"
                      placeholder="Your ORON update is here"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Message
                    </label>
                    <textarea
                      rows={7}
                      value={form.message}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          message: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-primary"
                      placeholder="Write the announcement here..."
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Custom recipients
                    </label>
                    <textarea
                      rows={3}
                      value={form.custom_recipients}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          custom_recipients: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-primary"
                      placeholder="customer@example.com, another@example.com"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Include all customers
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Send to every non-admin customer in the database.
                      </p>
                    </div>
                    <Switch
                      checked={form.include_customers}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          include_customers: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Unsubscribe link (optional)
                  </label>
                  <input
                    value={form.unsubscribe_url}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        unsubscribe_url: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-primary"
                    placeholder="https://your-site.com/unsubscribe"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.is_html}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        is_html: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-white/20 bg-black/20 text-primary"
                  />
                  Send as HTML content
                </label>
              </div>

              <DialogFooter className="pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground transition hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Sending..." : "Send broadcast"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Total sends
              </p>
              <p className="mt-2 text-3xl font-display text-white">
                {broadcasts.length}
              </p>
            </div>
            <div className="rounded-full bg-primary/15 p-3 text-primary">
              <Megaphone className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Customers included
              </p>
              <p className="mt-2 text-3xl font-display text-white">
                {broadcasts.filter((item) => item.include_customers).length}
              </p>
            </div>
            <div className="rounded-full bg-emerald-500/15 p-3 text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Recipients reached
              </p>
              <p className="mt-2 text-3xl font-display text-white">
                {broadcasts.reduce(
                  (sum, item) => sum + item.recipient_count,
                  0,
                )}
              </p>
            </div>
            <div className="rounded-full bg-blue-500/15 p-3 text-blue-400">
              <Mail className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="border-b border-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/15 p-2 text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Recent broadcasts
              </h3>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Message history
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">
            Loading broadcasts...
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            No broadcasts yet. Send your first message to customers.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {broadcasts.map((item) => (
              <div key={item.id} className="p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                      {item.subject}
                    </p>
                    <h4 className="mt-1 text-xl font-semibold text-white">
                      {item.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-secondary-text">
                  {item.message}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    <Users className="h-3.5 w-3.5" />
                    {item.recipient_count} recipients
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    {item.include_customers
                      ? "Includes all customers"
                      : "Custom recipients only"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    By {item.sent_by_admin}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
