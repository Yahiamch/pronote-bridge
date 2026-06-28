import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { fmtClock } from "../lib/utils";
import { ArrowUp } from "./Icons";

export default function ActiveBar() {
  const active = useStore((s) => s.active);
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;
    const update = () => setElapsed(Math.floor((Date.now() - active.startedAt) / 1000));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.button
          type="button"
          onClick={() => navigate("/workout")}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="card flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="absolute left-1/2 top-2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-white/20" />
          <div>
            <div className="num text-[28px] font-extrabold tracking-tight">
              {fmtClock(elapsed)}
            </div>
            <div className="mt-0.5 text-sm text-mute">
              {active.focus} · <span className="text-white/80">En cours</span>
            </div>
          </div>
          <motion.span
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-black"
          >
            <ArrowUp size={20} />
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
