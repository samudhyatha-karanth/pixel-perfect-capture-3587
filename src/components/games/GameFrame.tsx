import type { ReactNode } from "react";
import { X } from "lucide-react";

export function GameFrame({
  title,
  hint,
  score,
  meta,
  onExit,
  children,
  footer,
}: {
  title: string;
  hint: string;
  score: number;
  meta?: ReactNode;
  onExit: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col rangoli-bg px-4 py-4">
      <header className="mx-auto grid w-full max-w-md grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <button onClick={onExit} className="surface grid size-10 shrink-0 place-items-center rounded-full">
          <X className="size-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-festival">{title}</h1>
          <p className="truncate text-[0.7rem] text-muted-foreground">{hint}</p>
        </div>
        <div className="surface shrink-0 rounded-2xl px-3 py-1.5 text-center">
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">Score</p>
          <p className="text-base font-extrabold">{score}</p>
        </div>
      </header>

      {meta && <div className="mx-auto mt-3 w-full max-w-md">{meta}</div>}

      <main className="mx-auto mt-3 w-full max-w-md flex-1">{children}</main>

      {footer && <div className="mx-auto w-full max-w-md pt-3">{footer}</div>}
    </div>
  );
}

export type MiniGameProps = {
  onExit: () => void;
  onFinish: (score: number) => void;
};
