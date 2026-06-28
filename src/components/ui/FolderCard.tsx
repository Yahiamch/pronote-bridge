import { motion } from "framer-motion";
import { Sliders } from "../Icons";

interface Props {
  title: string;
  subtitle: string;
  onClick?: () => void;
  delay?: number;
}

export default function FolderCard({ title, subtitle, onClick, delay = 0 }: Props) {
  const gid = `fg-${title.replace(/\s+/g, "")}`;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      className="group relative block aspect-square w-full text-left"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 84"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#222224" />
            <stop offset="1" stopColor="#161618" />
          </linearGradient>
        </defs>
        <path
          d="M0,7 Q0,0 7,0 L35,0 Q42,0 44,4 L47,9 Q49,10 54,10 L93,10 Q100,10 100,17 L100,77 Q100,84 93,84 L7,84 Q0,84 0,77 Z"
          fill={`url(#${gid})`}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.4"
        />
      </svg>

      <div className="relative flex h-full flex-col p-5">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/[0.05]">
          <Sliders size={16} className="text-mute-soft" />
        </div>
        <div className="mt-auto">
          <div className="text-[18px] font-bold leading-tight text-white">{title}</div>
          <div className="mt-0.5 text-[13px] text-mute">{subtitle}</div>
        </div>
      </div>
    </motion.button>
  );
}
