export default async function handler(req, res) {
  // Allow requests from your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { topic, lang, mode, category } = req.body;

    // This is the NEW strict prompt
    const prompt = `
    Topic: "${topic}", Category: "${category}", Language: "${lang}".
    Strict Instruction: 
    1. Use ONLY the native script of ${lang} (e.g., if Hindi, use Devanagari characters only). 
    2. ABSOLUTELY NO ROMAN/ENGLISH letters for the native language text.
    3. If the topic is an object like "Apple", check the category "${category}". If it's Food, it's the fruit. If it's Tech, it's the gadget.
    4. Style: ${mode === "Story" ? "Narrative Story (MUST BE AT LEAST 600 words)" : "Detailed Facts (MUST BE AT LEAST 400 words)"}.
    5. Generate exactly 5 MCQs in native ${lang} script.

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
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const aiContent = JSON.parse(data.choices[0].message.content);
    
    return res.status(200).json(aiContent);

  } catch (err) {
    return res.status(500).json({ error: "Brain is processing. Please wait." });
  }
}
