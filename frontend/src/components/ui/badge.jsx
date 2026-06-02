import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-[var(--rs-brand-border)] bg-[var(--rs-brand-muted)] text-[var(--rs-brand-primary-light)] [a&]:hover:bg-primary/20",
        secondary:
          "border-border bg-secondary text-secondary-foreground [a&]:hover:bg-surface-hover",
        destructive:
          "border-[var(--rs-danger-border)] bg-[var(--rs-danger-muted)] text-[var(--rs-status-danger)] focus-visible:ring-destructive/25 [a&]:hover:bg-destructive/20",
        danger:
          "border-[var(--rs-danger-border)] bg-[var(--rs-danger-muted)] text-[var(--rs-status-danger)]",
        success:
          "border-[var(--rs-success-border)] bg-[var(--rs-success-muted)] text-[var(--rs-status-success)]",
        warning:
          "border-[var(--rs-warning-border)] bg-[var(--rs-warning-muted)] text-[var(--rs-status-warning)]",
        info:
          "border-[var(--rs-info-border)] bg-[var(--rs-info-muted)] text-[var(--rs-status-info)]",
        outline:
          "border-border bg-transparent text-secondary-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
