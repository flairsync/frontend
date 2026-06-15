import React from 'react';
import { Button } from '@/components/ui/button';
import { Delete, DeleteIcon, Eraser } from 'lucide-react';

interface KeypadProps {
  onInput: (value: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export function Keypad({ onInput, onClear, onDelete, onAction, actionLabel }: KeypadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];

  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-sm mx-auto">
      {keys.map((key) => {
        if (key === 'C') {
          return (
            <Button
              key={key}
              variant="outline"
              size="lg"
              className="h-20 text-2xl font-bold text-destructive hover:bg-destructive/10"
              onClick={onClear}
            >
              {key}
            </Button>
          );
        }
        if (key === 'DEL') {
          return (
            <Button
              key={key}
              variant="outline"
              size="lg"
              className="h-20 text-2xl font-bold"
              onClick={onDelete}
            >
               <DeleteIcon />
            </Button>
          );
        }
        return (
          <Button
            key={key}
            variant="outline"
            size="lg"
            className="h-20 text-2xl font-bold"
            onClick={() => onInput(key)}
          >
            {key}
          </Button>
        );
      })}
      {onAction && (
        <Button
          className="col-span-3 h-16 text-xl font-bold mt-2"
          onClick={onAction}
        >
          {actionLabel || 'Confirm'}
        </Button>
      )}
    </div>
  );
}
