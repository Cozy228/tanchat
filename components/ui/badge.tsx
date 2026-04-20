import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Zinc Cobalt chips (designMd §5). Small, rounded-full, "lab-labeled":
 * surface-container-highest + on-surface is the neutral default — it
 * reads as a quiet metadata pill. The vibrant primary-container tier
 * (#001aff) is deliberately *not* the default; it's too loud for status.
 *
 *   default     surface-container-highest + on-surface (neutral label)
 *   primary     Electric Cobalt container — opt-in for "active / live"
 *   destructive error-container — for failure states
 *   outline     ghost border at 15%, for segmented contexts
 *
 * Label typography uses uppercase + tracking for the technical feel
 * designMd §3 calls for.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-surface-container-highest text-on-surface",
        primary: "bg-primary-container text-on-primary-container",
        secondary: "bg-surface-container-high text-on-surface-variant",
        destructive: "bg-error-container text-on-error-container",
        outline: "border border-outline-variant/15 text-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
