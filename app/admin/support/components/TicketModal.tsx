"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { supportApi } from "@/services/support";
import type { SupportTicket } from "@/types/api";
import { StatusBadge, OrangeButton } from "@/components/admin-ui";
import { getErrorMessage } from "@/lib/get-error-message"

const STATUSES = ["open", "answered", "closed"];

export function TicketModal({
  ticketId,
  subject,
  onUpdated,
}: {
  ticketId: string;
  subject: string;
  onUpdated: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const openModal = async () => {
    setOpen(true);
    try {
      const data = await supportApi.getTicket(ticketId);
      setTicket(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load ticket"));
    }
  };

  const closeModal = () => {
    setOpen(false);
    setTicket(null);
    setReply("");
  };

  const updateStatus = async (value: string) => {
    try {
      await supportApi.updateTicket(ticketId, { status: value });
      setTicket((prev) => (prev ? { ...prev, status: value } : prev));
      toast.success("Ticket updated");
      await onUpdated();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update"));
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    try {
      setSending(true);
      await supportApi.addMessage(ticketId, reply.trim());
      setReply("");
      toast.success("Reply sent");
      const fresh = await supportApi.getTicket(ticketId);
      setTicket(fresh);
      await onUpdated();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to send reply"));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="border border-[#353534] text-[#9a9898] hover:text-white hover:border-[#ff6b00] transition-colors px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
      >
        View
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/5 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]/50">
              <h3 className="font-display font-bold text-xl text-white tracking-tight">
                TICKET{" "}
                <span className="text-[#9a9898] font-mono text-base">
                  / #{ticketId.slice(0, 10).toUpperCase()}
                </span>
              </h3>
              <button
                onClick={closeModal}
                className="text-[#9a9898] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!ticket ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 rounded bg-[#1c1b1b] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">
                      Subject
                    </p>
                    <p className="text-white font-semibold">{subject}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">
                      Email
                    </p>
                    <p className="text-sm text-[#e5e2e1]">{ticket.email || "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-2">
                    Status
                  </p>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={ticket.status} />
                    <select
                      value={ticket.status}
                      onChange={(e) => updateStatus(e.target.value)}
                      className="bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all appearance-none"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[#ff6b00] uppercase mb-3">
                    Conversation
                  </p>
                  <div className="space-y-3">
                    {(ticket.messages || []).length === 0 ? (
                      <p className="text-sm text-[#9a9898]">No messages yet.</p>
                    ) : (
                      ticket.messages!.map((m) => (
                        <div
                          key={m.id}
                          className={`rounded-lg border border-white/5 p-4 ${
                            m.sender === "admin" ? "bg-[#ff6b00]/5" : "bg-[#0a0a0a]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1.5">
                            <p className="text-xs font-bold tracking-widest uppercase text-white">
                              {m.sender === "admin" ? "Admin" : "Customer"}
                            </p>
                            <p className="text-[11px] text-[#9a9898]">
                              {m.created_at ? new Date(m.created_at).toLocaleString("en-NG") : ""}
                            </p>
                          </div>
                          <p className="text-sm text-[#e5e2e1] whitespace-pre-line">{m.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-2">
                    Reply
                  </label>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply..."
                    disabled={sending}
                    rows={3}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all resize-none mb-3"
                  />
                  <OrangeButton onClick={sendReply} disabled={sending || !reply.trim()}>
                    {sending ? "SENDING..." : "SEND REPLY"}
                  </OrangeButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
