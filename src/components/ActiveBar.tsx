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
    const update = () =>
      setElapsed(Math.floor((Date.now() - active.startedAt) / 1000));
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
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="card grain group flex w-full items-center justify-between px-5 py-3.5 text-left"
        >
          <span className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-white/25" />
          <div>
            <div className="num text-3xl font-extrabold tracking-tight text-white">
              {fmtClock(elapsed)}
            </div>
            <div className="mt-0.5 text-sm text-mute">
              {active.focus} · <span className="text-accent">En cours</span>
            </div>
          </div>
          <motion.span
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="grid h-12 w-12 place-items-center rounded-full bg-white text-black"
          >
            <ArrowUp size={22} />
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
