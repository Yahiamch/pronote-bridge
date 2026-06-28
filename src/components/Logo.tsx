interface LogoProps {
  size?: number;
  className?: string;
}

/** Forge brand mark — monochrome, inherits color via `fill="currentColor"`. */
export default function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      className={className}
      aria-label="Forge"
    >
      <path d="M34 16H84L70 40H48C40 40 34 34 34 26V16Z" fill="currentColor" />
      <path
        d="M22 80L36 54C38 49 43 46 50 46H72L58 70H44L30 80H22Z"
        fill="currentColor"
      />
    </svg>
  );
}
