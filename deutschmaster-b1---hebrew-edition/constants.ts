
import { Topic } from './types';

export const TOPICS_META = [
  { 
    id: Topic.FREE_CHAT, 
    title: 'צ\'אט חופשי עם משוב', 
    description: 'דברו חופשי בגרמנית וקבלו תיקוני דקדוק והצעות לשיפור בזמן אמת', 
    icon: '💬',
    color: 'bg-green-600',
    category: 'play'
  },
  { 
    id: Topic.CONVERSATION, 
    title: 'סימולציית שיחה', 
    description: 'תרגול שיחות יומיומיות: במסעדה, בבנק או עם חברים', 
    icon: '🎭',
    color: 'bg-yellow-500',
    category: 'play'
  },
  { 
    id: Topic.IHR_SPECIAL, 
    title: 'הכל על "אתם" (ihr)', 
    description: 'תרגול אינטנסיבי להטיית "ihr" - פעלים, כינויי קניין וציווי', 
    icon: '👥',
    color: 'bg-orange-500',
    category: 'grammar'
  },
  { 
    id: Topic.PRONOUN_CASES, 
    title: 'הטיות er / sie / es', 
    description: 'מעבר בין Nominativ, Akkusativ ו-Dativ עבור גוף שלישי', 
    icon: '👤',
    color: 'bg-cyan-600',
    category: 'grammar'
  },
  { 
    id: Topic.PREPOSITIONS, 
    title: 'פעלים עם מילות יחס', 
    description: 'Verben mit Präpositionen (träumen von, warten auf...)', 
    icon: '🏗️',
    color: 'bg-pink-600',
    category: 'grammar'
  },
  { 
    id: Topic.REFLEXIVE, 
    title: 'פעלים רפלקסיביים', 
    description: 'שימוש נכון ב-sich, mich, mir (Akk/Dat)', 
    icon: '🔄',
    color: 'bg-indigo-600',
    category: 'grammar'
  },
  { 
    id: Topic.LASSEN, 
    title: 'מבנה ה-Lassen', 
    description: 'פעולות שנעשות עבורי או רשות (B1 core)', 
    icon: '🛠️',
    color: 'bg-rose-600',
    category: 'grammar'
  },
  { 
    id: Topic.CONJUNCTIONS, 
    title: 'מילות קישור מורכבות', 
    description: 'weil, obwohl, trotzdem, dass', 
    icon: '🔗',
    color: 'bg-emerald-600',
    category: 'grammar'
  },
  { 
    id: Topic.MODAL_VERBS, 
    title: 'פעלים מודאליים ב-B1', 
    description: 'סבירות, רשות ויכולת בזמנים שונים', 
    icon: '🎯',
    color: 'bg-blue-600',
    category: 'grammar'
  },
  { 
    id: Topic.PARTIZIP_2, 
    title: 'עבר מושלם (Perfekt)', 
    description: 'פעלים חזקים, חלשים ומעורבים', 
    icon: '⏳',
    color: 'bg-amber-600',
    category: 'grammar'
  },
  { 
    id: Topic.VOCABULARY, 
    title: 'אוצר מילים ומשחקים', 
    description: 'לימוד מילים דרך משחקי זיכרון וכרטיסיות', 
    icon: '🧠',
    color: 'bg-purple-600',
    category: 'play'
  }
];
