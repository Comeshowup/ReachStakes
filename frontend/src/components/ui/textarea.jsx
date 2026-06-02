import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-md border border-input bg-surface-input px-3 py-2 text-base text-foreground shadow-xs transition-[border-color,background-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground hover:border-border focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:bg-muted disabled:text-disabled disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-destructive/25 md:text-sm",
        className
      )}
      {...props} />
  );
}

export { Textarea }
