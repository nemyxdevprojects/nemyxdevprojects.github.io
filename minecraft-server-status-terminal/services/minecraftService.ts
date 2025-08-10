
import type { MinecraftServerStatus } from '../types';

/**
 * Fetches the status of a Minecraft server using the mcsrvstat.us API.
 * @param address The address of the Minecraft server.
 * @returns A promise that resolves to the server status.
 */
export const fetchServerStatus = async (address: string): Promise<MinecraftServerStatus> => {
  try {
    const response = await fetch(`https://api.mcsrvstat.us/3/${address}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    
    if (data && typeof data.online !== 'undefined') {
      return data as MinecraftServerStatus;
    } else {
      throw new Error('Invalid API response format.');
    }
  } catch (error) {
    console.error('Failed to fetch server status:', error);
    throw new Error(`Could not fetch server status for ${address}. Please check the address and try again.`);
  }
};
