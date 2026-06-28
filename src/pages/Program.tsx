import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import PageHeader from "../components/PageHeader";
import { Sliders, Flame, Clock, Lock, Check } from "../components/Icons";

export default function Program() {
  const nav = useNavigate();
  const { program, toggleProgramDay, startWorkout } = useStore();
  const doneCount = program.days.filter((d) => d.done).length;
  const progress = doneCount / program.days.length;
  const currentDay = program.days.find((d) => !d.done)?.day ?? program.days.length;

  return (
    <>
      <PageHeader
        title={program.title}
        actions={
          <button className="pill-btn h-11 w-11">
            <Sliders size={18} />
          </button>
        }
      />

      <div className="mb-2 text-sm text-mute">
        {program.tags.join(", ")} · {program.level} ·{" "}
        {(program.totalKcal / 1000).toFixed(1)}k kcal · {program.totalTime}
      </div>

      {/* progress bar */}
      <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          className="h-full rounded-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <h2 className="mb-4 text-xl font-bold">Fat Shredding Start</h2>

      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2">
        {program.days.map((d, i) => {
          const locked = d.day > currentDay;
          const isCurrent = d.day === currentDay;
          return (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className={`card grain overflow-hidden ${
                locked ? "opacity-55" : ""
              } ${isCurrent ? "ring-1 ring-white/15" : ""}`}
            >
              <div className="flex items-center gap-4 p-5">
                <div className="w-12 shrink-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-mute-soft">
                    Jour
                  </div>
                  <div className="num text-3xl font-extrabold leading-none">{d.day}</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="flex flex-1 items-center gap-5">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <Flame size={16} className="text-white/60" /> {d.kcal}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-mute">
                    <Clock size={16} /> {d.minutes} min
                  </span>
                </div>
                <button
                  onClick={() => !locked && toggleProgramDay(d.day)}
                  disabled={locked}
                  className={`grid h-8 w-8 place-items-center rounded-full ${
                    d.done
                      ? "bg-white text-black"
                      : locked
                      ? "text-mute-soft"
                      : "border border-white/15 text-mute"
                  }`}
                >
                  {d.done ? <Check size={16} /> : locked ? <Lock size={15} /> : null}
                </button>
              </div>

              {isCurrent && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-5 pb-5"
                >
                  <button
                    onClick={() => {
                      startWorkout(undefined, `${program.title} · Jour ${d.day}`);
                      nav("/workout");
                    }}
                    className="w-full rounded-pill bg-white py-3.5 text-base font-bold text-black transition-transform active:scale-[0.98]"
                  >
                    Commencer
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
