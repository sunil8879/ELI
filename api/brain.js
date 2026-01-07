export default async function handler(req, res) {
  const { topic, lang, mode, category } = req.body;
  const prompt = `Topic: ${topic}, Category: ${category}, Language: ${lang}.
  Style: ${mode === "Story" ? "Narrative (1000+ words)" : "Facts (500+ words)"}.
  Task: Explain for a 5-year-old in native ${lang} script. Context is ${category} (if fruit, talk about eating; if tech, talk about gadgets).
  Generate 5 MCQs in ${lang} script.
  Output JSON: {"explanation": "...", "quiz": [{"q": "...", "options": ["A","B","C","D"], "correct": 0}, ...]}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } })
  });
  const data = await response.json();
  res.status(200).json(JSON.parse(data.choices[0].message.content));
}
