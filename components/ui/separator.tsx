import { Separator as BaseSeparator } from "@base-ui/react/separator";
import * as React from "react";

import { cn } from "@/lib/utils";

type SeparatorProps = React.ComponentPropsWithoutRef<typeof BaseSeparator> & {
  decorative?: boolean;
};

const Separator = React.forwardRef<React.ElementRef<typeof BaseSeparator>, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <BaseSeparator
      aria-hidden={decorative || undefined}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
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
