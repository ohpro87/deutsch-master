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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
    <div className="max-w-5xl mx-auto h-[90vh] flex flex-col p-3 md:p-8">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <button onClick={onBack} className="text-slate-900 font-black text-sm md:text-base">← חזרה</button>
        <div className="flex flex-col items-end">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight text-right">צ'אט חופשי (B1)</h2>
          <span className="text-green-600 font-bold text-[10px] md:text-sm uppercase tracking-wider">Online Teacher</span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[32px] md:rounded-[48px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end text-right'}`}>
              <div className={`max-w-[90%] p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-bl-none' : 'bg-slate-100 text-slate-900 rounded-br-none'
              }`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="german-font text-lg md:text-xl font-bold">{msg.text}</span>
                  {msg.role === 'model' && <AudioButton text={msg.text} size="sm" />}
                </div>
              </div>

              {msg.feedback && (
                <div className="mt-3 w-[90%] bg-slate-900 text-white p-4 md:p-5 rounded-[20px] md:rounded-[24px] text-xs md:text-sm animate-in fade-in slide-in-from-top-2">
                   <div className="flex justify-between items-center mb-3">
                     <span className="bg-white/20 px-2 py-0.5 rounded-full font-black text-[9px] uppercase">משוב דקדוקי</span>
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
              <div className="bg-slate-100 p-4 rounded-full flex gap-1.5 px-6">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-10 bg-slate-50 border-t border-slate-100 space-y-3">
          <SpecialCharsRow onCharClick={handleCharInsert} className="justify-center scale-90 md:scale-100" />
          <div className="flex gap-2 md:gap-4">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') sendMessage(); }}
              placeholder="כתבו בגרמנית..."
              className="flex-1 p-4 md:p-6 rounded-2xl md:rounded-[32px] border-4 border-white focus:border-indigo-400 outline-none font-bold german-font text-base md:text-xl shadow-inner min-w-0"
            />
            <button 
              onClick={sendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="w-14 h-14 md:w-20 md:h-20 bg-indigo-600 text-white rounded-2xl md:rounded-[32px] flex flex-shrink-0 items-center justify-center text-xl md:text-3xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
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