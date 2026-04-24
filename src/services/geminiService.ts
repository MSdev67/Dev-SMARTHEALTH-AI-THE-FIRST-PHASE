import { GoogleGenAI, ThinkingLevel } from "@google/genai";

/**
 * IMPORTANT FOR VITE:
 * Use import.meta.env instead of process.env
 * Add VITE_GEMINI_API_KEY in your .env file
 */

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing VITE_GEMINI_API_KEY in .env file");
}

export const ai = new GoogleGenAI({
  apiKey: apiKey || "",
});

const cache = new Map<string, any>();

/* ---------------------------------------
   PREFETCH COMMON QUERIES
---------------------------------------- */
const popularQueries = [
  {
    symptoms: ["fever", "cough"],
    prediction: "Common Cold",
    language: "en",
  },
  {
    symptoms: ["headache", "sensitivity to light"],
    prediction: "Migraine",
    language: "en",
  },
];

popularQueries.forEach((q) => {
  const key = `predict:${q.language}:${q.symptoms.sort().join(",")}`;

  cache.set(key, {
    prediction: q.prediction,
    confidence: 0.85,
    analysis:
      "This is a pre-fetched common diagnosis pattern based on clinical baseline metrics.",
  });
});

/* ---------------------------------------
   LANGUAGE HELPER
---------------------------------------- */
function getLanguageName(language: string) {
  switch (language) {
    case "hi":
      return "Hindi";
    case "ka":
      return "Kannada";
    case "te":
      return "Telugu";
    case "ta":
      return "Tamil";
    case "ml":
      return "Malayalam";
    default:
      return "English";
  }
}

/* ---------------------------------------
   DISEASE PREDICTION
---------------------------------------- */
export async function predictDisease(
  symptoms: string[],
  language: string = "en"
) {
  const cacheKey = `predict:${language}:${[...symptoms].sort().join(",")}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Analyze these symptoms: ${symptoms.join(", ")}.

Provide:
1. Possible disease prediction
2. Confidence score (0 to 1)
3. Short medical guidance

Return ONLY valid JSON:

{
  "prediction": "string",
  "confidence": 0.0,
  "analysis": "string"
}

Use ${getLanguageName(language)} language.
      `,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const result = JSON.parse(response.text || "{}");

    cache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error("AI Prediction error:", error);

    return {
      prediction: "Unable to predict",
      confidence: 0,
      analysis: "Please try again later.",
    };
  }
}

/* ---------------------------------------
   MEDICAL CHAT STREAM
---------------------------------------- */
export async function medicalChatStream(
  messages: {
    role: "user" | "model";
    parts: { text: string }[];
  }[],
  language: string = "en",
  deepAnalysis: boolean = false
) {
  try {
    const lastMessage =
      messages[messages.length - 1]?.parts?.[0]?.text || "Hello";

    const chat = ai.chats.create({
      model: deepAnalysis ? "gemini-2.5-pro" : "gemini-2.5-flash",
      config: {
        systemInstruction: `
You are SmartHealth AI, an advanced medical assistant.

Rules:
- Give symptom guidance
- Explain medicines generally
- Suggest doctor visit when serious
- Be short, clear, human-friendly
- Respond in ${getLanguageName(language)}
${deepAnalysis ? "- Use deep clinical reasoning." : ""}
        `,
        thinkingConfig: {
          thinkingLevel: deepAnalysis
            ? ThinkingLevel.HIGH
            : ThinkingLevel.LOW,
        },
      },
    });

    const stream = await chat.sendMessageStream({
      message: lastMessage,
    });

    return stream;
  } catch (error) {
    console.error("Medical Chat Error:", error);
    return null;
  }
}