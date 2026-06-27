import { motion } from "framer-motion";
import { Sliders } from "../Icons";

interface Props {
  title: string;
  subtitle: string;
  onClick?: () => void;
  accent?: string;
  delay?: number;
  tall?: boolean;
}

/** Folder-shaped card with the signature tab notch, matching the reference design. */
export default function FolderCard({
  title,
  subtitle,
  onClick,
  accent = "#5ad1c8",
  delay = 0,
  tall = false,
}: Props) {
  const gid = `fg-${title.replace(/\s/g, "")}`;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -3 }}
      className={`group relative block w-full text-left ${tall ? "aspect-[3/4]" : "aspect-square"}`}
    >
      <svg
        className="absolute inset-0 h-full w-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.5)]"
        viewBox="0 0 100 84"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#26262b" />
            <stop offset="1" stopColor="#131316" />
          </linearGradient>
        </defs>
        <path
          d="M0,7 Q0,0 7,0 L35,0 Q42,0 44,4 L47,9 Q49,10 54,10 L93,10 Q100,10 100,17 L100,77 Q100,84 93,84 L7,84 Q0,84 0,77 Z"
          fill={`url(#${gid})`}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.4"
        />
      </svg>

      {/* content */}
      <div className="relative flex h-full flex-col p-5">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <Sliders size={18} className="text-mute-soft" />
        </div>
        <div className="mt-auto">
          <div className="text-[19px] font-bold leading-tight text-white">
            {title}
          </div>
          <div className="mt-0.5 text-sm text-mute">{subtitle}</div>
        </div>
        <span
          className="pointer-events-none absolute bottom-4 right-4 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
      </div>
    </motion.button>
  );
}
