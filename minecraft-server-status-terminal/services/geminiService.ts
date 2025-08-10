
import { GoogleGenAI } from "@google/genai";
import type { MinecraftServerStatus } from '../types';

// This function assumes process.env.API_KEY is set in the environment
const getApiKey = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }
  return apiKey;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

/**
 * Generates a creative description for a Minecraft server using Gemini.
 * @param serverData The data of the Minecraft server.
 * @returns A promise that resolves to a string containing the AI-generated description.
 */
export const describeServer = async (serverData: MinecraftServerStatus): Promise<string> => {
  const { motd, players, version, whitelist } = serverData;
  
  const serverInfo = `
    - Message of the Day (MOTD): ${motd?.clean?.join(' ') || 'Not available'}
    - Players: ${players?.online ?? 'N/A'} / ${players?.max ?? 'N/A'}
    - Version: ${version || 'Not available'}
    - Whitelisted: ${whitelist ? 'Yes' : 'No'}
  `.trim();

  const prompt = `
    You are a Minecraft enthusiast who writes exciting server reviews.
    Based on the following Minecraft server information, write a short, engaging description for a player looking for a new server to join.
    Be creative and highlight the key features mentioned in the data. Make it sound appealing.
    Do not repeat the raw data, but interpret it. For example, instead of "Players: 100/200", say "A bustling server with a large community!".
    Generate only the description text.

    Server Data:
    ${serverInfo}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw new Error('Failed to generate AI description. The AI might be temporarily unavailable.');
  }
};
