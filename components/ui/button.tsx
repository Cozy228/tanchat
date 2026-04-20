import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Zinc Cobalt button mapping (designMd §5).
 *
 *   default     Cobalt gradient, rounded-xl, no border. Reserved for the
 *               single primary action in view — "if everything is Cobalt,
 *               nothing is Cobalt".
 *   secondary   surface-container-highest tier. The tactile "zinc" button;
 *               on-surface text, no border.
 *   ghost       No surface at rest. Hover lifts to a subtle tier. Used for
 *               header chrome and iconography where ink is enough.
 *   destructive Error solid, same gradient energy as primary.
 *   outline     Opt-in ghost border (outline-variant @ 15%) for
 *               segmented controls. Still avoided in chrome.
 *   link        Tertiary per designMd — no background, underline on hover.
 *
 * All sizes keep an ≥40px hit target.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[background,box-shadow,transform,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary-gradient text-primary-foreground shadow-[var(--shadow-primary-glow)] hover:brightness-110 active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-110 active:brightness-95",
        outline:
          "border border-outline-variant/15 bg-transparent text-foreground hover:bg-surface-container-high",
        secondary:
          "bg-surface-container-highest text-on-surface hover:bg-surface-container-high",
        ghost:
          "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof BaseButton>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<React.ElementRef<typeof BaseButton>, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <BaseButton className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
