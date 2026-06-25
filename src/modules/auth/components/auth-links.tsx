import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Small uppercase mono link — the utility/coordinate voice (e.g. "Forgot password"). */
export function MonoLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-150 ease-out hover:text-brass-soft",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** The "Already have an account? Sign in" prompt that closes most auth plates. */
export function AltPrompt({
  prompt,
  to,
  action,
}: {
  prompt: string;
  to: string;
  action: string;
}) {
  return (
    <p className="text-center text-[13px] text-muted-foreground">
      {prompt}{" "}
      <Link
        to={to}
        className="text-foreground underline decoration-[color-mix(in_srgb,var(--brass)_50%,transparent)] underline-offset-4"
      >
        {action}
      </Link>
    </p>
  );
}
