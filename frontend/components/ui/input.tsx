import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm text-text-primary",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-text-muted",

          // Focus State
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 focus-visible:border-accent",

          // Disabled State
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
