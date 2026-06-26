import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'default',
}: ConfirmationModalProps) {
  const { t } = useTranslation('pos');
  const resolvedConfirmLabel = confirmLabel ?? t('confirmation_modal.confirm');
  const resolvedCancelLabel = cancelLabel ?? t('confirmation_modal.cancel');
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4 py-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            variant === 'destructive' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
          }`}>
            {variant === 'destructive' ? <AlertTriangle className="h-8 w-8" /> : <HelpCircle className="h-8 w-8" />}
          </div>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-center text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button variant="outline" className="flex-1 h-12 font-bold" onClick={onClose}>
            {resolvedCancelLabel}
          </Button>
          <Button
            variant={variant}
            className="flex-1 h-12 font-bold"
            onClick={() => {
                onConfirm();
                onClose();
            }}
          >
            {resolvedConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
