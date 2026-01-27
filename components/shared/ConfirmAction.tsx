import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type ConfirmActionProps = {
  onConfirm: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  storageKey?: string;
};

export const ConfirmAction: React.FC<ConfirmActionProps> = ({
  onConfirm,
  children,
  title = 'Confirm action?',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  storageKey,
}) => {
  const [open, setOpen] = React.useState(false);
  const [neverAsk, setNeverAsk] = React.useState(false);

  const skipConfirm =
    storageKey && localStorage.getItem(storageKey) === 'true';

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (skipConfirm) {
      onConfirm();
      return;
    }

    setOpen(true);
  };

  const handleConfirm = () => {
    if (neverAsk && storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    onConfirm();
    setOpen(false);
    setNeverAsk(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Anchor ONLY – no automatic open */}
      <PopoverTrigger asChild>
        <span onClick={handleTriggerClick}>
          {children}
        </span>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        className="w-64 space-y-3"
        onInteractOutside={() => setOpen(false)}
      >
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>

        {storageKey && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="never-confirm"
              checked={neverAsk}
              onCheckedChange={(v) => setNeverAsk(!!v)}
            />
            <label
              htmlFor="never-confirm"
              className="text-xs text-zinc-600 cursor-pointer"
            >
              Never show again
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {cancelText}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
