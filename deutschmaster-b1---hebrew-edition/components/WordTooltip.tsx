
import React, { useState } from 'react';

interface WordTooltipProps {
  word: string;
  translation: string;
}

const WordTooltip: React.FC<WordTooltipProps> = ({ word, translation }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className="relative inline-block mx-1 group cursor-help transition-all"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="german-font text-2xl font-semibold text-slate-800 border-b-2 border-indigo-200 hover:border-indigo-500 hover:text-indigo-700 transition-colors px-1 rounded-sm">
        {word}
      </span>
      {isVisible && (
        <div className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-900 text-white text-base font-bold rounded-xl shadow-2xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
          {translation}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </span>
  );
};

export default WordTooltip;
