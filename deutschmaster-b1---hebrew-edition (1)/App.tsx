
import React, { useState, useMemo, useEffect } from 'react';
import { Topic, UserStats } from './types';
import { TOPICS_META } from './constants';
import ExerciseView from './components/ExerciseView';
import VocabularyMatch from './components/VocabularyMatch';
import ConversationView from './components/ConversationView';
import FreeChatView from './components/FreeChatView';

const STORAGE_KEY = 'deutsch_master_user_stats';

const App: React.FC = () => {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [filter, setFilter] = useState<'all' | 'grammar' | 'play'>('all');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  // Initialize stats from localStorage
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse stats", e);
      }
    }
    return {
      points: 0,
      streak: 0,
      completedExercises: 0
    };
  });

  // Handle PWA Installation Prompt
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // Save stats whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const handleComplete = (earned: number) => {
    setStats(prev => ({
      ...prev,
      points: prev.points + earned,
      completedExercises: prev.completedExercises + 1,
      streak: prev.streak === 0 ? 1 : prev.streak 
    }));
    setCurrentTopic(null);
  };

  const filteredTopics = useMemo(() => {
    if (filter === 'all') return TOPICS_META;
    return TOPICS_META.filter(t => (t as any).category === filter);
  }, [filter]);

  const renderContent = () => {
    if (!currentTopic) {
      return (
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Welcome Dashboard */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
            <div className="text-right">
              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">היי, מוכן לתרגל גרמנית? 👋</h1>
              <p className="text-slate-500 text-xl font-medium">היום נתמקד בנושאי B1 מתקדמים</p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white px-8 py-5 rounded-[32px] shadow-xl shadow-indigo-100 border border-indigo-50 text-center">
                <div className="text-indigo-600 text-3xl font-black">{stats.points}</div>
                <div className="text-slate-400 text-xs font-black uppercase tracking-widest text-[10px]">XP נקודות</div>
              </div>
              <div className="bg-slate-900 px-8 py-5 rounded-[32px] shadow-xl shadow-slate-200 text-center">
                <div className="text-orange-400 text-3xl font-black">{stats.streak} 🔥</div>
                <div className="text-slate-400 text-xs font-black uppercase tracking-widest text-[10px]">יום רצף</div>
              </div>
            </div>
          </div>

          {/* Nav Filter */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button onClick={() => setFilter('all')} className={`px-8 py-3 rounded-full font-black text-lg transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>הכל</button>
            <button onClick={() => setFilter('grammar')} className={`px-8 py-3 rounded-full font-black text-lg transition-all ${filter === 'grammar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>דקדוק B1</button>
            <button onClick={() => setFilter('play')} className={`px-8 py-3 rounded-full font-black text-lg transition-all ${filter === 'play' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>אינטראקטיבי</button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTopics.map((meta) => (
              <button
                key={meta.id}
                onClick={() => setCurrentTopic(meta.id)}
                className="group relative bg-white p-10 rounded-[48px] border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-right overflow-hidden flex flex-col items-start"
              >
                <div className={`${meta.color} w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-8 shadow-xl group-hover:rotate-12 transition-transform`}>
                  {meta.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{meta.title}</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8 flex-1">{meta.description}</p>
                <div className="flex items-center gap-3 text-indigo-600 font-black text-lg group-hover:translate-x-[-8px] transition-transform">
                  <span>בוא נתחיל</span>
                  <span>←</span>
                </div>
                <div className={`absolute top-0 right-0 w-2 h-full ${meta.color} opacity-10`}></div>
              </button>
            ))}
          </div>

          {/* Branding */}
          <div className="mt-24 text-center pb-8 border-t border-slate-100 pt-12">
            <p className="text-slate-400 font-bold mb-4">מאחלים לך למידה מהנה ופורייה!</p>
            <a 
              href="https://ohpro.net" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-colors group"
            >
              <span className="text-slate-500 font-black text-xs uppercase tracking-widest">Powered by</span>
              <span className="text-indigo-600 font-black text-lg group-hover:underline">Ohpro.net</span>
            </a>
          </div>
        </div>
      );
    }

    if (currentTopic === Topic.VOCABULARY) {
      return <VocabularyMatch onBack={() => setCurrentTopic(null)} onComplete={handleComplete} />;
    }

    if (currentTopic === Topic.CONVERSATION) {
      return <ConversationView onBack={() => setCurrentTopic(null)} onComplete={handleComplete} />;
    }

    if (currentTopic === Topic.FREE_CHAT) {
      return <FreeChatView onBack={() => setCurrentTopic(null)} />;
    }

    return <ExerciseView topic={currentTopic} onBack={() => setCurrentTopic(null)} onComplete={handleComplete} />;
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-6 px-6 md:px-10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTopic(null)}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">D</div>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 uppercase">Deutsch<span className="text-indigo-600">Master</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            {isInstallable && (
              <button 
                onClick={handleInstallClick}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 animate-bounce"
              >
                <span>📲</span>
                התקן אפליקציה
              </button>
            )}
            <div className="hidden lg:flex gap-8 font-black text-slate-400 uppercase tracking-widest text-xs">
              <button onClick={() => {setCurrentTopic(null); setFilter('grammar');}} className="hover:text-indigo-600 transition-colors">לימוד</button>
              <button onClick={() => {setCurrentTopic(null); setFilter('play');}} className="hover:text-indigo-600 transition-colors">משחקים</button>
            </div>
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter text-left leading-tight bg-slate-50 p-2 rounded-lg border border-slate-100">
              Powered by<br/><span className="text-slate-400">Ohpro.net</span>
            </div>
          </div>
        </div>
        
        {/* Mobile Install Bar */}
        {isInstallable && (
          <div className="sm:hidden mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-center">
            <span className="text-indigo-900 font-black text-sm">התקן את האפליקציה למסך הבית!</span>
            <button 
              onClick={handleInstallClick}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-xs"
            >התקן</button>
          </div>
        )}
      </nav>

      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
