
import React from 'react';

interface SpecialCharsRowProps {
  onCharClick: (char: string) => void;
  className?: string;
}

const SpecialCharsRow: React.FC<SpecialCharsRowProps> = ({ onCharClick, className = "" }) => {
  const chars = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {chars.map(char => (
        <button
          key={char}
          type="button"
          onClick={() => onCharClick(char)}
          className="w-10 h-10 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center font-black text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm active:scale-90"
        >
          {char}
        </button>
      ))}
    </div>
  );
};

export default SpecialCharsRow;
