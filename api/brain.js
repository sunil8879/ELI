export default async function handler(req, res) {
  // 1. Set Headers to allow requests from your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { topic, lang, mode, category } = req.body;

    // Use a slightly lower word target to prevent Vercel 10s timeout
    const lengthGoal = mode === "Story" ? "Long Narrative Story" : "Detailed Facts";

    const prompt = `Topic: ${topic}, Category: ${category}, Language: ${lang}.
    Style: ${lengthGoal}. Task: Explain for a 5-year-old in native ${lang} script. 
    Context is ${category}. Generate 5 MCQs in ${lang} script.
    Output JSON: {"explanation": "...", "quiz": [{"q": "...", "options": ["A","B","C","D"], "correct": 0}, ...]}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${process.env.GROQ_KEY}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        model: "llama-3.1-8b-instant", 
        messages: [{ role: "user", content: prompt }], 
        response_format: { type: "json_object" },
        max_tokens: 3000 // Limit tokens to prevent timeout
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      return res.status(500).json({ error: errData.error.message });
    }

    const data = await response.json();
    const aiContent = JSON.parse(data.choices[0].message.content);
    
    return res.status(200).json(aiContent);

  } catch (err) {
    return res.status(500).json({ error: "Brain is processing too much. Please try a shorter topic." });
  }
}
