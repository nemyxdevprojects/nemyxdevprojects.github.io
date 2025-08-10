import React from 'react';

interface TerminalInputProps {
  command: string;
  onCommandChange: (value: string) => void;
  onCommandSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isLoading: boolean;
}

const TerminalInput: React.FC<TerminalInputProps> = ({ command, onCommandChange, onCommandSubmit, inputRef, isLoading }) => {
  return (
    <form onSubmit={onCommandSubmit} className="flex w-full">
      <label htmlFor="command-input" className="flex-shrink-0 text-green-400">
        guest@terminal:~$ 
      </label>
      <input
        ref={inputRef}
        id="command-input"
        type="text"
        value={command}
        onChange={(e) => onCommandChange(e.target.value)}
        className="flex-grow pl-2 bg-transparent border-none outline-none text-green-400 disabled:text-gray-500"
        autoFocus
        autoComplete="off"
        disabled={isLoading}
      />
      {isLoading && <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>}
    </form>
  );
};

export default TerminalInput;