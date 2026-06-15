import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AttendanceRecord } from "@/lib/attendanceUtils";

interface AttendanceNotesModalProps {
  record: AttendanceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recordId: string, note: string) => void;
}

const AttendanceNotesModal = ({ record, open, onOpenChange, onSave }: AttendanceNotesModalProps) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (record) {
      setNote(record.note || "");
    }
  }, [record, open]);

  const handleSave = () => {
    if (!record) return;
    onSave(record.id, note);
    onOpenChange(false);
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Attendance Note</DialogTitle>
          <DialogDescription>
            Add a note about the shift for {record.employee.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="e.g. Traffic delay, Personal leave, Worked through lunch..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceNotesModal;
