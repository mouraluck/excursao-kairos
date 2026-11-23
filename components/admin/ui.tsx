"use client";

// Camada fina sobre os componentes da Easy UI (components/easyui), com os
// tamanhos maiores e o amarelo da Kairós que o painel usa.

import { forwardRef, type ReactNode } from "react";
import { Alert, type AlertTone } from "@/components/easyui/alert";
import { AnimatedNumber } from "@/components/easyui/animated-number";
import { Badge } from "@/components/easyui/badge";
import {
  Button as EasyButton,
  type ButtonProps as EasyButtonProps,
} from "@/components/easyui/button";
import {
  Input as EasyInput,
  type InputProps,
  Select as EasySelect,
  type SelectProps,
} from "@/components/easyui/form";
import { cn } from "@/lib/utils";

export { AnimatedNumber, Badge };

type Variant = "default" | "outline" | "ghost" | "destructive";
type Size = "default" | "sm" | "lg" | "icon";

const sizes: Record<Size, { easy: EasyButtonProps["size"]; className: string }> = {
  sm: { easy: "md", className: "h-10 px-4 text-sm" },
  default: { easy: "lg", className: "h-11 px-5 text-base" },
  lg: { easy: "lg", className: "h-13 px-6 text-lg" },
  icon: { easy: "icon", className: "size-11" },
};

export type ButtonProps = Omit<EasyButtonProps, "variant" | "size"> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className, ...props }, ref) => (
    <EasyButton
      ref={ref}
      variant={variant === "default" ? "primary" : variant}
      size={sizes[size].easy}
      className={cn(
        "rounded-xl font-semibold [&>span]:inline-flex [&>span]:items-center [&>span]:gap-2 [&_svg]:size-4 [&_svg]:shrink-0",
        sizes[size].className,
        variant === "default" &&
          "border-kairos-yellow-deep bg-kairos-yellow text-kairos-black hover:bg-kairos-yellow-deep hover:opacity-100",
        variant === "outline" && "border-2 bg-[var(--surface)]",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

const control = "h-12 rounded-xl border-2 px-4 text-lg";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, ...props }, ref) => (
    <EasyInput
      ref={ref}
      leftIcon={leftIcon}
      className={cn(control, leftIcon ? "pl-11" : undefined, className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <EasySelect ref={ref} className={cn(control, "pr-9", className)} {...props} />
  ),
);
Select.displayName = "Select";

/** Aviso em linha. `danger` e `warning` são anunciados como alerta. */
export function Notice({
  tone = "neutral",
  className,
  children,
}: {
  tone?: AlertTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Alert tone={tone} className={cn("text-base", className)}>
      {children}
    </Alert>
  );
}
