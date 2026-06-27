import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import PageHeader from "../components/PageHeader";
import { Bolt, TrendUp, Droplet, Flame, Heart, Moon } from "../components/Icons";
import { volumeLastDays, sessionsLastDays, waterToday, currentStreak } from "../lib/selectors";
import { fmtVolume } from "../lib/utils";

export default function Coach() {
  const { sessions, water, weight, profile } = useStore();
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "coach"; text: string }[]>([
    {
      role: "coach",
      text: "Salut 👋 Je suis ton coach Forge. Pose-moi une question sur ton entraînement, ton hydratation ou ta récupération.",
    },
  ]);

  const insights = useMemo(() => {
    const vol7 = volumeLastDays(sessions, 7);
    const vol14prev = volumeLastDays(sessions, 14) - vol7;
    const trend = vol14prev > 0 ? ((vol7 - vol14prev) / vol14prev) * 100 : 0;
    const sess7 = sessionsLastDays(sessions, 7);
    const wToday = waterToday(water);
    const waterPct = Math.round((wToday / profile.waterGoalMl) * 100);
    const streak = currentStreak(sessions);

    const out: { icon: any; title: string; text: string }[] = [];
    out.push({
      icon: TrendUp,
      title: trend >= 0 ? "Volume en hausse" : "Volume en baisse",
      text: `Tu as soulevé ${fmtVolume(vol7, profile.unit)} ${profile.unit} cette semaine (${trend >= 0 ? "+" : ""}${trend.toFixed(0)}% vs précédente). ${trend >= 0 ? "Continue sur cette lancée." : "Pense à varier l'intensité."}`,
    });
    out.push({
      icon: Droplet,
      title: waterPct >= 80 ? "Bien hydraté" : "Bois plus d'eau",
      text:
        waterPct >= 80
          ? `${waterPct}% de ton objectif atteint aujourd'hui. Parfait pour la récupération.`
          : `Seulement ${waterPct}% de ton objectif. Vise +${profile.waterGoalMl - wToday} ml d'ici ce soir.`,
    });
    out.push({
      icon: Flame,
      title: `${streak} jours de série`,
      text:
        sess7 >= 3
          ? `${sess7} séances cette semaine — excellent rythme. Garde 1 jour de repos.`
          : `${sess7} séance(s) cette semaine. Vise au moins 3 pour progresser.`,
    });
    if (weight.length >= 2) {
      const delta = weight.at(-1)!.value - weight[Math.max(0, weight.length - 8)].value;
      out.push({
        icon: Heart,
        title: "Évolution du poids",
        text: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} kg sur les dernières semaines. ${Math.abs(delta) < 1 ? "Stable — idéal pour une recomposition." : "Tendance nette, ajuste ton apport calorique."}`,
      });
    }
    out.push({
      icon: Moon,
      title: "Récupération",
      text: "Vise 7-9 h de sommeil. La croissance musculaire se fait au repos, pas à la salle.",
    });
    return out;
  }, [sessions, water, weight, profile]);

  const answer = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes("eau") || lower.includes("hydrat"))
      return `Tu en es à ${waterToday(water)} ml aujourd'hui sur ${profile.waterGoalMl} ml. Bois un verre à chaque pause.`;
    if (lower.includes("muscle") || lower.includes("prise"))
      return "Pour la prise de muscle : surcharge progressive, 1,6-2 g de protéines/kg, et un léger surplus calorique.";
    if (lower.includes("perdre") || lower.includes("gras") || lower.includes("maigrir"))
      return "Pour sécher : déficit calorique modéré (-300 à -500 kcal), garde le travail de force et ajoute du cardio doux.";
    if (lower.includes("repos") || lower.includes("récup") || lower.includes("dors"))
      return "48 h entre deux séances du même groupe musculaire, 7-9 h de sommeil, et bonne hydratation.";
    return `En te basant sur tes ${sessions.length} séances enregistrées, je te conseille la régularité avant l'intensité.`;
  };

  const send = () => {
    if (!msg.trim()) return;
    const q = msg.trim();
    setChat((c) => [...c, { role: "user", text: q }, { role: "coach", text: answer(q) }]);
    setMsg("");
  };

  return (
    <>
      <PageHeader title="Coach" />

      <div className="grid gap-3 sm:grid-cols-2">
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card flex gap-3.5 p-5"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-white/70">
              <ins.icon size={18} />
            </div>
            <div>
              <div className="font-bold">{ins.title}</div>
              <div className="mt-0.5 text-[13px] leading-relaxed text-mute">{ins.text}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card mt-3.5 flex flex-col p-5">
        <div className="mb-3 flex items-center gap-2 font-bold">
          <Bolt size={17} className="text-white/60" /> Demande au coach
        </div>
        <div className="mb-3 flex max-h-72 flex-col gap-2 overflow-y-auto thin-scroll">
          {chat.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                c.role === "user"
                  ? "self-end bg-white text-black"
                  : "self-start bg-white/[0.06] text-white"
              }`}
            >
              {c.text}
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Comment prendre du muscle ?"
            className="flex-1 rounded-2xl bg-ink-700 px-4 py-3 text-sm outline-none ring-1 ring-white/[0.07] focus:ring-white/20"
          />
          <button
            onClick={send}
            className="rounded-2xl bg-white px-5 font-bold text-black transition-transform active:scale-95"
          >
            Envoyer
          </button>
        </div>
      </div>
    </>
  );
}
