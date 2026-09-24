import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      data-slot="input"
      className={cn(
        "min-h-11 w-full rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-foreground shadow-none outline-none transition-colors placeholder:text-muted/70 focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-accent",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
