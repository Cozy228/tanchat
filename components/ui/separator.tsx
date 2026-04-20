import { Separator as BaseSeparator } from "@base-ui/react/separator";
import * as React from "react";

import { cn } from "@/lib/utils";

type SeparatorProps = React.ComponentPropsWithoutRef<typeof BaseSeparator> & {
  decorative?: boolean;
};

/*
 * Ghost separator per designMd §4 — outline-variant at 15% opacity.
 * Use sparingly: Zinc Cobalt prefers white space and tier shifts over
 * rules. If you find yourself reaching for this, consider a
 * `surface-container-low` strip instead (designMd Don'ts §6).
 */
const Separator = React.forwardRef<React.ElementRef<typeof BaseSeparator>, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <BaseSeparator
      aria-hidden={decorative || undefined}
      className={cn(
        "shrink-0 bg-outline-variant/15",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      orientation={orientation}
      ref={ref}
      {...props}
    />
  ),
);
Separator.displayName = "Separator";

export { Separator };
