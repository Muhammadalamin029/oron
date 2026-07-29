"use client";

import { useState } from "react";
import { toast } from "sonner";
import { disputesApi } from "@/services/disputes";
import type { Dispute } from "@/types/api";
import { AdminModal } from "@/components/admin-ui";
import { getErrorMessage } from "@/lib/get-error-message"

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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update"));
    }
  };

  const saveNote = async () => {
    try {
      await disputesApi.updateDispute(dispute.id, { resolution_note: note });
      toast.success("Note saved");
      await onUpdated();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save note"));
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border border-border text-muted-foreground hover:text-white hover:border-primary transition-colors px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
      >
        View
      </button>

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm:max-w-lg"
        title={
          <>
            DISPUTE{" "}
            <span className="text-muted-foreground font-mono text-base">
              / #{dispute.id.slice(0, 10).toUpperCase()}
            </span>
          </>
        }
      >
        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">
              Reason
            </p>
            <p className="text-white font-semibold">{dispute.reason}</p>
          </div>

          {dispute.description && (
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed">{dispute.description}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2">
              Status
            </p>
            <select
              value={dispute.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-foreground px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-primary transition-all appearance-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2">
              Resolution Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={saveNote}
              placeholder="Optional note shown to the customer"
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-foreground placeholder:text-border px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>
        </div>
      </AdminModal>
    </>
  );
}
