
import { GoogleGenAI } from "@google/genai";

// IMPORTANT: Do not expose your API key on the client-side in a real application.
// This key is retrieved from environment variables, which should be set up
// in your deployment environment. For local development, you can use a .env file.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a summary for a given transcript using the Gemini API.
 * @param transcript The video transcript to summarize.
 * @returns A promise that resolves to the summary string.
 */
export const summarizeTranscript = async (transcript: string): Promise<string> => {
  const prompt = `You are an expert at summarizing video content.
  Please provide a concise, easy-to-read summary of the following video transcript.
  The summary should be in well-structured markdown format. Use bullet points for key topics.
  
  Transcript:
  ---
  ${transcript}
  ---
  
  Summary:`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini API:", error);
    throw new Error("Failed to connect to the summarization service.");
  }
};
