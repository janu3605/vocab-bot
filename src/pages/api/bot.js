// src/pages/api/bot.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini outside the handler to save resources
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // 1. Only allow POST requests (Telegram sends POST)
  if (req.method !== 'POST') {
    return res.status(200).send('Method Not Allowed');
  }

  try {
    const { message } = req.body;

    // Safety check: Ensure a message exists
    if (!message || !message.text) {
      return res.status(200).json({ status: 'ignored' });
    }

    // 2. The Prompt Strategy
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are a vocabulary coach. The user sent: "${message.text}"
      
      Task:
      1. Rewrite their sentence using B2/C1 level vocabulary (bold the changes).
      2. Provide a conversational reply to keep the chat going.
      
      Format: "Your Version: ... \n\n My Reply: ..."
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // 3. Send reply back to Telegram
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: aiResponse,
        parse_mode: 'Markdown'
      })
    });

    // 4. Respond to Telegram's server so it stops retrying
    return res.status(200).send('OK');

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Internal Server Error');
  }
}