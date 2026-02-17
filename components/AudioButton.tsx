
import React, { useState } from 'react';
import { speakText } from '../services/geminiService';

interface AudioButtonProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
}

const AudioButton: React.FC<AudioButtonProps> = ({ text, size = 'md' }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    setIsPlaying(true);
    await speakText(text);
    setIsPlaying(false);
  };

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2.5 text-lg',
    lg: 'p-4 text-2xl'
  };

  return (
    <button 
      onClick={handlePlay}
      disabled={isPlaying}
      className={`${sizeClasses[size]} bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90 ${isPlaying ? 'animate-pulse opacity-50' : ''}`}
      title="שמע הגייה"
    >
      {isPlaying ? '⏳' : '🔊'}
    </button>
  );
};

export default AudioButton;
