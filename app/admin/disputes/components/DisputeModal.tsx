"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dispute - {dispute.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Reason</p>
            <p className="font-medium">{dispute.reason}</p>
          </div>
          {dispute.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{dispute.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={dispute.status}
              onValueChange={async (value) => {
                try {
                  await disputesApi.updateDispute(dispute.id, { status: value });
                  toast.success("Updated");
                  await onUpdated();
                } catch (error: any) {
                  toast.error(error?.message || "Failed to update");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Resolution note</Label>
            <Textarea
              defaultValue={dispute.resolution_note || ""}
              placeholder="Optional note shown to user"
              onBlur={async (e) => {
                const value = e.target.value;
                try {
                  await disputesApi.updateDispute(dispute.id, { resolution_note: value });
                  await onUpdated();
                } catch (error: any) {
                  toast.error(error?.message || "Failed to update");
                }
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
