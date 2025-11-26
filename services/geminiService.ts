import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "imagen-4.0-generate-001";

// Schema for the text analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.STRING,
      description: "A single, evocative word describing the emotional essence of the text (e.g., 'Melancholy', 'Eupeptic', 'Wistful').",
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A highly artistic, abstract visual metaphor prompt for an image generator. Do not describe people writing. Describe textures, lighting, landscapes, or surreal objects that represent the feeling. Max 40 words.",
    },
    insight: {
      type: Type.STRING,
      description: "A deep, philosophical, one-sentence reflection or affirmation based on the user's entry. Be poetic but concise.",
    },
    colors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 3 hex color codes that match the mood.",
    },
  },
  required: ["sentiment", "imagePrompt", "insight", "colors"],
};

export const analyzeJournalEntry = async (text: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: text,
      config: {
        systemInstruction: `You are a jungian psychologist and an abstract artist. 
        Your goal is to distill the user's journal entry into its emotional core.
        1. Identify the 'sentiment'.
        2. Create an 'insight' that validates their feeling or offers a new perspective.
        3. Create an 'imagePrompt' that is a VISUAL METAPHOR. If they talk about stress, maybe visualize a chaotic knot of neon wires, or a heavy stone in a calm lake. Avoid literal interpretations.
        4. Select a palette of 3 colors.`,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    if (!response.text) {
      throw new Error("No analysis generated");
    }

    return JSON.parse(response.text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Unable to analyze your thoughts at this moment.");
  }
};

export const generateEssenceImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: `${prompt} , highly detailed, 8k, artistic, cinematic lighting, masterpiece, oil painting texture or digital art style`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1', // Square for social sharing style
      },
    });

    if (!response.generatedImages?.[0]?.image?.imageBytes) {
      throw new Error("No image generated");
    }

    return response.generatedImages[0].image.imageBytes;
  } catch (error) {
    console.error("Image Generation Error:", error);
    // Fallback or re-throw. We re-throw to handle in UI.
    throw new Error("Unable to paint your essence.");
  }
};