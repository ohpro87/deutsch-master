
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateConversationScenario } from '../services/geminiService';
import AudioButton from './AudioButton';
import SpecialCharsRow from './SpecialCharsRow';

interface ConversationViewProps {
  onComplete: (points: number) => void;
  onBack: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ onComplete, onBack }) => {
  const [steps, setSteps] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const init = useCallback(async () => {
    setLoading(true);
    try {
      const data = await generateConversationScenario();
      setSteps(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { init(); }, [init]);

  const handleAction = (ans: string) => {
    const step = steps[currentIndex];
    const isCorrect = ans.trim().toLowerCase() === step.correctAnswer.toLowerCase();
    setFeedback({
      isCorrect,
      text: isCorrect ? 'מעולה! זה בדיוק מה שהיה צריך להגיד.' : `לא בדיוק. התשובה הנכונה היא: ${step.correctAnswer}. ${step.explanation}`
    });
  };

  const next = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(c => c + 1);
      setFeedback(null);
      setUserInput('');
      setSelectedOption(null);
    } else {
      onComplete(40);
    }
  };

  const handleCharInsert = (char: string) => {
    setUserInput(prev => prev + char);
    inputRef.current?.focus();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-6 font-black text-slate-800">מארגן את הסיטואציה...</p>
    </div>
  );

  const current = steps[currentIndex];
  if (!current) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-12">
        <button onClick={onBack} className="text-slate-900 font-black">← חזרה</button>
        <span className="font-black text-slate-400">שלב {currentIndex + 1} מתוך {steps.length}</span>
      </div>

      <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-12 bg-slate-50 flex flex-col items-center text-center gap-6 border-b border-slate-100">
          <div className="w-20 h-20 bg-yellow-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg">👤</div>
          <div className="flex flex-col items-center gap-4">
             <div className="flex items-center gap-3">
               <h3 className="german-font text-3xl font-black text-slate-900">{current.aiPrompt}</h3>
               <AudioButton text={current.aiPrompt} />
             </div>
             <p className="text-slate-400 font-bold text-lg">{current.translation}</p>
          </div>
        </div>

        <div className="p-10">
          {current.type === 'multiple_choice' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {current.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => { setSelectedOption(opt); handleAction(opt); }}
                  disabled={!!feedback}
                  className={`p-6 rounded-[32px] border-4 font-black german-font text-xl transition-all ${
                    selectedOption === opt
                      ? feedback?.isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-slate-50 border-slate-50 hover:border-yellow-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="german-font text-2xl font-black text-center p-8 bg-slate-50 rounded-[32px]">
                {current.sentence.replace('____', '......')}
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={!!feedback}
                    placeholder="הקלידו את המילה החסרה..."
                    className="flex-1 p-6 rounded-[32px] bg-white border-4 border-slate-100 focus:border-yellow-400 outline-none font-black german-font text-xl"
                  />
                  <button 
                    onClick={() => handleAction(userInput)}
                    disabled={!userInput || !!feedback}
                    className="px-10 bg-slate-900 text-white rounded-[32px] font-black"
                  >בדיקה</button>
                </div>
                {!feedback && (
                  <SpecialCharsRow onCharClick={handleCharInsert} className="justify-center" />
                )}
              </div>
            </div>
          )}

          {feedback && (
            <div className={`mt-8 p-8 rounded-[40px] animate-in slide-in-from-top-4 ${feedback.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
              <p className="text-xl font-black mb-6">{feedback.text}</p>
              <button onClick={next} className="w-full py-5 bg-white text-slate-900 rounded-[24px] font-black text-xl">הממשך בשיחה</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationView;
