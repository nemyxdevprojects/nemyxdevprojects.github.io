
export type CommandType = 'input' | 'output' | 'error' | 'motd' | 'system' | 'help';

export interface CommandHistoryItem {
  type: CommandType;
  content: string;
}

export interface MinecraftServerStatus {
  online: boolean;
  ip: string;
  port: number;
  hostname?: string;
  version?: string;
  players?: {
    online: number;
    max: number;
  };
  motd?: {
    clean: string[];
  };
  whitelist?: boolean;
}
