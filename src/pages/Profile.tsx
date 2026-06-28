import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { useAuth } from "../lib/auth";
import PageHeader from "../components/PageHeader";
import { fmtVolume, toUnit } from "../lib/utils";
import { volumeLastDays, currentStreak } from "../lib/selectors";
import {
  Flame,
  Dumbbell,
  Droplet,
  TrendUp,
  ChevronRight,
  LogOut,
  Check,
  Settings as SettingsIcon,
} from "../components/Icons";

export default function Profile() {
  const nav = useNavigate();
  const { user, signOut, mode } = useAuth();
  const { profile, sessions, water, weight, updateProfile } = useStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);

  const stats = useMemo(() => {
    const totalVol = sessions.reduce((t, s) => t + s.volume, 0);
    return {
      total: sessions.length,
      streak: currentStreak(sessions),
      vol: totalVol,
      vol7: volumeLastDays(sessions, 7),
      water: water.length,
      weights: weight.length,
    };
  }, [sessions, water, weight]);

  const initial = (profile.name || user?.email || "F")[0]?.toUpperCase();

  const cards = [
    { icon: Dumbbell, label: "Séances", value: String(stats.total) },
    { icon: Flame, label: "Série", value: `${stats.streak} j` },
    { icon: TrendUp, label: "Volume total", value: `${fmtVolume(stats.vol, profile.unit)} ${profile.unit}` },
    { icon: Droplet, label: "Jours d'eau", value: String(stats.water) },
  ];

  return (
    <>
      <PageHeader title="Profil" />

      {/* Identity card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex items-center gap-4 p-6"
      >
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white text-2xl font-extrabold text-black">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateProfile({ name: name.trim() });
                    setEditing(false);
                  }
                }}
                placeholder="Ton prénom"
                className="min-w-0 flex-1 rounded-xl bg-ink-700 px-3 py-2 text-lg font-bold outline-none ring-1 ring-white/10 focus:ring-white/25"
              />
              <button
                onClick={() => {
                  updateProfile({ name: name.trim() });
                  setEditing(false);
                }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-black"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-left">
              <div className="truncate text-xl font-extrabold">
                {profile.name || "Ajouter ton prénom"}
              </div>
              <div className="truncate text-sm text-mute">{user?.email}</div>
            </button>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <span className="chip">{mode === "cloud" ? "Synchronisé ☁" : "Local"}</span>
            <span className="chip">{toUnit(profile.bodyWeight, profile.unit).toFixed(1)} {profile.unit}</span>
          </div>
        </div>
      </motion.div>

      {/* Stat grid */}
      <div className="mt-3.5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            className="card p-5"
          >
            <c.icon size={17} className="text-white/60" />
            <div className="num mt-3 text-2xl font-extrabold leading-none">{c.value}</div>
            <div className="mt-1 text-[12px] text-mute">{c.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mt-3.5 card divide-y divide-white/[0.05] p-2">
        <LinkRow icon={<Dumbbell size={18} />} label="Mes programmes" onClick={() => nav("/program")} />
        <LinkRow icon={<TrendUp size={18} />} label="Statistiques" onClick={() => nav("/stats")} />
        <LinkRow icon={<SettingsIcon size={18} />} label="Connexions & réglages" onClick={() => nav("/settings")} />
      </div>

      <button
        onClick={() => signOut()}
        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.04] py-3.5 text-sm font-semibold text-mute transition-colors hover:text-white"
      >
        <LogOut size={16} />
        Se déconnecter
      </button>
    </>
  );
}

function LinkRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-xl p-3.5 text-left transition-colors hover:bg-white/[0.03]"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-white/80">
        {icon}
      </div>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight size={16} className="text-mute-soft" />
    </motion.button>
  );
}
