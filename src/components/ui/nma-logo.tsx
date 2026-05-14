import { cn } from "../../lib/utils";

interface NmaLogoProps {
  className?: string;
  imageClassName?: string;
  withWordmark?: boolean;
  wordmark?: string;
}

export function NmaLogo({
  className,
  imageClassName,
  withWordmark = false,
  wordmark = "ACADEMY",
}: NmaLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/assets/logo/nma-logo.png"
        alt="NMA Logo"
        className={cn("h-auto w-24 object-contain", imageClassName)}
      />
      {withWordmark && (
        <span className="font-bold tracking-[0.1em] text-white">{wordmark}</span>
      )}
    </div>
  );
}
