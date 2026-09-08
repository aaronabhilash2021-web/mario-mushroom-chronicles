// js/gemini.js
import { GEMINI_API_KEY } from './config.js';

export async function fetchNpcBanter(npcProfile, playerContext) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `
    You are an NPC in the retro platformer "Super Mario: Mushroom Chronicles 2D".
    Character Bio: ${npcProfile}
    Current World Context: ${playerContext}
    
    Respond in-character in 1 to 2 punchy, whimsical retro RPG lines. Do not use quotes or meta-commentary.
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Stay alert, Mario!";
  } catch (err) {
    console.error("Gemini API Banter Error:", err);
    return "The winds across the Mushroom Kingdom blow fiercely...";
  }
}