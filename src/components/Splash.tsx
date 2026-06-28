import { motion } from "framer-motion";
import Logo from "./Logo";

export default function Splash() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] grid place-items-center bg-black"
    >
      <div className="flex flex-col items-center gap-5">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
        >
          <Logo size={76} className="text-white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-center"
        >
          <div className="text-2xl font-extrabold tracking-tight">Forge</div>
          <div className="mt-1 text-xs uppercase tracking-[0.25em] text-mute-soft">
            Fitness OS
          </div>
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ delay: 0.35, duration: 0.9, ease: "easeInOut" }}
          className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/10"
        >
          <motion.div
            className="h-full w-full bg-white/70"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ delay: 0.4, duration: 0.9, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
