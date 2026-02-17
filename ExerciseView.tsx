import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, Topic } from '../types';
import WordTooltip from './WordTooltip';
import AudioButton from './AudioButton';
import { generateExercises } from '../services/geminiService';

interface ExerciseViewProps {
  topic: Topic;
  onComplete: (points: number) => void;
  onBack: () => void;
}

const ExerciseView: React.FC<ExerciseViewProps> = ({ topic, onComplete, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateExercises(topic);
      if (!data || data.length === 0) throw new Error("No data received");
      setQuestions(data);
    } catch (err) {
      console.error(err);
      setError("אופס! נראה שיש תקלה בייצור התרגילים. נסה שוב בעוד רגע.");
    } finally {
      setLoading(false);
    }
  }, [topic]);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  // Scroll to feedback when an answer is selected
  useEffect(() => {
    if (isCorrect !== null && feedbackRef.current) {
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isCorrect]);

  const handleSelect = (option: string) => {
    if (isCorrect !== null || !questions[currentIndex]) return;
    setSelectedOption(option);
    const correct = option === questions[currentIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 20);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete(score);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="w-16 h-16 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8"></div>
      <h3 className="text-2xl font-black text-slate-800">מכין אתגר {topic}...</h3>
      <p className="text-slate-400 mt-2 font-bold italic">... (er/sie/es)</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="text-6xl mb-6">🏜️</div>
      <h3 className="text-2xl font-black text-slate-800 mb-4">{error}</h3>
      <button onClick={fetchExercises} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold">נסה שוב</button>
      <button onClick={onBack} className="mt-4 text-slate-500 font-bold">חזרה לתפריט</button>
    </div>
  );

  const current = questions[currentIndex];
  if (!current) return null;

  const sentence = current.sentence || [];
  const options = current.options || [];

  // Logic: Read "Lücke" (Gap) if not answered yet, read full sentence after.
  const audioText = sentence.map(t => t.word).join(' ').replace('____', isCorrect !== null ? (current.correctAnswer || '') : 'Lücke');

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-slate-900 font-black hover:text-indigo-600 transition-colors">← חזרה</button>
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-24 bg-slate-200 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-600 transition-all duration-500" style={{width: `${((currentIndex + 1) / Math.max(1, questions.length)) * 100}%`}}></div>
          </div>
          <span className="font-black text-slate-400 text-sm">{currentIndex + 1}/{questions.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-[32px] md:rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden mb-12">
        <div className="p-6 md:p-16 bg-slate-50/50 flex flex-col items-center gap-6 md:gap-8 border-b border-slate-100">
           <AudioButton text={audioText} size="lg" />
           <div className="text-center w-full" dir="ltr">
              <div className="flex flex-wrap justify-center gap-x-1 gap-y-4">
                {sentence.map((token, i) => (
                  <WordTooltip key={i} word={token.word} translation={token.translation} />
                ))}
              </div>
           </div>
        </div>

        <div className="p-6 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
            {options.map((option, idx) => (
              <button
                key={`${option}-${idx}`}
                onClick={() => handleSelect(option)}
                disabled={isCorrect !== null}
                className={`p-5 md:p-6 text-left rounded-[24px] md:rounded-[32px] border-4 transition-all font-black german-font text-lg md:text-xl flex items-center gap-4 ${
                  selectedOption === option
                    ? isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-rose-500 border-rose-500 text-white'
                    : option === current.correctAnswer && isCorrect !== null
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-50 hover:border-indigo-100 bg-slate-50 text-slate-900 active:bg-slate-100'
                }`}
              >
                <span className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white/20 flex flex-shrink-0 items-center justify-center text-xs md:text-sm border border-white/30">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="truncate">{option}</span>
              </button>
            ))}
          </div>

          <div ref={feedbackRef}>
            {isCorrect !== null && (
              <div className={`p-6 md:p-8 rounded-[32px] md:rounded-[40px] animate-in slide-in-from-top-4 duration-500 ${isCorrect ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-slate-900 text-white shadow-xl shadow-slate-200'}`}>
                 <h4 className="text-xl md:text-2xl font-black mb-3">{isCorrect ? 'נכון מאוד!' : 'רגע של למידה:'}</h4>
                 <p className="text-base md:text-lg opacity-90 leading-relaxed mb-4 font-semibold">{current.explanation}</p>
                 <div className="bg-white/10 p-4 md:p-5 rounded-2xl font-bold border border-white/20 text-sm md:text-base">
                   תרגום: {current.fullTranslation}
                 </div>
                 <button onClick={nextQuestion} className="mt-6 w-full py-4 md:py-5 bg-white text-slate-900 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl hover:scale-[1.02] active:scale-95 transition-all">
                   {currentIndex < questions.length - 1 ? 'ממשיכים לשאלה הבאה' : 'סיום התרגול'}
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseView;