import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import {
  GlassButton,
  glassButtonVariants,
} from "./apple-tahoe-liquid-glass-button";
import { GlassEffect } from "./liquid-glass";

const surfaceVariants = cva(
  "relative overflow-visible text-white border transition-all duration-700",
  {
    variants: {
      tone: {
        clear:
          "bg-transparent border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_24px_80px_rgba(0,0,0,0.32)]",
        panel:
          "bg-white/[0.025] border-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_70px_rgba(0,0,0,0.35)]",
        purple:
          "bg-transparent border-nma-purple/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_55px_rgba(139,92,246,0.12),0_24px_80px_rgba(0,0,0,0.34)]",
      },
      radius: {
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        "3xl": "rounded-3xl",
        card: "rounded-[1.25rem]",
      },
    },
    defaultVariants: {
      tone: "clear",
      radius: "3xl",
    },
  },
);

interface NmaGlassSurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {
  key?: string | number;
  children?: React.ReactNode;
  className?: string;
  effectStyle?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

function NmaGlassSurface({
  children,
  className,
  effectStyle,
  tone,
  radius,
  ...props
}: NmaGlassSurfaceProps) {
  const overlayColor =
    tone === "purple"
      ? "rgba(139, 92, 246, 0.075)"
      : tone === "panel"
      ? "rgba(255, 255, 255, 0.055)"
      : "rgba(255, 255, 255, 0.028)";

  return (
    <GlassEffect
      className={cn(surfaceVariants({ tone, radius }), className)}
      overlayColor={overlayColor}
      style={effectStyle}
    >
      <div className="relative z-10 w-full h-full" {...props}>
        {children}
      </div>
    </GlassEffect>
  );
}

const buttonVariants = cva("", {
  variants: {
    glow: {
      purple:
        "text-white border border-nma-purple/35 bg-nma-purple/20 shadow-[0_0_24px_rgba(139,92,246,0.42),inset_0_0_28px_rgba(139,92,246,0.18)] hover:shadow-[0_0_34px_rgba(139,92,246,0.6),inset_0_0_34px_rgba(139,92,246,0.25)]",
      green:
        "text-green-100 border border-green-400/35 bg-green-500/15 shadow-[0_0_24px_rgba(34,197,94,0.28),inset_0_0_26px_rgba(34,197,94,0.14)] hover:shadow-[0_0_32px_rgba(34,197,94,0.42),inset_0_0_30px_rgba(34,197,94,0.2)]",
      danger:
        "text-red-100 border border-red-400/35 bg-red-500/12 shadow-[0_0_24px_rgba(239,68,68,0.25),inset_0_0_26px_rgba(239,68,68,0.12)] hover:shadow-[0_0_32px_rgba(239,68,68,0.38),inset_0_0_30px_rgba(239,68,68,0.18)]",
      neutral:
        "text-white border border-white/12 bg-white/[0.04] shadow-[0_12px_30px_rgba(0,0,0,0.24)] hover:border-white/24",
      subtle:
        "text-white border border-white/10 bg-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-white/20",
    },
  },
  defaultVariants: {
    glow: "neutral",
  },
});

interface NmaGlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants>,
    VariantProps<typeof buttonVariants> {
  key?: string | number;
  asChild?: boolean;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  glassColor?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

function NmaGlassButton({
  className,
  glow,
  glassColor,
  ...props
}: NmaGlassButtonProps) {
  const resolvedGlassColor =
    glassColor ??
    (glow === "purple"
      ? "rgba(139, 92, 246, 0.24)"
      : glow === "green"
      ? "rgba(34, 197, 94, 0.18)"
      : glow === "danger"
      ? "rgba(239, 68, 68, 0.16)"
      : "rgba(255, 255, 255, 0.045)");

  return (
    <GlassButton
      className={cn(buttonVariants({ glow }), className)}
      glassColor={resolvedGlassColor}
      {...props}
    />
  );
}

export { NmaGlassButton, NmaGlassSurface, surfaceVariants };
export type { NmaGlassButtonProps, NmaGlassSurfaceProps };
