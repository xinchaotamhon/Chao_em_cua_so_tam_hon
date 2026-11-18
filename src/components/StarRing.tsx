import type { ReactNode } from "react";

interface StarRingProps {
  /** How much of the countdown is left, from 1 down to 0. */
  progress: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
}

/**
 * The countdown, drawn as a ring that empties.
 *
 * A number on its own tells you the time; a ring tells you how much is left without
 * reading, which is what someone with tired eyes actually needs.
 */
export default function StarRing({
  progress,
  size = 260,
  stroke = 6,
  className = "",
  children,
}: StarRingProps) {
  const r = 100 - stroke;
  const circumference = 2 * Math.PI * r;
  const left = Math.max(0, Math.min(1, progress));

  return (
    <div
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className="-rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth={stroke}
        />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - left)}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
