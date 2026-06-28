// Vercel serverless function — real AI coach backed by the Anthropic API.
// Requires the env var ANTHROPIC_API_KEY (set in the Vercel project settings).
// Optional: COACH_MODEL (defaults to a fast, capable Claude model).

const SYSTEM = `Tu es "Forge Coach", un coach sportif et nutritionnel personnel intégré à une app de musculation.
Style: tutoiement, direct, motivant mais jamais niais, en français. Réponses courtes (2 à 5 phrases),
concrètes et actionnables. Tu peux donner des conseils sur l'entraînement, la nutrition, l'hydratation,
la récupération et la progression. Base-toi sur les données réelles de l'utilisateur quand elles sont fournies.
Ne donne jamais de conseil médical; en cas de douleur ou de problème de santé, recommande un professionnel.
N'invente pas de chiffres: si une donnée manque, dis-le et propose comment la suivre.`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Signals the client to use its built-in offline coach.
    res.status(501).json({ error: "no_key" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { messages = [], context = "" } = body;
    const model = process.env.COACH_MODEL || "claude-haiku-4-5-20251001";

    const mapped = (messages as any[])
      .filter((m) => m && (m.text || m.content))
      .slice(-12)
      .map((m) => ({
        role: m.role === "coach" || m.role === "assistant" ? "assistant" : "user",
        content: String(m.text ?? m.content),
      }));

    if (mapped.length === 0 || mapped[0].role !== "user") {
      res.status(400).json({ error: "bad_request" });
      return;
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 600,
        system: SYSTEM + (context ? `\n\nDonnées actuelles de l'utilisateur:\n${context}` : ""),
        messages: mapped,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(502).json({ error: "upstream", detail: detail.slice(0, 300) });
      return;
    }

    const data = await upstream.json();
    const reply = Array.isArray(data?.content)
      ? data.content.map((b: any) => b.text || "").join("").trim()
      : "";
    res.status(200).json({ reply });
  } catch (e: any) {
    res.status(500).json({ error: "server", detail: String(e?.message || e) });
  }
}
