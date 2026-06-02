import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "primary" | "gold" | "none";
  hoverable?: boolean;
}

export function Card({
  className,
  glow = "none",
  hoverable = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-border rounded-xl p-5",
        glow === "primary" && "shadow-[0_0_20px_rgba(78,205,196,0.1)] border-primary/20",
        glow === "gold" && "shadow-[0_0_20px_rgba(255,215,0,0.1)] border-gold/20",
        hoverable &&
          "transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_25px_rgba(78,205,196,0.15)] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-text font-display font-semibold text-lg leading-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-text-muted text-sm mt-1", className)} {...props}>
      {children}
    </p>
  );
}
