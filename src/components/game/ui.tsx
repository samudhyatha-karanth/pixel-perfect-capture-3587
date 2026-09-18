import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "soft";

export function GameButton({
  variant = "soft",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={cn(
        "relative inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-bold tracking-wide transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-[image:var(--gradient-marigold)] text-primary-foreground glow-ring hover:brightness-110",
        variant === "soft" && "surface text-foreground hover:border-primary/60",
        variant === "ghost" && "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function StatPill({ label, value, emoji }: { label: string; value: ReactNode; emoji: string }) {
  return (
    <div className="surface flex min-w-0 items-center gap-2 rounded-2xl px-3 py-2">
      <span className="shrink-0 text-lg">{emoji}</span>
      <div className="min-w-0">
        <p className="truncate text-[0.65rem] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full bg-[image:var(--gradient-gold)] transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}

export function Panel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 backdrop-blur-sm sm:items-center">
      <div className="surface max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="truncate text-xl font-extrabold text-festival">{title}</h2>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
