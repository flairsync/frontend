import React from 'react';
import { useTranslation } from 'react-i18next';
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

export const StaffAvailabilityModal: React.FC<StaffAvailabilityModalProps> = ({
  isOpen,
  onClose,
  employmentId,
}) => {
  const { t } = useTranslation("management");
  const { availability, isLoadingAvailability, updateAvailability, isUpdating } = useAvailability(employmentId);

  const DAYS = [
    t("schedule_modals.staff_availability.days.sunday"),
    t("schedule_modals.staff_availability.days.monday"),
    t("schedule_modals.staff_availability.days.tuesday"),
    t("schedule_modals.staff_availability.days.wednesday"),
    t("schedule_modals.staff_availability.days.thursday"),
    t("schedule_modals.staff_availability.days.friday"),
    t("schedule_modals.staff_availability.days.saturday"),
  ];

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
          <DialogTitle>{t("schedule_modals.staff_availability.title")}</DialogTitle>
          <DialogDescription>
            {t("schedule_modals.staff_availability.description")}
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
                      <Label htmlFor={`start-${idx}`} className="sr-only">{t("schedule_modals.staff_availability.start_label")}</Label>
                      <Input
                        id={`start-${idx}`}
                        type="time"
                        value={config.startTime}
                        disabled={!config.isAvailable || isUpdating}
                        onChange={(e) => handleUpdate(idx, e.target.value, config.endTime, config.isAvailable)}
                        className="w-32"
                      />
                    </div>

                    <span className="text-muted-foreground">{t("schedule_modals.staff_availability.to")}</span>

                    <div className="flex items-center gap-2">
                      <Label htmlFor={`end-${idx}`} className="sr-only">{t("schedule_modals.staff_availability.end_label")}</Label>
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
                    <Label htmlFor={`available-${idx}`}>{t("schedule_modals.staff_availability.available_label")}</Label>
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
