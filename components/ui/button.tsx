import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-sunset text-white shadow-floating hover:translate-y-[-2px] hover:shadow-xl",
        outline: "border-2 border-sunset bg-transparent text-sunset hover:bg-sunset/5",
        secondary: "bg-ocean text-white hover:bg-ocean/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-sunset underline-offset-4 hover:underline",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: { 
        default: "h-12 px-6 py-3", 
        sm: "h-9 px-3", 
        lg: "h-14 px-10 text-base", 
        icon: "h-10 w-10" 
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
export { buttonVariants };
