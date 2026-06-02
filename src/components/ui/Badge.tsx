import { cn } from "@/lib/utils";

type BadgeVariant = "common" | "uncommon" | "rare" | "epic" | "legendary" | "default";
type BadgeSize = "sm" | "md";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  common: "bg-[#8B949E]/15 text-[#8B949E] border-[#8B949E]/30",
  uncommon: "bg-success/15 text-success border-success/30",
  rare: "bg-info/15 text-info border-info/30",
  epic: "bg-[#BC8CFF]/15 text-[#BC8CFF] border-[#BC8CFF]/30",
  legendary: "bg-gold/15 text-gold border-gold/30",
  default: "bg-bg-elevated text-text-muted border-border",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
