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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parseISO, setHours, setMinutes } from "date-fns";
import { AttendanceRecord } from "@/lib/attendanceUtils";

interface EditAttendanceModalProps {
  record: AttendanceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recordId: string, clockIn: string | null, clockOut: string | null) => void;
}

const EditAttendanceModal = ({ record, open, onOpenChange, onSave }: EditAttendanceModalProps) => {
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");

  useEffect(() => {
    if (record) {
      setClockIn(record.clock_in ? format(parseISO(record.clock_in), "HH:mm") : "");
      setClockOut(record.clock_out ? format(parseISO(record.clock_out), "HH:mm") : "");
    }
  }, [record, open]);

  const handleSave = () => {
    if (!record) return;

    const baseDate = parseISO(record.planned_start);
    
    let newClockIn: string | null = null;
    if (clockIn) {
      const [h, m] = clockIn.split(":").map(Number);
      newClockIn = format(setMinutes(setHours(baseDate, h), m), "yyyy-MM-dd'T'HH:mm:ssXXX");
    }

    let newClockOut: string | null = null;
    if (clockOut) {
      const [h, m] = clockOut.split(":").map(Number);
      newClockOut = format(setMinutes(setHours(baseDate, h), m), "yyyy-MM-dd'T'HH:mm:ssXXX");
    }

    onSave(record.id, newClockIn, newClockOut);
    onOpenChange(false);
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
          <DialogDescription>
            Adjust clock-in and clock-out times for {record.employee.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clock_in" className="text-right">
              Clock In
            </Label>
            <Input
              id="clock_in"
              type="time"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clock_out" className="text-right">
              Clock Out
            </Label>
            <Input
              id="clock_out"
              type="time"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAttendanceModal;
