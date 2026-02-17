
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { createFreeChat, processChatMessage } from '../services/geminiService';
import AudioButton from './AudioButton';
import SpecialCharsRow from './SpecialCharsRow';

interface FreeChatViewProps {
  onBack: () => void;
}

const FreeChatView: React.FC<FreeChatViewProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatRef.current = createFreeChat();
    // Start with a greeting
    setMessages([{ role: 'model', text: 'Hallo! Wie geht es dir heute? Möchtest du über etwas Bestimmtes sprechen?' }]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    const response = await processChatMessage(chatRef.current, userText);
    setIsTyping(false);
    setMessages(prev => [...prev, response]);
  };

  const handleCharInsert = (char: string) => {
    setInputValue(prev => prev + char);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-5xl mx-auto h-[85vh] flex flex-col p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-slate-900 font-black">← חזרה</button>
        <div className="flex flex-col items-end">
          <h2 className="text-2xl font-black text-slate-900">צ\'אט חופשי (B1)</h2>
          <span className="text-green-600 font-bold text-sm">מורה פרטי אונליין</span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[48px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end text-right'}`}>
              <div className={`max-w-[85%] p-6 rounded-[32px] shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-bl-none' : 'bg-slate-100 text-slate-900 rounded-br-none'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="german-font text-xl font-black">{msg.text}</span>
                  {msg.role === 'model' && <AudioButton text={msg.text} size="sm" />}
                </div>
              </div>

              {msg.feedback && (
                <div className="mt-3 w-[85%] bg-slate-900 text-white p-5 rounded-[24px] text-sm animate-in fade-in slide-in-from-top-2">
                   <div className="flex justify-between items-center mb-3">
                     <span className="bg-white/20 px-3 py-1 rounded-full font-black text-[10px] uppercase">משוב דקדוקי</span>
                     <span className="font-black text-indigo-400">{msg.feedback.contextRating}</span>
                   </div>
                   {msg.feedback.grammarCorrection && (
                     <p className="mb-2 text-rose-400 font-black german-font">תיקון: {msg.feedback.grammarCorrection}</p>
                   )}
                   <p className="opacity-80 leading-relaxed font-semibold">{msg.feedback.explanation}</p>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-end">
              <div className="bg-slate-100 p-6 rounded-[32px] flex gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 md:p-10 bg-slate-50 border-t border-slate-100 space-y-4">
          <SpecialCharsRow onCharClick={handleCharInsert} className="justify-center" />
          <div className="flex gap-4">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="כתבו הודעה בגרמנית..."
              className="flex-1 p-6 rounded-[32px] border-4 border-white focus:border-indigo-400 outline-none font-black german-font text-xl shadow-inner"
            />
            <button 
              onClick={sendMessage}
              disabled={!inputValue || isTyping}
              className="w-20 h-20 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center text-3xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeChatView;
