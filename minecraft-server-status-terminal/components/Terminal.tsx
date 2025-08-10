import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CommandHistoryItem, MinecraftServerStatus } from '../types';
import { fetchServerStatus } from '../services/minecraftService';
import { describeServer } from '../services/geminiService';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';

const welcomeMessage: CommandHistoryItem[] = [
    { type: 'system', content: 'Minecraft Server Status Terminal v1.0' },
    { type: 'system', content: 'Type "help" to see a list of available commands.' },
    { type: 'output', content: '' }
];

const helpContent: CommandHistoryItem[] = [
    { type: 'help', content: 'Available commands:' },
    { type: 'output', content: '  fetch <server_address>   - Get status of a Minecraft server.' },
    { type: 'output', content: '  describe <server_address> - Get an AI-generated description of a server.' },
    { type: 'output', content: '  help                     - Shows this help message.' },
    { type: 'output', content: '  clear                    - Clears the terminal screen.' },
];

const Terminal: React.FC = () => {
    const [history, setHistory] = useState<CommandHistoryItem[]>(welcomeMessage);
    const [command, setCommand] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const addHistory = useCallback((...items: CommandHistoryItem[]) => {
        setHistory(prev => [...prev, ...items]);
    }, []);

    const handleFetch = async (address: string) => {
        if (!address) {
            addHistory({ type: 'error', content: 'Usage: fetch <server_address>' });
            return;
        }
        addHistory({ type: 'system', content: `Fetching data for ${address}...` });
        try {
            const data = await fetchServerStatus(address);
            if (!data.online) {
                addHistory({ type: 'error', content: `Server ${data.hostname || address} is offline.` });
                return;
            }
            const output: CommandHistoryItem[] = [
                { type: 'output', content: `Status: Online` },
                { type: 'output', content: `Host: ${data.hostname || 'N/A'}` },
                { type: 'output', content: `Version: ${data.version || 'N/A'}` },
                { type: 'output', content: `Players: ${data.players?.online ?? 0} / ${data.players?.max ?? 0}` },
                { type: 'output', content: `Whitelisted: ${data.whitelist ? 'Yes' : 'No'}` },
            ];
            if (data.motd?.clean?.length) {
                output.push({ type: 'output', content: 'MOTD:' });
                output.push({ type: 'motd', content: data.motd.clean.join('\n') });
            }
            addHistory(...output);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            addHistory({ type: 'error', content: errorMessage });
        }
    };
    
    const handleDescribe = async (address: string) => {
        if (!address) {
            addHistory({ type: 'error', content: 'Usage: describe <server_address>' });
            return;
        }
        addHistory({ type: 'system', content: `Fetching data for ${address} to generate description...` });
        let serverData: MinecraftServerStatus;
        try {
            serverData = await fetchServerStatus(address);
            if (!serverData.online) {
                addHistory({ type: 'error', content: `Cannot describe server ${serverData.hostname || address} because it is offline.` });
                return;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during fetch.';
            addHistory({ type: 'error', content: errorMessage });
            return;
        }
    
        addHistory({ type: 'system', content: 'AI is thinking... please wait.' });
        try {
            const description = await describeServer(serverData);
            addHistory({ type: 'output', content: 'AI-Generated Description:' }, { type: 'output', content: description });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown AI error occurred.';
            addHistory({ type: 'error', content: errorMessage });
        }
    };
    

    const handleCommandSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading || !command.trim()) {
            if(!command.trim()) addHistory({type: 'input', content: ''});
            return;
        };

        const trimmedCommand = command.trim();
        addHistory({ type: 'input', content: trimmedCommand });
        setCommand('');
        setIsLoading(true);

        const [cmd, ...args] = trimmedCommand.split(/\s+/);

        switch (cmd.toLowerCase()) {
            case 'fetch':
                await handleFetch(args[0]);
                break;
            case 'describe':
                await handleDescribe(args[0]);
                break;
            case 'help':
                addHistory(...helpContent);
                break;
            case 'clear':
                setHistory([]);
                break;
            default:
                addHistory({ type: 'error', content: `command not found: ${cmd}` });
        }

        setIsLoading(false);
        // Refocus after command execution
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    return (
        <div className="flex flex-col h-full w-full p-4" onClick={() => inputRef.current?.focus()}>
            <TerminalOutput history={history} />
            <TerminalInput 
                command={command}
                onCommandChange={setCommand}
                onCommandSubmit={handleCommandSubmit}
                inputRef={inputRef}
                isLoading={isLoading}
            />
            <div ref={bottomRef} />
        </div>
    );
};

export default Terminal;