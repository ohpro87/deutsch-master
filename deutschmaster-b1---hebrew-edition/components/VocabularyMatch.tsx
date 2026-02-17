
import React, { useState, useEffect, useCallback } from 'react';
import { VocabPair } from '../types';
import { generateVocab } from '../services/geminiService';

interface VocabularyMatchProps {
  onComplete: (points: number) => void;
  onBack: () => void;
}

const VocabularyMatch: React.FC<VocabularyMatchProps> = ({ onComplete, onBack }) => {
  const [pairs, setPairs] = useState<VocabPair[]>([]);
  const [shuffledGerman, setShuffledGerman] = useState<string[]>([]);
  const [shuffledHebrew, setShuffledHebrew] = useState<string[]>([]);
  const [selectedGerman, setSelectedGerman] = useState<string | null>(null);
  const [selectedHebrew, setSelectedHebrew] = useState<string | null>(null);
  const [matches, setMatches] = useState<string[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wrong, setWrong] = useState<[string, string] | null>(null);

  const fetchVocab = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateVocab();
      if (!data || data.length === 0) throw new Error("No vocab");
      setPairs(data);
      setShuffledGerman([...data.map(p => p.german)].sort(() => Math.random() - 0.5));
      setShuffledHebrew([...data.map(p => p.hebrew)].sort(() => Math.random() - 0.5));
    } catch (err) {
      setError("שגיאה בטעינה.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVocab(); }, [fetchVocab]);

  useEffect(() => {
    if (selectedGerman && selectedHebrew) {
      const pair = pairs.find(p => p.german === selectedGerman);
      if (pair?.hebrew === selectedHebrew) {
        setMatches(m => [...m, selectedGerman]);
        setSelectedGerman(null);
        setSelectedHebrew(null);
        if (matches.length + 1 === pairs.length) {
          setTimeout(() => onComplete(50), 1000);
        }
      } else {
        setWrong([selectedGerman, selectedHebrew]);
        setTimeout(() => {
          setSelectedGerman(null);
          setSelectedHebrew(null);
          setWrong(null);
        }, 800);
      }
    }
  }, [selectedGerman, selectedHebrew, pairs, matches.length, onComplete]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-800 font-black text-xl">מערבב קלפים חדשים...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12">
      <div className="flex justify-between items-center mb-12">
        <button onClick={onBack} className="text-slate-900 font-black text-lg hover:text-indigo-600 transition-colors">← חזרה</button>
        <h2 className="text-3xl font-black text-slate-900">משחק זיכרון B1</h2>
        <div className="bg-slate-900 text-white px-6 py-2 rounded-full font-black text-lg">
          {matches.length} / {pairs.length}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 md:gap-16">
        {/* German Column */}
        <div className="space-y-4">
          <h3 className="font-black text-slate-400 uppercase text-sm tracking-widest text-center mb-6">GERMAN</h3>
          {shuffledGerman.map(word => (
            <button
              key={word}
              disabled={matches.includes(word) || !!wrong}
              onClick={() => setSelectedGerman(word)}
              className={`w-full p-8 rounded-[24px] border-4 transition-all font-black german-font text-2xl shadow-xl flex items-center justify-center ${
                matches.includes(word) 
                  ? 'bg-emerald-500 border-emerald-500 text-white scale-95 opacity-40 cursor-default' 
                  : selectedGerman === word
                    ? wrong?.[0] === word ? 'bg-rose-500 border-rose-500 text-white animate-shake' : 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-white text-slate-800 hover:border-indigo-100 hover:scale-[1.02]'
              }`}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Hebrew Column */}
        <div className="space-y-4">
          <h3 className="font-black text-slate-400 uppercase text-sm tracking-widest text-center mb-6">HEBREW</h3>
          {shuffledHebrew.map(word => (
            <button
              key={word}
              disabled={pairs.some(p => p.hebrew === word && matches.includes(p.german)) || !!wrong}
              onClick={() => setSelectedHebrew(word)}
              className={`w-full p-8 rounded-[24px] border-4 transition-all font-black text-2xl shadow-xl flex items-center justify-center ${
                pairs.some(p => p.hebrew === word && matches.includes(p.german))
                  ? 'bg-emerald-500 border-emerald-500 text-white scale-95 opacity-40 cursor-default'
                  : selectedHebrew === word
                    ? wrong?.[1] === word ? 'bg-rose-500 border-rose-500 text-white animate-shake' : 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-white text-slate-800 hover:border-indigo-100 hover:scale-[1.02]'
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default VocabularyMatch;
