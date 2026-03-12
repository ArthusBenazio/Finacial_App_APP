import { usePrivateMode } from "@/hooks/use-private-mode";
import { cn } from "@/lib/utils";

export function PrivateValue({ value, className }: { value: string | React.ReactNode; className?: string }) {
  const { isPrivate } = usePrivateMode();
  return (
    <span className={cn(isPrivate ? "blur-value" : "", className)}>
      {value}
    </span>
  );
}
