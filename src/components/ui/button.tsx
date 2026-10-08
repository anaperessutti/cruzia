import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold cursor-pointer transition-all duration-200 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover md:hover:-translate-y-px",
        destructive: "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        outline: "border border-border bg-card/60 text-foreground hover:bg-surface-sand",
        secondary: "bg-card text-foreground shadow-soft hover:bg-card/90 md:hover:-translate-y-px",
        ghost: "hover:bg-surface-sand hover:text-foreground",
        link: "text-foreground underline underline-offset-4 decoration-primary hover:decoration-2",
        "pill-primary": "h-12 px-6 bg-primary text-primary-foreground shadow-glow hover:bg-primary-hover md:hover:-translate-y-px",
        "pill-dark": "h-12 px-6 bg-ink text-ink-foreground shadow-soft hover:bg-ink/90 md:hover:-translate-y-px",
        "pill-light": "h-12 px-6 bg-card text-foreground shadow-soft hover:bg-card/90 md:hover:-translate-y-px",
        "pill-glass": "h-12 px-6 glass text-foreground hover:bg-card/70",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Círculo con flecha a la derecha del botón. */
  withArrow?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, withArrow = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }), withArrow && "pr-1.5")} ref={ref} {...props}>
        <Slottable>{children}</Slottable>
        {withArrow ? (
          <span aria-hidden="true" className="ml-1 flex size-9 items-center justify-center rounded-full bg-current/15">
            <ChevronRight />
          </span>
        ) : null}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
