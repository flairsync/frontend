import { clientOnly } from "vike-react/clientOnly";
import emptyBoxAnimation from "@/components/tutorials/animations/empty-box.json";
import { cn } from "@/lib/utils";

const LottiePlayer = clientOnly(() => import("@/components/shared/LottiePlayer"));

interface EmptyStateProps {
  title: string;
  description?: string;
  size?: number;
  className?: string;
}

export function EmptyState({ title, description, size = 96, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-10", className)}>
      <div style={{ width: size, height: size }}>
        <LottiePlayer animationData={emptyBoxAnimation} className="w-full h-full" />
      </div>
      <p className="font-medium text-sm mt-1">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>}
    </div>
  );
}

export default EmptyState;
