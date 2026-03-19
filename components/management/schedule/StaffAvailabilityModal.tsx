import React from 'react';
import { useAvailability } from '@/features/shifts/useAvailability';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';

interface StaffAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  employmentId: string;
}

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const StaffAvailabilityModal: React.FC<StaffAvailabilityModalProps> = ({
  isOpen,
  onClose,
  employmentId,
}) => {
  const { availability, isLoadingAvailability, updateAvailability, isUpdating } = useAvailability(employmentId);

  const handleUpdate = async (dayOfWeek: number, startTime: string, endTime: string, isAvailable: boolean) => {
    await updateAvailability({
      employmentId,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recurring Weekly Availability</DialogTitle>
          <DialogDescription>
            Set your preferred working hours for each day of the week.
          </DialogDescription>
        </DialogHeader>

        {isLoadingAvailability ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {DAYS.map((day, idx) => {
              const config = availability?.find((a: any) => a.dayOfWeek === idx) || {
                startTime: '09:00',
                endTime: '17:00',
                isAvailable: true,
              };

              return (
                <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-32 font-medium">{day}</div>
                  
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`start-${idx}`} className="sr-only">Start</Label>
                      <Input
                        id={`start-${idx}`}
                        type="time"
                        value={config.startTime}
                        disabled={!config.isAvailable || isUpdating}
                        onChange={(e) => handleUpdate(idx, e.target.value, config.endTime, config.isAvailable)}
                        className="w-32"
                      />
                    </div>
                    
                    <span className="text-muted-foreground">to</span>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`end-${idx}`} className="sr-only">End</Label>
                      <Input
                        id={`end-${idx}`}
                        type="time"
                        value={config.endTime}
                        disabled={!config.isAvailable || isUpdating}
                        onChange={(e) => handleUpdate(idx, config.startTime, e.target.value, config.isAvailable)}
                        className="w-32"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor={`available-${idx}`}>Available</Label>
                    <Switch
                      id={`available-${idx}`}
                      checked={config.isAvailable}
                      onCheckedChange={(checked) => handleUpdate(idx, config.startTime, config.endTime, checked)}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
