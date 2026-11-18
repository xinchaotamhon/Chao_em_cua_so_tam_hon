import { starPath } from "../lib/star";

interface StarMarkProps {
  size?: number;
  className?: string;
}

/** The product mark on its own: the drum star, in the moment colour. */
export default function StarMark({ size = 24, className = "" }: StarMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-12 -12 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={starPath(10.5)} fill="currentColor" />
    </svg>
  );
}
