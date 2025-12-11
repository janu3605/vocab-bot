import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { message } = req.body; // Expecting { message: "Hello" } from frontend

    // 1. Setup Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // 2. Your Vocab Prompt
    const prompt = `
      User input: "${message}"
      
      Task:
      1. Rewrite the input using sophisticated (B2/C1) vocabulary. Bold the changes using HTML <b> tags.
      2. Provide a short, engaging conversational reply.
      
      Return JSON format:
      {
        "polished": "The polished version string...",
        "reply": "The conversational reply string..."
      }
    `;

    // 3. Generate
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // 4. Clean the JSON (Gemini sometimes adds markdown backticks)
    const jsonString = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(jsonString);

    // 5. Send back to your Frontend
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}