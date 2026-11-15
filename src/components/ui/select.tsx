/*
 * MIT License
 * Copyright (c) 2026 Preet Suthar (https://github.com/preetsuthar17/hextaui)
 */
"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconSelector,
} from "@tabler/icons-react"
import { cva } from "class-variance-authority"
import { cn } from "cn"

type ClassName<State> =
  string | ((state: State) => string | undefined) | undefined

function mergeClassName<State>(base: string, className: ClassName<State>) {
  return typeof className === "function"
    ? (state: State) => cn(base, className(state))
    : cn(base, className)
}

const SelectTriggerContext =
  React.createContext<React.RefObject<HTMLElement | null> | null>(null)

function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectPrimitive.Root.Props<Value, Multiple>
) {
  const triggerRef = React.useRef<HTMLElement | null>(null)

  return (
    <SelectTriggerContext.Provider value={triggerRef}>
      <SelectPrimitive.Root {...props} />
    </SelectTriggerContext.Provider>
  )
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={mergeClassName("flex flex-col", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={mergeClassName(
        "flex min-w-0 flex-1 items-center gap-2 truncate text-start",
        className
      )}
      {...props}
    />
  )
}

const selectTriggerVariants = cva(
  "group/select-trigger inline-flex w-fit min-w-0 items-center justify-between gap-2 rounded-[0.625rem] border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] text-sm text-[var(--ledger-ink)] whitespace-nowrap transition-[color,background-color,box-shadow,border-color] duration-150 ease-out-cubic outline-none select-none focus-visible:border-[var(--ledger-accent)] focus-visible:bg-[var(--ledger-surface)] focus-visible:ring-3 focus-visible:ring-[var(--ledger-accent)]/20 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-placeholder:text-[var(--ledger-ink-subtle)] data-popup-open:border-[var(--ledger-accent)] data-popup-open:bg-[var(--ledger-surface)] pointer-coarse:text-[max(16px,1rem)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [@media(hover:hover)]:hover:bg-[var(--ledger-surface-hover)]",
  {
    variants: {
      size: {
        sm: "h-9 ps-3 pe-2",
        default: "h-[2.65rem] ps-3.5 pe-2.5 max-md:min-h-[2.85rem]",
        lg: "h-11 ps-3.5 pe-2.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type SelectTriggerProps = SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default" | "lg"
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ref,
  ...props
}: SelectTriggerProps) {
  const triggerRef = React.useContext(SelectTriggerContext)
  const setRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      if (triggerRef) {
        ;(triggerRef as React.MutableRefObject<HTMLElement | null>).current = node
      }
      if (typeof ref === "function") {
        ref(node)
        return
      }
      if (ref) {
        ;(ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
      }
    },
    [triggerRef, ref]
  )

  return (
    <SelectPrimitive.Trigger
      ref={setRef}
      data-slot="select-trigger"
      data-size={size}
      className={mergeClassName(selectTriggerVariants({ size }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        data-slot="select-icon"
        className="flex text-[var(--ledger-ink-subtle)] transition-colors group-data-popup-open/select-trigger:text-[var(--ledger-ink)]"
      >
        <IconSelector />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

type SelectContentProps = SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  > & {
    portalProps?: Omit<SelectPrimitive.Portal.Props, "children">
  }

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  dir,
  portalProps,
  ...props
}: SelectContentProps) {
  const triggerRef = React.useContext(SelectTriggerContext)
  const setPositioner = React.useCallback(
    (positioner: HTMLDivElement | null) => {
      const trigger = triggerRef?.current
      if (!positioner || dir !== undefined || !trigger?.isConnected) {
        return
      }
      if (getComputedStyle(trigger).direction === "rtl") {
        positioner.setAttribute("dir", "rtl")
      } else {
        positioner.removeAttribute("dir")
      }
    },
    [triggerRef, dir]
  )

  return (
    <SelectPrimitive.Portal {...portalProps}>
      <SelectPrimitive.Positioner
        ref={setPositioner}
        dir={dir}
        data-slot="select-positioner"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-[60] outline-none select-none focus-visible:outline-hidden"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={mergeClassName(
            "group/select-content relative isolate w-(--anchor-width) min-w-44 origin-(--transform-origin) overflow-hidden rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] text-[var(--ledger-ink)] shadow-xl outline-none [--select-item-radius:0.5rem] focus-visible:outline-hidden",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List
            data-slot="select-list"
            className="relative max-h-(--available-height) scroll-py-7 overflow-y-auto overscroll-none p-1.5 outline-none focus-visible:outline-hidden"
          >
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={mergeClassName(
        "px-2.5 pt-2 pb-1 text-xs font-semibold text-[var(--ledger-ink-subtle)]",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={mergeClassName(
        "group/select-item relative flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-(--select-item-radius) py-1.5 ps-2.5 pe-8 text-start text-sm text-[var(--ledger-ink)] outline-none select-none focus-visible:outline-hidden data-highlighted:bg-[var(--ledger-accent-soft)] data-highlighted:text-[var(--ledger-accent)] data-[selected]:font-semibold pointer-coarse:min-h-11 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText
        data-slot="select-item-text"
        className="flex min-w-0 flex-1 items-center gap-2 wrap-anywhere"
      >
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        keepMounted
        data-slot="select-item-indicator"
        className="absolute end-2.5 flex size-4 items-center justify-center opacity-0 transition-[opacity,scale] duration-150 ease-out-quint data-[selected]:opacity-100 motion-safe:scale-50 motion-safe:data-[selected]:scale-100 motion-reduce:transition-none"
      >
        <IconCheck className="text-[var(--ledger-accent)]" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={mergeClassName(
        "pointer-events-none -mx-1 my-1 h-px bg-[var(--ledger-border)]",
        className
      )}
      {...props}
    />
  )
}

const scrollArrowClassName =
  "absolute inset-x-0 z-1 flex h-7 cursor-default items-center justify-center text-[var(--ledger-ink-subtle)] [&_svg:not([class*='size-'])]:size-4"

function SelectScrollUpButton({
  className,
  ...props
}: SelectPrimitive.ScrollUpArrow.Props) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={mergeClassName(
        cn(
          scrollArrowClassName,
          "top-0 rounded-t-[inherit] bg-linear-to-b from-[var(--ledger-surface)] from-55% to-transparent"
        ),
        className
      )}
      {...props}
    >
      <IconChevronUp />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: SelectPrimitive.ScrollDownArrow.Props) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={mergeClassName(
        cn(
          scrollArrowClassName,
          "bottom-0 rounded-b-[inherit] bg-linear-to-t from-[var(--ledger-surface)] from-55% to-transparent"
        ),
        className
      )}
      {...props}
    >
      <IconChevronDown />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
}
export type { SelectContentProps, SelectTriggerProps }
