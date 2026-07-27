"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { disputesApi } from "@/services/disputes";
import type { Dispute } from "@/types/api";

const STATUSES = ["open", "under_review", "resolved", "rejected"];

export function DisputeModal({
  dispute,
  onUpdated,
}: {
  dispute: Dispute;
  onUpdated: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(dispute.resolution_note || "");

  const updateStatus = async (value: string) => {
    try {
      await disputesApi.updateDispute(dispute.id, { status: value });
      toast.success("Dispute updated");
      await onUpdated();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update");
    }
  };

  const saveNote = async () => {
    try {
      await disputesApi.updateDispute(dispute.id, { resolution_note: note });
      toast.success("Note saved");
      await onUpdated();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save note");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border border-[#353534] text-[#9a9898] hover:text-white hover:border-[#ff6b00] transition-colors px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
      >
        View
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/5 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]/50">
              <h3 className="font-display font-bold text-xl text-white tracking-tight">
                DISPUTE{" "}
                <span className="text-[#9a9898] font-mono text-base">
                  / #{dispute.id.slice(0, 10).toUpperCase()}
                </span>
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-[#9a9898] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">
                  Reason
                </p>
                <p className="text-white font-semibold">{dispute.reason}</p>
              </div>

              {dispute.description && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">
                    Description
                  </p>
                  <p className="text-sm text-[#e5e2e1] leading-relaxed">{dispute.description}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-2">
                  Status
                </p>
                <select
                  value={dispute.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all appearance-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-2">
                  Resolution Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={saveNote}
                  placeholder="Optional note shown to the customer"
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
