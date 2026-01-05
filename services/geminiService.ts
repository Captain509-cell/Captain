
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

export const performSearch = async (query: string): Promise<{ text: string; sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Search for high-quality information about: ${query}. Focus on positive, impactful, and accurate data.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return {
    text: response.text || "No response received.",
    sources: sources.map((chunk: any) => ({
      title: chunk.web?.title || "Source",
      uri: chunk.web?.uri || "#"
    }))
  };
};

export const generateHyperRealisticImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // High quality prompt enhancement for realism
  const enhancedPrompt = `Hyper-realistic, professional photography, cinematic lighting, 8k resolution, photorealistic, natural textures, masterpiece. Subject: ${prompt}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: enhancedPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      }
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image data found in response");
};

export const generateProVideo = async (prompt: string, onProgress: (msg: string) => void): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const enhancedPrompt = `Professional cinematography, photorealistic, cinematic movement, high fidelity, realistic lighting. Subject: ${prompt}`;

  onProgress("Initializing high-fidelity neural engine...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: enhancedPrompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  const messages = [
    "Synthesizing frames...",
    "Applying cinematic lighting...",
    "Rendering motion vectors...",
    "Finalizing visual fidelity...",
    "Optimizing output stream..."
  ];

  let msgIndex = 0;
  while (!operation.done) {
    onProgress(messages[msgIndex % messages.length]);
    msgIndex++;
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed - no URI");

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const checkAuth = async (): Promise<boolean> => {
  if (typeof window.aistudio === 'undefined') return true; // Fallback for local dev if needed
  return await window.aistudio.hasSelectedApiKey();
};

export const requestAuth = async () => {
  if (typeof window.aistudio !== 'undefined') {
    await window.aistudio.openSelectKey();
  }
};
