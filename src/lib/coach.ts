export interface CoachMsg {
  role: "user" | "coach";
  text: string;
}

export interface CoachStats {
  unit: string;
  sessions7: number;
  sessions30: number;
  vol7: number;
  vol7prev: number;
  waterToday: number;
  waterGoal: number;
  streak: number;
  weightDelta: number | null;
  bodyWeight: number;
  totalSessions: number;
}

export function buildContext(s: CoachStats): string {
  const trend =
    s.vol7prev > 0 ? Math.round(((s.vol7 - s.vol7prev) / s.vol7prev) * 100) : null;
  return [
    `Séances (7 derniers jours): ${s.sessions7}`,
    `Séances (30 derniers jours): ${s.sessions30}`,
    `Total séances enregistrées: ${s.totalSessions}`,
    `Volume soulevé 7j: ${Math.round(s.vol7)} ${s.unit}` +
      (trend !== null ? ` (${trend >= 0 ? "+" : ""}${trend}% vs semaine précédente)` : ""),
    `Série en cours: ${s.streak} jour(s)`,
    `Hydratation aujourd'hui: ${s.waterToday} / ${s.waterGoal} ml`,
    `Poids corporel: ${s.bodyWeight} kg` +
      (s.weightDelta !== null
        ? ` (${s.weightDelta >= 0 ? "+" : ""}${s.weightDelta.toFixed(1)} kg récemment)`
        : ""),
  ].join("\n");
}

/** Rich rule-based coach used when no AI backend is configured. */
export function localCoach(question: string, s: CoachStats): string {
  const q = question.toLowerCase();
  const has = (...k: string[]) => k.some((w) => q.includes(w));

  if (has("eau", "hydrat", "boire", "bois")) {
    const left = Math.max(0, s.waterGoal - s.waterToday);
    return left > 0
      ? `Tu es à ${s.waterToday} ml sur ${s.waterGoal} ml aujourd'hui. Il te reste ${left} ml — garde une gourde à portée et bois un verre à chaque pause.`
      : `Objectif d'eau déjà atteint (${s.waterToday} ml) 💧 Parfait pour la récupération et les performances.`;
  }
  if (has("muscle", "prise de masse", "grossir", "masse", "hypertroph")) {
    return `Pour prendre du muscle: surcharge progressive (ajoute des reps ou du poids chaque semaine), 1,6 à 2 g de protéines/kg, léger surplus calorique (+200 à +300 kcal) et 7 à 9 h de sommeil. Tu es à ${s.sessions7} séance(s) cette semaine — vise 3 à 5 pour un vrai stimulus.`;
  }
  if (has("sèche", "secher", "perdre", "gras", "maigrir", "définition", "definition")) {
    return `Pour sécher: déficit modéré (-300 à -500 kcal), garde les charges lourdes pour préserver le muscle, et ajoute du cardio doux. Protéines hautes pour limiter la perte musculaire. Ton volume 7j: ${Math.round(s.vol7)} ${s.unit} — maintiens-le pendant le déficit.`;
  }
  if (has("repos", "récup", "recup", "dors", "sommeil", "fatigue", "courbatur")) {
    return `Récupération: 48 h entre deux séances d'un même groupe musculaire, 7 à 9 h de sommeil, hydratation et protéines. Ta série est de ${s.streak} jour(s) — si tu sens une grosse fatigue, une journée off te rendra plus fort.`;
  }
  if (has("progress", "stagne", "plateau", "force", "plus fort")) {
    const t =
      s.vol7prev > 0 ? Math.round(((s.vol7 - s.vol7prev) / s.vol7prev) * 100) : 0;
    return t >= 0
      ? `Ton volume est en hausse de ${t}% sur 7 jours — la progression est là. Continue la surcharge progressive et note bien tes charges.`
      : `Ton volume a baissé de ${Math.abs(t)}% cette semaine. Une légère décharge peut aider, mais vérifie ton sommeil et ton alimentation avant de pousser à nouveau.`;
  }
  if (has("combien", "fréquence", "frequence", "par semaine", "souvent")) {
    return `3 à 5 séances par semaine est le sweet spot pour la plupart des objectifs. Tu en es à ${s.sessions7} sur 7 jours et ${s.sessions30} sur 30 jours. La régularité bat l'intensité ponctuelle.`;
  }
  if (has("manger", "protéine", "proteine", "nutrition", "calorie", "régime", "repas")) {
    return `Base ta nutrition sur: 1,6 à 2 g de protéines/kg, des glucides autour de l'entraînement, des bons lipides, et beaucoup de légumes. Ajuste les calories selon ton objectif (surplus pour le muscle, déficit pour la sèche).`;
  }
  if (has("motiv", "envie", "flemme", "abandon")) {
    return `Ta série est de ${s.streak} jour(s) — ne casse pas la chaîne ! Vise juste 20 minutes aujourd'hui ; le plus dur c'est d'enfiler les baskets. Le reste suit.`;
  }
  if (has("bonjour", "salut", "hello", "coucou", "ça va", "ca va")) {
    return `Salut 💪 Prêt à bosser ? Tu as fait ${s.sessions7} séance(s) cette semaine. Dis-moi sur quoi tu veux progresser : force, muscle, sèche, ou récupération ?`;
  }

  return `Sur la base de tes ${s.totalSessions} séances et ${s.sessions7} entraînement(s) cette semaine, mon conseil n°1 reste la régularité et la surcharge progressive. Pose-moi une question précise (muscle, sèche, hydratation, récupération, nutrition) et je te détaille un plan.`;
}

export async function askCoach(
  messages: CoachMsg[],
  stats: CoachStats
): Promise<{ reply: string; source: "ai" | "local" }> {
  try {
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages, context: buildContext(stats) }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.reply) return { reply: data.reply, source: "ai" };
    }
  } catch {
    /* fall through to local coach */
  }
  const last = messages.at(-1)?.text ?? "";
  return { reply: localCoach(last, stats), source: "local" };
}
