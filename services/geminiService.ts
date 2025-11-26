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
      description: "A prompt for a hyper-realistic, symbolic image. Describe specific objects, lighting, and textures in high detail. Max 60 words.",
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
        systemInstruction: `You are a visionary artist specializing in Hyper-Realistic Symbolism and Jungian psychology.
        
        1. Identify the 'sentiment' (one evocative word).
        2. Create a philosophical 'insight' that validates their feeling or offers a new perspective.
        3. Create an 'imagePrompt' for a high-end image generator (Imagen).
           - GOAL: A Hyper-realistic, 8k, Symbolic Masterpiece.
           - CRITICAL: Do NOT be literal. No people writing, no pens, no journals.
           - CONCEPT: Translate the emotion into a tangible, photorealistic object or environment (e.g., 'Anxiety' -> A hyper-detailed glass sphere cracking under pressure; 'Peace' -> A calm, mirror-like lake reflecting a galaxy).
           - DETAILS: Focus on exquisite lighting (volumetric god rays, bioluminescence, cinematic rim lighting), material properties (translucency, refraction, weathering), and atmosphere.
           - STYLE: Photorealistic, 8k, Unreal Engine 5, Octane Render, Macro Photography, Cinematic.
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
      prompt: `${prompt}, hyper-realistic, 8k resolution, photorealistic, cinematic lighting, volumetric, highly detailed, symbolic masterpiece, sharp focus, ray tracing`,
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