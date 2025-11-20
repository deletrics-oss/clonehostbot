import { GoogleGenAI } from "@google/genai";

export const generateBotLogic = async (description: string): Promise<{ json: string, txt: string }> => {
  // Initialize using the key injected by Vite
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an expert WhatsApp Chatbot Logic Generator.
    Based on the following description of a business or service, generate two things:
    1. A JSON structure for a rule-based bot.
    2. A TXT knowledge base for the AI fallback.

    The JSON format MUST be exactly like this example:
    {
      "menu_principal_texto": "Welcome message...",
      "default_reply": "Fallback message...",
      "rules": [
        {
          "keywords": ["keyword1", "keyword2"],
          "reply": "Reply text...",
          "pause_bot_after_reply": false,
          "image_url": "optional_url"
        }
      ]
    }

    The TXT format should be a clear, paragraph-based description of the business, pricing, hours, and policies.

    Business Description: "${description}"

    Output valid JSON only for the first part, and plain text for the second part.
    Separate them with a delimiter "|||DIVIDER|||".
    Do not use markdown code blocks. Just raw text.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const responseText = result.text || "";
    const [jsonPart, txtPart] = responseText.split("|||DIVIDER|||");

    // Clean up potential markdown artifacts
    const cleanJson = jsonPart ? jsonPart.replace(/```json/g, '').replace(/```/g, '').trim() : "";
    const cleanTxt = txtPart ? txtPart.replace(/```txt/g, '').replace(/```/g, '').trim() : "";

    return {
      json: cleanJson,
      txt: cleanTxt
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao gerar inteligência. Verifique sua chave de API.");
  }
};