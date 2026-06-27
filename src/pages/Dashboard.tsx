import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import PageHeader from "../components/PageHeader";
import RingProgress from "../components/ui/RingProgress";
import DotHeatmap from "../components/ui/DotHeatmap";
import FolderCard from "../components/ui/FolderCard";
import CountUp from "../components/ui/CountUp";
import Modal from "../components/ui/Modal";
import SparkSvg from "../components/ui/SparkSvg";
import {
  Sliders,
  PlusSquare,
  Droplet,
  Dumbbell,
  ChevronRight,
  Plus,
} from "../components/Icons";
import { volumeLastDays, waterToday, waterSeries } from "../lib/selectors";
import { fmtVolume, fmtWeight, relativeTime, toUnit } from "../lib/utils";

export default function Dashboard() {
  const nav = useNavigate();
  const {
    sessions, routines, folders, water, weight, profile,
    active, startWorkout, addRoutine, logWeight, addWater,
  } = useStore();

  const [weightModal, setWeightModal] = useState(false);
  const [newModal, setNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [wInput, setWInput] = useState(toUnit(profile.bodyWeight, profile.unit).toFixed(1));

  const vol7 = volumeLastDays(sessions, 7);
  const wToday = waterToday(water);
  const waterPct = Math.min(1, wToday / profile.waterGoalMl);
  const wSeries = useMemo(() => waterSeries(water, 7), [water]);

  const nextRoutine = routines.find((r) => r.exercises.length > 0);
  const featured = routines.filter((r) => r.exercises.length > 0)[0];
  const weightSpark = useMemo(() => weight.slice(-16).map((w) => w.value), [weight]);
  const waterSpark = useMemo(() => wSeries.map((d) => d.v), [wSeries]);

  return (
    <>
      <PageHeader
        title="Workouts"
        actions={
          <>
            <button
              onClick={() => nav("/stats")}
              className="pill-btn h-11 w-11"
              aria-label="Stats"
            >
              <Sliders size={17} />
            </button>
            <button
              onClick={() => setNewModal(true)}
              className="pill-btn h-11 w-11"
              aria-label="Nouvelle séance"
            >
              <PlusSquare size={19} />
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-12 lg:gap-3.5">
        {/* Streak / next session */}
        <motion.button
          onClick={() => featured && startWorkout(featured.id)}
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className="card flex aspect-square flex-col p-5 text-left lg:col-span-3 lg:aspect-auto lg:min-h-[200px]"
        >
          <div className="flex items-start justify-between">
            <RingProgress value={Math.min(1, profile.streak / 7)} size={52} stroke={3} color="#fff">
              <span className="num text-lg font-bold">{profile.streak}</span>
            </RingProgress>
            <Sliders size={17} className="text-mute-soft" />
          </div>
          <div className="mt-auto">
            <div className="text-[18px] font-bold leading-tight">
              {featured?.name ?? "Nouvelle séance"}
            </div>
            <div className="mt-0.5 text-[13px] text-mute">
              {featured?.schedule ?? "Commencer"}
            </div>
          </div>
        </motion.button>

        {/* Body weight */}
        <motion.button
          onClick={() => setWeightModal(true)}
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="card relative flex aspect-square flex-col overflow-hidden p-5 text-left lg:col-span-3 lg:aspect-auto lg:min-h-[200px]"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-baseline gap-1">
              <CountUp
                value={toUnit(profile.bodyWeight, profile.unit)}
                decimals={profile.unit === "lbs" ? 0 : 1}
                className="num text-[38px] font-extrabold leading-none"
              />
              <span className="text-sm font-medium text-mute">{profile.unit}</span>
            </div>
            <Sliders size={17} className="text-mute-soft" />
          </div>
          {weightSpark.length > 1 && (
            <div className="my-2 flex-1 opacity-50">
              <SparkSvg data={weightSpark} color="#fff" height={28} />
            </div>
          )}
          <div className="mt-auto">
            <div className="text-[17px] font-bold leading-tight">Body Weight</div>
            <div className="mt-0.5 text-[12px] text-mute">
              {weight.length ? relativeTime(weight.at(-1)!.date + "T12:00") : "Non renseigné"}
            </div>
          </div>
        </motion.button>

        {/* Heatmap + routine */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card col-span-2 p-5 lg:col-span-6 lg:row-span-2"
        >
          <DotHeatmap sessions={sessions} months={3} />
          <button
            onClick={() => nextRoutine && startWorkout(nextRoutine.id)}
            className="mt-4 flex w-full items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition-colors hover:bg-white/[0.04]"
          >
            <RingProgress value={0.66} size={46} stroke={3} color="#fff">
              <span className="num text-[13px] font-bold">{sessions.length % 9 || 2}</span>
            </RingProgress>
            <div className="flex-1">
              <div className="text-[16px] font-bold leading-tight">
                {nextRoutine?.name ?? "Back + Biceps + Legs"}
              </div>
              <div className="text-[13px] text-mute">{nextRoutine?.schedule ?? "Lundi"}</div>
            </div>
            <Sliders size={16} className="text-mute-soft" />
          </button>
        </motion.div>

        {/* Volume lifted */}
        <motion.button
          onClick={() => nav("/stats")}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="card col-span-2 flex items-center gap-4 p-5 text-left lg:col-span-3"
        >
          <div className="flex-1">
            <div className="text-[16px] font-bold leading-tight">Volume lifted</div>
            <div className="text-[13px] text-mute">Last 7 days</div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="num text-[26px] font-extrabold leading-none">
              {fmtVolume(vol7, profile.unit)}
            </span>
            <span className="text-sm text-mute">{profile.unit}</span>
          </div>
          <Sliders size={17} className="text-mute-soft" />
        </motion.button>

        {/* Water */}
        <motion.button
          onClick={() => nav("/water")}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="card col-span-2 flex items-center gap-4 p-5 text-left lg:col-span-3"
        >
          <RingProgress value={waterPct} size={52} stroke={3.5} color="#fff">
            <Droplet size={16} className="text-white/70" />
          </RingProgress>
          <div className="flex-1">
            <div className="text-[16px] font-bold leading-tight">Hydratation</div>
            <div className="text-[13px] text-mute">
              {(wToday / 1000).toFixed(1)}L / {(profile.waterGoalMl / 1000).toFixed(1)}L
            </div>
            {waterSpark.length > 1 && (
              <div className="mt-1.5 h-5 opacity-40">
                <SparkSvg data={waterSpark} color="#fff" height={20} />
              </div>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); addWater(250); }}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.1] text-white transition-colors hover:bg-white/[0.18]"
            aria-label="+250 ml"
          >
            <Plus size={16} />
          </button>
        </motion.button>
      </div>

      {/* Collections */}
      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Collections</h2>
          <span className="text-sm text-mute">{folders.length} dossiers</span>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {folders.map((f, i) => {
            const count = routines.filter((r) => r.folderId === f.id).length;
            return (
              <FolderCard
                key={f.id}
                title={f.name}
                subtitle={count ? `${count} items` : "No items"}
                delay={0.04 * i}
                onClick={() => nav("/calendar")}
              />
            );
          })}

          {/* Cardio 365 */}
          <motion.button
            onClick={() => {
              const cardio = routines.find((r) => r.name.toLowerCase().includes("cardio"));
              if (cardio) startWorkout(cardio.id, cardio.name);
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card col-span-2 flex items-center gap-4 p-5 text-left"
          >
            <div className="flex-1">
              <div className="text-[18px] font-bold leading-tight">Cardio 365</div>
              <div className="mt-0.5 text-[13px] text-mute">Tous les 4 jours</div>
            </div>
            <RingProgress value={0} size={44} stroke={3} color="#fff">
              <span className="num text-xs font-bold">0</span>
            </RingProgress>
            <Sliders size={17} className="text-mute-soft" />
          </motion.button>
        </div>
      </div>

      {/* Program teaser */}
      <motion.button
        onClick={() => nav("/program")}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card mt-3 flex w-full items-center gap-4 p-5 text-left"
      >
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.08] border border-white/[0.06]">
          <Dumbbell size={20} />
        </div>
        <div className="flex-1">
          <div className="text-[16px] font-bold leading-tight">
            28-Day Ignite : Home Fitness Fusion
          </div>
          <div className="mt-0.5 text-[13px] text-mute">
            Weight Loss · Endurance · Mobility
          </div>
        </div>
        <ChevronRight size={18} className="text-mute-soft" />
      </motion.button>

      {/* Weight modal */}
      <Modal open={weightModal} onClose={() => setWeightModal(false)} title="Body Weight">
        <div className="flex items-center justify-center gap-2 py-2">
          <input
            type="number"
            step="0.1"
            value={wInput}
            onChange={(e) => setWInput(e.target.value)}
            className="num w-36 rounded-2xl bg-ink-700 px-4 py-4 text-center text-3xl font-bold outline-none ring-1 ring-white/10 focus:ring-white/25"
          />
          <span className="text-lg text-mute">{profile.unit}</span>
        </div>
        <button
          onClick={() => {
            const kg = profile.unit === "lbs" ? Number(wInput) / 2.20462 : Number(wInput);
            if (kg > 0) logWeight(Math.round(kg * 10) / 10);
            setWeightModal(false);
          }}
          className="mt-4 w-full rounded-2xl bg-white py-3.5 font-bold text-black transition-transform active:scale-[0.98]"
        >
          Enregistrer
        </button>
      </Modal>

      {/* New routine modal */}
      <Modal open={newModal} onClose={() => setNewModal(false)} title="Nouvelle séance">
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Push Day, Pull Day…"
          className="w-full rounded-2xl bg-ink-700 px-4 py-3.5 text-base outline-none ring-1 ring-white/10 focus:ring-white/25"
        />
        <div className="mt-4">
          <button
            onClick={() => {
              if (newName.trim()) {
                const id = addRoutine(newName.trim(), folders[1]?.id);
                setNewName("");
                setNewModal(false);
                startWorkout(id, newName.trim());
                nav("/workout");
              }
            }}
            className="w-full rounded-2xl bg-white py-3.5 font-bold text-black transition-transform active:scale-[0.98]"
          >
            Créer & démarrer
          </button>
        </div>
      </Modal>

      {active && <div className="h-2" />}
    </>
  );
}
