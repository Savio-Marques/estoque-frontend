/*
 * MIT License
 * Copyright (c) 2026 Ryan Cuff
 * Portions copyright (c) 2026 Saurabh Chauhan
 * Repository: https://github.com/rjcuff/easeui
 */
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InsightCardTrend {
  /** A percentage or plain number; the sign is implied by direction, not this value. */
  value: number;
  direction: "up" | "down";
}

export interface InsightCardProps {
  label: string;
  /** The headline number. Pass a NumberTicker for it to roll in on change. */
  value: ReactNode;
  subtitle?: ReactNode;
  trend?: InsightCardTrend;
  icon?: ReactNode;
  className?: string;
}

/** A stat tile: a label, a headline value, an optional subtitle, and an optional trend pill. */
export function InsightCard({
  label,
  value,
  subtitle,
  trend,
  icon,
  className,
}: InsightCardProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-between gap-2.5 rounded-2xl bg-card p-4 shadow-[0_0_0_1px_var(--border)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
        {icon ? (
          <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display truncate text-2xl font-semibold leading-tight tabular-nums text-foreground">
            {value}
          </span>
          {trend ? (
            <span
              className={cn(
                "mb-0.5 inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                trend.direction === "up" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
              ) : (
                <ArrowDownRight aria-hidden="true" className="h-3 w-3" />
              )}
              {trend.value}%
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <div className="font-mono-tabular mt-1 truncate text-[0.72rem] font-medium text-[var(--ledger-ink-subtle)]">
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}
