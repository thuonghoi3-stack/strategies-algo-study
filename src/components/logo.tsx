import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-fg", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#090a0c" />
      <line
        x1="16"
        y1="5"
        x2="16"
        y2="27"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="8" fill="none" stroke="#a8b8c8" strokeWidth="2.25" />
      <circle cx="16" cy="16" r="2.25" fill="#6a9e7c" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark className="size-7 rounded-sm" />
      <span className="font-display text-xl tracking-tight text-fg">Meridian</span>
    </span>
  );
}
