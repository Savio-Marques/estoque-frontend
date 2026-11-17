/*
 * MIT License
 * Copyright (c) 2026 Ryan Cuff
 * Portions copyright (c) 2026 Saurabh Chauhan
 * Repository: https://github.com/rjcuff/easeui
 */
"use client";

import { cn } from "@/lib/utils";

export interface NumberTickerProps {
  /** The number to display. */
  value: number;
  /** Formats the number before display. Default: grouped with commas. */
  format?: (value: number) => string;
  className?: string;
}

const defaultFormat = (value: number) => Math.round(value).toLocaleString("en-US");

/** Renders a tabular numeric value without per-character rolling animation. */
export function NumberTicker({ value, format = defaultFormat, className }: NumberTickerProps) {
  const text = format(value);
  return <span className={cn("inline-flex tabular-nums", className)}>{text}</span>;
}
