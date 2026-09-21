import type { LucideIcon } from "lucide-react";
import { clientOnly } from "vike-react/clientOnly";

import emptyBoxAnimation from "@/components/tutorials/animations/empty-box.json";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const LottiePlayer = clientOnly(() => import("@/components/shared/LottiePlayer"));

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  /**
   * The one thing to do from here. An empty screen that only says "no items"
   * leaves a first-time user with nowhere to go — which is exactly where
   * non-technical people give up.
   */
  action?: EmptyStateAction;
  /** A fallback route, e.g. "add a room first" before a table can exist. */
  secondaryAction?: EmptyStateAction;
  size?: number;
  className?: string;
}

function ActionButton({
  action,
  variant,
}: {
  action: EmptyStateAction;
  variant: "default" | "outline";
}) {
  const Icon = action.icon;
  const content = (
    <>
      {Icon && <Icon className="h-4 w-4" />}
      {action.label}
    </>
  );

  if (action.href) {
    return (
      <Button asChild variant={variant} className="gap-2">
        <a href={action.href}>{content}</a>
      </Button>
    );
  }

  return (
    <Button variant={variant} className="gap-2" onClick={action.onClick}>
      {content}
    </Button>
  );
}

export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  size = 96,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-10", className)}>
      <div style={{ width: size, height: size }}>
        <LottiePlayer animationData={emptyBoxAnimation} className="w-full h-full" />
      </div>
      <p className="font-medium text-sm mt-1">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {action && <ActionButton action={action} variant="default" />}
          {secondaryAction && <ActionButton action={secondaryAction} variant="outline" />}
        </div>
      )}
    </div>
  );
}

/**
 * The same thing, sized to drop into a table body in place of the usual
 * one-line "No items found" cell.
 */
export function TableEmptyState({
  colSpan,
  ...props
}: EmptyStateProps & { colSpan: number }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-2">
        <EmptyState {...props} size={72} />
      </TableCell>
    </TableRow>
  );
}

export default EmptyState;
