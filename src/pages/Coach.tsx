import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store/useStore";
import PageHeader from "../components/PageHeader";
import { Bolt, TrendUp, Droplet, Flame, Heart, Moon, ArrowUp } from "../components/Icons";
import { volumeLastDays, sessionsLastDays, waterToday, currentStreak } from "../lib/selectors";
import { fmtVolume } from "../lib/utils";
import { askCoach, type CoachMsg, type CoachStats } from "../lib/coach";
import { looksLikeData, parsePasted } from "../lib/smartImport";

const SUGGESTIONS = [
  "Comment prendre du muscle ?",
  "Je stagne, que faire ?",
  "Colle tes check-ins Basic-Fit",
  "Suis-je assez hydraté ?",
];

export default function Coach() {
  const { sessions, water, weight, profile, importData } = useStore();
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [usedAI, setUsedAI] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [chat, setChat] = useState<CoachMsg[]>([
    {
      role: "coach",
      text: "Salut 👋 Je suis ton coach Forge. Pose-moi une question sur ton entraînement, ta nutrition, ton hydratation ou ta récupération.",
    },
  ]);

  const stats: CoachStats = useMemo(() => {
    const vol7 = volumeLastDays(sessions, 7);
    const vol14 = volumeLastDays(sessions, 14);
    const wDelta =
      weight.length >= 2
        ? weight.at(-1)!.value - weight[Math.max(0, weight.length - 8)].value
        : null;
    return {
      unit: profile.unit,
      sessions7: sessionsLastDays(sessions, 7),
      sessions30: sessionsLastDays(sessions, 30),
      vol7,
      vol7prev: vol14 - vol7,
      waterToday: waterToday(water),
      waterGoal: profile.waterGoalMl,
      streak: currentStreak(sessions),
      weightDelta: wDelta,
      bodyWeight: profile.bodyWeight,
      totalSessions: sessions.length,
    };
  }, [sessions, water, weight, profile]);

  const insights = useMemo(() => {
    const trend = stats.vol7prev > 0 ? ((stats.vol7 - stats.vol7prev) / stats.vol7prev) * 100 : 0;
    const waterPct = Math.round((stats.waterToday / profile.waterGoalMl) * 100);
    const out: { icon: any; title: string; text: string }[] = [];
    out.push({
      icon: TrendUp,
      title: trend >= 0 ? "Volume en hausse" : "Volume en baisse",
      text: `${fmtVolume(stats.vol7, profile.unit)} ${profile.unit} cette semaine (${trend >= 0 ? "+" : ""}${trend.toFixed(0)}% vs précédente). ${trend >= 0 ? "Continue sur cette lancée." : "Pense à varier l'intensité."}`,
    });
    out.push({
      icon: Droplet,
      title: waterPct >= 80 ? "Bien hydraté" : "Bois plus d'eau",
      text:
        waterPct >= 80
          ? `${waterPct}% de ton objectif atteint aujourd'hui.`
          : `${waterPct}% de ton objectif. Vise +${Math.max(0, profile.waterGoalMl - stats.waterToday)} ml d'ici ce soir.`,
    });
    out.push({
      icon: Flame,
      title: `${stats.streak} jour(s) de série`,
      text:
        stats.sessions7 >= 3
          ? `${stats.sessions7} séances cette semaine — excellent rythme. Garde 1 jour de repos.`
          : `${stats.sessions7} séance(s) cette semaine. Vise au moins 3 pour progresser.`,
    });
    if (stats.weightDelta !== null) {
      out.push({
        icon: Heart,
        title: "Évolution du poids",
        text: `${stats.weightDelta >= 0 ? "+" : ""}${stats.weightDelta.toFixed(1)} kg récemment. ${Math.abs(stats.weightDelta) < 1 ? "Stable — idéal pour une recomposition." : "Tendance nette, ajuste ton apport calorique."}`,
      });
    }
    out.push({
      icon: Moon,
      title: "Récupération",
      text: "Vise 7-9 h de sommeil. La croissance musculaire se fait au repos, pas à la salle.",
    });
    return out;
  }, [stats, profile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, sending]);

  const send = async (text?: string) => {
    const q = (text ?? msg).trim();
    if (!q || sending) return;
    const next: CoachMsg[] = [...chat, { role: "user", text: q }];
    setChat(next);
    setMsg("");
    setSending(true);

    // Data intake: if the message is a pasted dump (Basic-Fit, CSV, JSON),
    // sort it into the app instead of answering as a chat.
    if (looksLikeData(q)) {
      const { sessions: s, weights, summary } = parsePasted(q);
      if (s.length || weights.length) {
        const added = importData({ sessions: s, weights });
        const reply =
          added.sessions || added.weights
            ? `✅ Données triées et ajoutées à ton calendrier : ${added.sessions} séance(s)${added.weights ? ` et ${added.weights} mesure(s) de poids` : ""}. ` +
              `${summary ? `Détecté : ${summary}. ` : ""}Tes stats et ta heatmap sont à jour 💪`
            : `Tout est déjà dans l'app — aucun doublon ajouté.${summary ? ` (${summary})` : ""}`;
        setChat((c) => [...c, { role: "coach", text: reply }]);
        setUsedAI(null);
        setSending(false);
        return;
      }
    }

    const { reply, source } = await askCoach(next, stats);
    setUsedAI(source === "ai");
    setChat((c) => [...c, { role: "coach", text: reply }]);
    setSending(false);
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
            <div className="min-w-0">
              <div className="font-bold">{ins.title}</div>
              <div className="mt-0.5 text-[13px] leading-relaxed text-mute">{ins.text}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card mt-3.5 flex flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Bolt size={17} className="text-white/60" /> Demande au coach
          </div>
          {usedAI !== null && (
            <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-mute">
              {usedAI ? "IA" : "hors-ligne"}
            </span>
          )}
        </div>

        <div
          ref={scrollRef}
          className="mb-3 flex max-h-[44vh] min-h-[120px] flex-col gap-2 overflow-y-auto thin-scroll"
        >
          {chat.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                c.role === "user"
                  ? "self-end bg-white text-black"
                  : "self-start bg-white/[0.06] text-white"
              }`}
            >
              {c.text}
            </motion.div>
          ))}
          <AnimatePresence>
            {sending && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 self-start rounded-2xl bg-white/[0.06] px-4 py-3.5"
              >
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="h-1.5 w-1.5 rounded-full bg-white/60"
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {chat.length <= 1 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-pill border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[13px] text-mute transition-colors hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Pose ta question ou colle tes données (Basic-Fit, CSV, JSON)…"
            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl bg-ink-700 px-4 py-3 text-sm outline-none ring-1 ring-white/[0.07] focus:ring-white/20"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => send()}
            disabled={sending || !msg.trim()}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-black transition-opacity disabled:opacity-40"
            aria-label="Envoyer"
          >
            <ArrowUp size={18} />
          </motion.button>
        </div>
      </div>
    </>
  );
}
