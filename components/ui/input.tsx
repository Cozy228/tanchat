import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Zinc Cobalt input (designMd §5).
 *   Default  surface-container-low, no border.
 *   Active   2px Cobalt ghost border (ring-primary) + subtle outer glow,
 *            surface-container-lowest background. The tier lift + cobalt
 *            ring is the entire focus affordance — no outline, no border.
 *   Shape    rounded-md (more "tooled" than the xl cards around it).
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md bg-surface-container-low px-3 py-2 text-base text-foreground placeholder:text-on-surface-variant/60 focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:shadow-[var(--shadow-primary-glow)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
