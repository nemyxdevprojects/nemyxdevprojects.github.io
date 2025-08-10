import React from 'react';
import type { CommandHistoryItem } from '../types';

interface TerminalOutputProps {
  history: CommandHistoryItem[];
}

const OutputLine: React.FC<{ item: CommandHistoryItem }> = ({ item }) => {
  switch (item.type) {
    case 'input':
      return (
        <div className="flex">
          <span className="flex-shrink-0">guest@terminal:~$ </span>
          <p className="pl-2">{item.content}</p>
        </div>
      );
    case 'error':
      return <p className="text-red-500">Error: {item.content}</p>;
    case 'motd':
      return <pre className="whitespace-pre-wrap text-cyan-400">{item.content}</pre>;
    case 'system':
      return <p className="text-yellow-400">{item.content}</p>;
    case 'help':
      return <p className="text-blue-400">{item.content}</p>;
    case 'output':
    default:
      return <p>{item.content}</p>;
  }
};

const TerminalOutput: React.FC<TerminalOutputProps> = ({ history }) => {
  return (
    <div className="flex-grow">
      {history.map((item, index) => (
        <OutputLine key={index} item={item} />
      ))}
    </div>
  );
};

export default TerminalOutput;