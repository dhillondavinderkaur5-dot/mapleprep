
import React, { useState, useEffect, useRef } from 'react';
import { LessonPlan, Student, GradeLevel, SortingGameData, StoryGameData, MemoryGameData, MathBananaRound, GameQuestion, WorksheetStyle, GeneratedWorksheet, TeacherBookmark, WeeklyPlanData, PlannerEntry, Subject } from '../types';
import { Plus, Search, Clock, FileText, Trash2, Edit, Copy, Sparkles, BookOpen, Users, UserPlus, Shuffle, Grid, Gamepad2, Play, ExternalLink, Calculator, Microscope, Globe, Palette, X, Timer, Brain, Rocket, Languages, Smile, Zap, MessageCircle, Music, Move, RefreshCcw, Heart, Map, CheckCircle, AlertCircle, HelpCircle, Printer, Eye, EyeOff, PenTool, Puzzle, Lightbulb, Sigma, Link2, Globe2, CalendarDays, Calendar, Presentation, Monitor, Maximize, Minimize, Settings, Hourglass, Volume2, AlertOctagon, Image as ImageIcon, Type, MousePointer2, Settings2, Megaphone, Star, Bell, PartyPopper, CheckSquare, Pause, RotateCcw as RotateCcwIcon, VolumeX, Save, LayoutTemplate, BookPlus, CalendarPlus, Dices, List, Trophy, Filter, Link, ArrowRight, Award } from 'lucide-react';
import { GRADES, SUBJECTS } from '../constants';
import { generateMathBananaGame, generateSortingGame, generateStoryGame, generateMemoryGame, generateQuizGame, generateStandaloneWorksheet } from '../services/geminiService';
import { Button } from './Button';

interface TeacherDashboardProps {
  teacherName: string;
  savedLessons: LessonPlan[];
  onCreateClick: () => void;
  onLessonClick: (lesson: LessonPlan) => void;
  onDeleteLesson: (id: string) => void;
  onSaveLesson: (lesson: LessonPlan) => void;
}

type DashboardTab = 'overview' | 'students' | 'groups' | 'games' | 'bookmarks' | 'planner' | 'tools' | 'smartboard';

interface GameResource {
  id: string;
  title: string;
  description: string;
  subject: string;
  type: 'internal-math' | 'internal-sort' | 'internal-story' | 'internal-memory' | 'internal-quiz' | 'external';
  url?: string;
  icon: React.ReactNode;
  color: string;
}

const GAMES_LIBRARY: GameResource[] = [
  // --- MATH ---
  {
    id: 'math-ninja',
    title: 'Math Ninja: Banana Slice',
    description: 'Slice the falling bananas that match the target number! Watch out for the angry monkey.',
    subject: Subject.Math,
    type: 'internal-math',
    icon: <Calculator className="w-6 h-6 text-white" />,
    color: 'bg-yellow-500'
  },
  {
    id: 'math-quiz',
    title: 'Math Quest',
    description: 'Solve fun math problems and test your skills.',
    subject: Subject.Math,
    type: 'internal-quiz',
    icon: <Brain className="w-6 h-6 text-white" />,
    color: 'bg-blue-500'
  },
  {
    id: 'prodigy',
    title: 'Prodigy Math',
    description: 'Fantasy-based math RPG that students love.',
    subject: Subject.Math,
    type: 'external',
    url: 'https://www.prodigygame.com/',
    icon: <Gamepad2 className="w-6 h-6 text-white" />,
    color: 'bg-indigo-400'
  },

  // --- SCIENCE ---
  {
    id: 'science-sort',
    title: 'Sort It Out!',
    description: 'A drag-and-drop categorization challenge (e.g. Living vs Non-Living).',
    subject: Subject.Science,
    type: 'internal-sort',
    icon: <Microscope className="w-6 h-6 text-white" />,
    color: 'bg-green-600'
  },
  {
    id: 'science-quiz',
    title: 'Science Explorer',
    description: 'Explore the wonders of science with this interactive trivia.',
    subject: Subject.Science,
    type: 'internal-quiz',
    icon: <Rocket className="w-6 h-6 text-white" />,
    color: 'bg-emerald-600'
  },
  {
    id: 'nat-geo',
    title: 'Nat Geo Kids',
    description: 'Amazing facts, games, and quizzes about animals.',
    subject: Subject.Science,
    type: 'external',
    url: 'https://kids.nationalgeographic.com/',
    icon: <Globe className="w-6 h-6 text-white" />,
    color: 'bg-emerald-500'
  },

  // --- LANGUAGE ---
  {
    id: 'story-maker',
    title: 'Silly Story Maker',
    description: 'An AI-powered "Mad Libs" style game for creative writing.',
    subject: Subject.Language,
    type: 'internal-story',
    icon: <Smile className="w-6 h-6 text-white" />,
    color: 'bg-pink-500'
  },
  {
    id: 'language-quiz',
    title: 'Word Wizard',
    description: 'Master vocabulary and grammar with this magical quiz.',
    subject: Subject.Language,
    type: 'internal-quiz',
    icon: <BookOpen className="w-6 h-6 text-white" />,
    color: 'bg-purple-600'
  },

  // --- FRENCH ---
  {
    id: 'french-match',
    title: 'French Memory Match',
    description: 'Classic card flipping game to build vocabulary.',
    subject: Subject.French,
    type: 'internal-memory',
    icon: <Languages className="w-6 h-6 text-white" />,
    color: 'bg-blue-600'
  },

  // --- SOCIAL STUDIES ---
  {
    id: 'social-sort',
    title: 'Community Sort',
    description: 'Sort items by Needs vs Wants, or Urban vs Rural communities.',
    subject: Subject.Social,
    type: 'internal-sort',
    icon: <Map className="w-6 h-6 text-white" />,
    color: 'bg-orange-500'
  },

  // --- HEALTH ---
  {
    id: 'health-sort',
    title: 'Healthy Habits',
    description: 'Sort foods and activities into Healthy vs Unhealthy choices.',
    subject: Subject.Health,
    type: 'internal-sort',
    icon: <Heart className="w-6 h-6 text-white" />,
    color: 'bg-red-500'
  },

  // --- ARTS ---
  {
    id: 'art-sort',
    title: 'Art Studio Sort',
    description: 'Sort colors, shapes, or art tools into correct categories.',
    subject: Subject.Arts,
    type: 'internal-sort',
    icon: <Palette className="w-6 h-6 text-white" />,
    color: 'bg-purple-500'
  },

  // --- MUSIC ---
  {
    id: 'music-match',
    title: 'Music Match',
    description: 'Match instruments to their names or notes to their beats.',
    subject: Subject.Music,
    type: 'internal-memory',
    icon: <Music className="w-6 h-6 text-white" />,
    color: 'bg-teal-500'
  },
  {
    id: 'music-lab',
    title: 'Chrome Music Lab',
    description: 'Makes learning music more accessible through fun experiments.',
    subject: Subject.Music,
    type: 'external',
    url: 'https://musiclab.chromeexperiments.com/',
    icon: <Zap className="w-6 h-6 text-white" />,
    color: 'bg-amber-500'
  }
];

// Constants for Planner
const PLANNER_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PLANNER_PERIODS = [1, 2, 'Recess', 3, 4, 'Lunch', 5, 6];

// Smart Board Backgrounds
const SB_BG_IMAGES = [
  { id: 'doodles', name: 'Fun Doodles', url: 'https://images.unsplash.com/photo-1620662776891-628d22324905?q=80&w=2560&auto=format&fit=crop' },
  { id: 'monsters', name: 'Playful Monsters', url: 'https://images.unsplash.com/photo-1605151740954-46ab39b56193?q=80&w=2560&auto=format&fit=crop' },
  { id: 'math-chalk', name: 'Math Chalkboard', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2560&auto=format&fit=crop' },
  { id: 'math-shapes', name: 'Geometric Shapes', url: 'https://images.unsplash.com/photo-1614030424754-24d16279f665?q=80&w=2560&auto=format&fit=crop' },
  { id: 'space', name: 'Space Exploration', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2560&auto=format&fit=crop' },
  { id: 'science-lab', name: 'Science Lab', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2560&auto=format&fit=crop' },
  { id: 'art-paint', name: 'Colorful Paint', url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2560&auto=format&fit=crop' },
  { id: 'art-craft', name: 'Paper Crafts', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2560&auto=format&fit=crop' },
  { id: 'forest', name: 'Calm Forest', url: 'https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=2560&auto=format&fit=crop' },
  { id: 'lego', name: 'Building Blocks', url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=2560&auto=format&fit=crop' },
  { id: 'library', name: 'Cozy Library', url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2560&auto=format&fit=crop' },
  { id: 'ocean', name: 'Deep Ocean', url: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=2560&auto=format&fit=crop' },
  { id: 'pastel', name: 'Pastel Dream', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2560&auto=format&fit=crop' },
  { id: 'neon', name: 'Neon Vibes', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2560&auto=format&fit=crop' },
  { id: 'wood', name: 'Wooden Desk', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2560&auto=format&fit=crop' }
];

const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  const cleanContent = content.replace(/!\[.*?\]\(.*?\)/g, '');
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);
    return parts.map((part, i) => {
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (/_{3,}/.test(part)) {
         return <span key={i} className="inline-block border-b-2 border-slate-800 w-24 mx-1"></span>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-4 font-serif text-slate-800 leading-relaxed text-lg">
      {cleanContent.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
           const cells = trimmed.split('|').filter(c => c.trim() !== '');
           if (trimmed.includes('---')) return null;
           return (
             <div key={i} className="grid grid-flow-col auto-cols-fr gap-4 border-b border-slate-200 py-2">
                {cells.map((cell, idx) => (
                  <div key={idx} className="font-medium text-slate-700">{renderText(cell.trim())}</div>
                ))}
             </div>
           );
        }
        if (trimmed.startsWith('# ')) return <h1 key={i} className="text-4xl font-bold text-center mb-6 mt-8">{trimmed.slice(2)}</h1>;
        if (trimmed.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold border-b-2 border-slate-900 pb-2 mt-8 mb-4">{trimmed.slice(3)}</h2>;
        if (trimmed.startsWith('### ')) return <h3 key={i} className="text-xl font-bold uppercase tracking-wider text-slate-700 mt-6 mb-3">{trimmed.slice(4)}</h3>;
        const lowerLine = trimmed.toLowerCase();
        if (/\b(draw|sketch|shade|illustrate)\b/i.test(lowerLine)) {
           return (
             <div key={i} className="space-y-2">
                <p className="font-medium">{renderText(trimmed)}</p>
                <div className="w-full h-48 border-2 border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">Drawing Space</div>
             </div>
           );
        }
        if (trimmed.startsWith('- ')) return <div key={i} className="flex gap-3 ml-4"><span className="font-bold">•</span><span>{renderText(trimmed.slice(2))}</span></div>;
        if (/^\d+\./.test(trimmed)) {
          const number = trimmed.split('.')[0];
          const text = trimmed.replace(/^\d+\.\s*/, '');
          return <div key={i} className="flex gap-3 ml-4"><span className="font-bold min-w-[1.5rem]">{number}.</span><span>{renderText(text)}</span></div>;
        }
        if (trimmed === '---') return <hr key={i} className="border-t-2 border-slate-200 my-6" />;
        if (!trimmed) return <div key={i} className="h-4"></div>;
        return <p key={i} className="mb-2">{renderText(trimmed)}</p>;
      })}
    </div>
  );
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  teacherName, savedLessons, onCreateClick, onLessonClick, onDeleteLesson, onSaveLesson
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Student State
  const [students, setStudents] = useState<Student[]>(() => { try { return JSON.parse(localStorage.getItem('mapleprep_students') || '[]'); } catch { return []; } });
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState<string>(GRADES[0]);
  const [rosterGradeFilter, setRosterGradeFilter] = useState<string>('All');
  const [gameSubjectFilter, setGameSubjectFilter] = useState<string>('All');

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<TeacherBookmark[]>(() => { try { return JSON.parse(localStorage.getItem('mapleprep_bookmarks') || '[]'); } catch { return []; } });
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '' });

  // Planner
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanData>(() => { try { return JSON.parse(localStorage.getItem('mapleprep_planner') || '{}'); } catch { return {}; } });
  const [plannerModalOpen, setPlannerModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{day: string, period: number | string} | null>(null);
  const [slotForm, setSlotForm] = useState<PlannerEntry>({ subject: '', notes: '', color: 'bg-white', presentationId: '', externalUrl: '', smartBoardData: '' });
  
  // SB Planner Modal
  const [sbPlannerModalOpen, setSbPlannerModalOpen] = useState(false);
  const [sbTargetDay, setSbTargetDay] = useState(PLANNER_DAYS[0]);
  const [sbTargetPeriod, setSbTargetPeriod] = useState<number | string>(PLANNER_PERIODS[0]);

  // Tools State
  const [swTime, setSwTime] = useState(0); 
  const [swActive, setSwActive] = useState(false);
  const [timerTime, setTimerTime] = useState(300);
  const [timerActive, setTimerActive] = useState(false);
  const [timerCustomMin, setTimerCustomMin] = useState('5');
  const [timerCustomSec, setTimerCustomSec] = useState('0');
  const [timerAlert, setTimerAlert] = useState(false);
  const [timerVolume, setTimerVolume] = useState(true);
  const [maximizedTool, setMaximizedTool] = useState<'stopwatch' | 'timer' | 'picker' | 'scramble' | 'chain' | null>(null);

  // Name Picker
  const [namePickerMode, setNamePickerMode] = useState<'class' | 'custom'>('class');
  const [namePickerGrade, setNamePickerGrade] = useState<string>('All');
  const [customNames, setCustomNames] = useState('');
  const [pickedName, setPickedName] = useState<string>('???');
  const [isSpinning, setIsSpinning] = useState(false);
  const [namePickerHistory, setNamePickerHistory] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Word Scramble
  const [scrambleInput, setScrambleInput] = useState('');
  const [currentScramble, setCurrentScramble] = useState<{original: string, scrambled: string} | null>(null);
  const [showScrambleAnswer, setShowScrambleAnswer] = useState(false);
  const [scrambleHistory, setScrambleHistory] = useState<{original: string, scrambled: string}[]>([]);

  // Word Chain
  const [wordChain, setWordChain] = useState<string[]>([]);
  const [wordChainInput, setWordChainInput] = useState('');
  const [wordChainError, setWordChainError] = useState<string | null>(null);
  const [wordChainLevel, setWordChainLevel] = useState(1);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [isCheckingSpelling, setIsCheckingSpelling] = useState(false);

  // Worksheet Maker
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  const [worksheetConfig, setWorksheetConfig] = useState<{ topic: string; grade: string; subject: string; style: WorksheetStyle; questionCount: number; }>({ topic: '', grade: GRADES[2], subject: SUBJECTS[0], style: 'standard', questionCount: 10 });
  const [generatedWorksheet, setGeneratedWorksheet] = useState<GeneratedWorksheet | null>(null);
  const [isWorksheetLoading, setIsWorksheetLoading] = useState(false);
  const [showWorksheetAnswerKey, setShowWorksheetAnswerKey] = useState(false);

  // Smart Board
  const [isSmartBoardActive, setIsSmartBoardActive] = useState(false);
  const [isStudentMode, setIsStudentMode] = useState(false);
  const [sbBackground, setSbBackground] = useState(() => localStorage.getItem('mapleprep_sb_bg') || SB_BG_IMAGES[0].url);
  const [sbTime, setSbTime] = useState(new Date());
  const [isSbSettingsOpen, setIsSbSettingsOpen] = useState(false);
  const [showSbSaveToast, setShowSbSaveToast] = useState(false);
  const [sbNotes, setSbNotes] = useState(() => {
    const saved = localStorage.getItem('mapleprep_sb_notes');
    return saved ? JSON.parse(saved) : { learning: "• Math: Introduction to Fractions\n• Science: Parts of a Plant", activities: "• Art Project at 2:00 PM\n• Gym Class at 10:30 AM", reminders: "• Return library books by Friday\n• Field trip slips due tomorrow!", special: "🎉 Happy Birthday Sarah!\n⭐ Star of the week: Mike" };
  });
  const [sbPresets, setSbPresets] = useState<{id: string, name: string, bg: string, notes: any}[]>(() => { try { return JSON.parse(localStorage.getItem('mapleprep_sb_presets') || '[]'); } catch { return []; } });

  // Game States
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [gameConfig, setGameConfig] = useState<{ grade: string; topic: string }>({ grade: GRADES[2], topic: '' });
  const [mathGameData, setMathGameData] = useState<{ rounds: MathBananaRound[], currentRound: number, score: number, lives: number, bananas: any[], gameActive: boolean, roundProgress: number, victory: boolean }>({ rounds: [], currentRound: 0, score: 0, lives: 3, bananas: [], gameActive: false, roundProgress: 0, victory: false });
  const [monkeyMood, setMonkeyMood] = useState<'happy'|'mad'|'idle'>('idle');
  const bananaIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sortingData, setSortingData] = useState<SortingGameData | null>(null);
  const [sortingState, setSortingState] = useState<{itemsLeft: any[], buckets: any[][], score: number}>({ itemsLeft: [], buckets: [[], []], score: 0 });
  const [storyData, setStoryData] = useState<StoryGameData | null>(null);
  const [storyInputs, setStoryInputs] = useState<Record<string, string>>({});
  const [showStoryResult, setShowStoryResult] = useState(false);
  const [memoryData, setMemoryData] = useState<{cards: any[], flipped: number[], matched: string[]}>({ cards: [], flipped: [], matched: [] });
  const [quizGameData, setQuizGameData] = useState<{ questions: GameQuestion[]; currentIndex: number; score: number; showResult: boolean; selectedAnswer: string | null; feedback: string | null; }>({ questions: [], currentIndex: 0, score: 0, showResult: false, selectedAnswer: null, feedback: null });

  const feedbackRef = useRef<HTMLDivElement>(null);
  const wordChainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('mapleprep_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('mapleprep_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('mapleprep_planner', JSON.stringify(weeklyPlan)); }, [weeklyPlan]);
  useEffect(() => { if (activeTab === 'smartboard') { const timer = setInterval(() => setSbTime(new Date()), 1000); return () => clearInterval(timer); } }, [activeTab]);
  useEffect(() => { let interval: ReturnType<typeof setInterval>; if (swActive) { interval = setInterval(() => { setSwTime(prev => prev + 10); }, 10); } return () => clearInterval(interval); }, [swActive]);
  useEffect(() => { let interval: ReturnType<typeof setInterval>; if (timerActive && timerTime > 0) { interval = setInterval(() => { setTimerTime(prev => { if (prev <= 1) { setTimerActive(false); setTimerAlert(true); return 0; } return prev - 1; }); }, 1000); } return () => clearInterval(interval); }, [timerActive, timerTime]);
  useEffect(() => { if (timerAlert && timerVolume) { const AudioContext = window.AudioContext || (window as any).webkitAudioContext; if (AudioContext) { const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 880; gain.gain.value = 0.1; osc.start(); setTimeout(() => osc.stop(), 500); } } }, [timerAlert, timerVolume]);
  useEffect(() => { if (quizGameData.selectedAnswer && feedbackRef.current) { feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } }, [quizGameData.selectedAnswer]);
  useEffect(() => { if (activeGameId === 'math-ninja' && mathGameData.gameActive && !mathGameData.victory) { bananaIntervalRef.current = setInterval(() => { const round = mathGameData.rounds[mathGameData.currentRound]; if (!round) return; const template = round.bananas[Math.floor(Math.random() * round.bananas.length)]; const newBanana = { id: Date.now(), ...template, x: Math.random() * 80 + 10, y: -10 }; setMathGameData(prev => ({ ...prev, bananas: [...prev.bananas, newBanana] })); }, 1500); const fallInterval = setInterval(() => { setMathGameData(prev => ({ ...prev, bananas: prev.bananas.map(b => ({ ...b, y: b.y + 1.5 })).filter(b => b.y < 100) })); }, 50); return () => { if (bananaIntervalRef.current) clearInterval(bananaIntervalRef.current); clearInterval(fallInterval); }; } }, [activeGameId, mathGameData.gameActive, mathGameData.currentRound, mathGameData.victory]);
  useEffect(() => { if (wordChainScrollRef.current) { wordChainScrollRef.current.scrollTop = wordChainScrollRef.current.scrollHeight; } }, [wordChain]);

  const handleAddStudent = (e: React.FormEvent) => { e.preventDefault(); if (newStudentName.trim()) { const student: Student = { id: crypto.randomUUID(), name: newStudentName, grade: rosterGradeFilter !== 'All' ? rosterGradeFilter : newStudentGrade }; setStudents([...students, student]); setNewStudentName(''); } };
  const handleDeleteStudent = (id: string) => { setStudents(students.filter(s => s.id !== id)); };
  const handleBananaClick = (bananaId: number, isCorrect: boolean) => { if (!mathGameData.gameActive) return; if (isCorrect) { setMonkeyMood('happy'); const newProgress = mathGameData.roundProgress + 1; const roundComplete = newProgress >= 5; setMathGameData(prev => { let newData = { ...prev, score: prev.score + 10, bananas: prev.bananas.filter(b => b.id !== bananaId), roundProgress: newProgress }; if (roundComplete) { const nextRound = prev.currentRound + 1; if (nextRound < prev.rounds.length) { newData.currentRound = nextRound; newData.roundProgress = 0; newData.bananas = []; } else { newData.victory = true; } } return newData; }); setTimeout(() => setMonkeyMood('idle'), 500); } else { setMonkeyMood('mad'); setMathGameData(prev => ({ ...prev, lives: prev.lives - 1, bananas: prev.bananas.filter(b => b.id !== bananaId) })); setTimeout(() => setMonkeyMood('idle'), 1000); if (mathGameData.lives <= 1) setMathGameData(prev => ({ ...prev, gameActive: false })); } };
  const handleSortDrop = (itemId: string, bucketIndex: number) => { if (!sortingData) return; const item = sortingState.itemsLeft.find(i => i.id === itemId); if (!item) return; setSortingState(prev => { const newBuckets = [...prev.buckets]; newBuckets[bucketIndex] = [...newBuckets[bucketIndex], item]; return { ...prev, itemsLeft: prev.itemsLeft.filter(i => i.id !== itemId), buckets: newBuckets }; }); };
  const handleCardClick = (index: number) => { if (memoryData.flipped.length >= 2 || memoryData.flipped.includes(index) || memoryData.matched.includes(memoryData.cards[index].id)) return; const newFlipped = [...memoryData.flipped, index]; setMemoryData(prev => ({ ...prev, flipped: newFlipped })); if (newFlipped.length === 2) { const card1 = memoryData.cards[newFlipped[0]]; const card2 = memoryData.cards[newFlipped[1]]; if (card1.matchId === card2.matchId) { setTimeout(() => { setMemoryData(prev => ({ ...prev, matched: [...prev.matched, card1.id, card2.id], flipped: [] })); }, 500); } else { setTimeout(() => { setMemoryData(prev => ({ ...prev, flipped: [] })); }, 1000); } } };
  const handleQuizAnswer = (option: string) => { if (quizGameData.selectedAnswer) return; const currentQ = quizGameData.questions[quizGameData.currentIndex]; const isCorrect = option === currentQ.correctAnswer; setQuizGameData(prev => ({ ...prev, selectedAnswer: option, feedback: isCorrect ? "Correct! " + currentQ.explanation : "Not quite. " + currentQ.explanation, score: isCorrect ? prev.score + 1 : prev.score })); };
  const nextQuizQuestion = () => { if (quizGameData.currentIndex < quizGameData.questions.length - 1) { setQuizGameData(prev => ({ ...prev, currentIndex: prev.currentIndex + 1, selectedAnswer: null, feedback: null })); } else { setQuizGameData(prev => ({ ...prev, showResult: true })); } };
  const startGame = async () => { setGameLoading(true); try { if (activeGameId === 'math-ninja') { const rounds = await generateMathBananaGame(gameConfig.grade, gameConfig.topic); setMathGameData({ rounds, currentRound: 0, score: 0, lives: 3, bananas: [], gameActive: true, roundProgress: 0, victory: false }); } else if (activeGameId === 'science-sort') { const data = await generateSortingGame(gameConfig.grade, gameConfig.topic || 'Living vs Non-Living', 'Science'); setSortingData(data); setSortingState({ itemsLeft: data.items, buckets: [[], []], score: 0 }); } else if (activeGameId === 'social-sort') { const data = await generateSortingGame(gameConfig.grade, gameConfig.topic || 'Needs vs Wants', 'Social Studies'); setSortingData(data); setSortingState({ itemsLeft: data.items, buckets: [[], []], score: 0 }); } else if (activeGameId === 'health-sort') { const data = await generateSortingGame(gameConfig.grade, gameConfig.topic || 'Healthy vs Unhealthy', 'Health'); setSortingData(data); setSortingState({ itemsLeft: data.items, buckets: [[], []], score: 0 }); } else if (activeGameId === 'art-sort') { const data = await generateSortingGame(gameConfig.grade, gameConfig.topic || 'Warm vs Cool Colors', 'The Arts'); setSortingData(data); setSortingState({ itemsLeft: data.items, buckets: [[], []], score: 0 }); } else if (activeGameId === 'story-maker') { const data = await generateStoryGame(gameConfig.grade, gameConfig.topic); setStoryData(data); setStoryInputs({}); setShowStoryResult(false); } else if (activeGameId === 'french-match') { const data = await generateMemoryGame(gameConfig.grade, gameConfig.topic, 'French'); setupMemoryDeck(data); } else if (activeGameId === 'music-match') { const data = await generateMemoryGame(gameConfig.grade, gameConfig.topic || 'Instruments', 'Music'); setupMemoryDeck(data); } else if (['math-quiz', 'science-quiz', 'language-quiz'].includes(activeGameId!)) { let subject = 'Mathematics'; if (activeGameId === 'science-quiz') subject = 'Science'; if (activeGameId === 'language-quiz') subject = 'Language'; const questions = await generateQuizGame(gameConfig.grade, gameConfig.topic, subject); setQuizGameData({ questions, currentIndex: 0, score: 0, showResult: false, selectedAnswer: null, feedback: null }); } } catch (e) { console.error(e); alert("Failed to load game. Please try again."); } finally { setGameLoading(false); } };
  const setupMemoryDeck = (data: MemoryGameData) => { const deck = [...data.pairs.map(p => ({ id: p.id+'-1', content: p.item1, matchId: p.id })), ...data.pairs.map(p => ({ id: p.id+'-2', content: p.item2, matchId: p.id }))]; for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; } setMemoryData({ cards: deck, flipped: [], matched: [] }); };
  const handleWorksheetGenerate = async () => { if (!worksheetConfig.topic.trim()) return; setIsWorksheetLoading(true); try { const data = await generateStandaloneWorksheet(worksheetConfig.topic, worksheetConfig.grade, worksheetConfig.subject, worksheetConfig.style, worksheetConfig.questionCount); setGeneratedWorksheet(data); } catch (e) { console.error(e); alert("Failed to generate worksheet."); } finally { setIsWorksheetLoading(false); } };
  const handleWorksheetPrint = () => { if (!generatedWorksheet) return; const iframe = document.createElement('iframe'); iframe.style.position = 'absolute'; iframe.style.width = '0px'; iframe.style.height = '0px'; iframe.style.border = 'none'; document.body.appendChild(iframe); const rawContent = showWorksheetAnswerKey ? generatedWorksheet.teacherMarkdown : generatedWorksheet.studentMarkdown; const cleanContent = rawContent.replace(/!\[.*?\]\(.*?\)/g, ''); const parseMarkdownToHTML = (md: string) => { let lines = md.split('\n'); let html = ''; let inTable = false; let inList = false; while(lines.length > 0 && lines[0].trim() === '') { lines.shift(); } if (lines.length > 0 && lines[0].trim().startsWith('# ')) { lines.shift(); } lines.forEach(line => { const trimmed = line.trim(); if (!trimmed) { if(inList) { html += '</ul>'; inList = false; } html += '<br/>'; return; } if (trimmed === '---' || trimmed.match(/^-+$/)) return; if (trimmed.startsWith('|')) { if (!inTable) { html += '<table class="content-table">'; inTable = true; } const cells = trimmed.split('|').filter(c => c.trim() !== ''); if (trimmed.includes('---')) return; html += '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>'; return; } else if (inTable) { html += '</table>'; inTable = false; } if (trimmed.startsWith('### ')) { html += `<h3>${trimmed.slice(4)}</h3>`; return; } if (trimmed.startsWith('## ')) { html += `<h2>${trimmed.slice(3)}</h2>`; return; } if (trimmed.startsWith('# ')) { html += `<h1>${trimmed.slice(2)}</h1>`; return; } if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${trimmed.slice(2)}</li>`; return; } else if (inList) { html += '</ul>'; inList = false; } const lowerLine = trimmed.toLowerCase(); let processedLine = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_{3,}/g, '<span class="blank-line"></span>'); html += `<p>${processedLine}</p>`; if (/\b(draw|sketch|shade|illustrate)\b/i.test(lowerLine)) { html += `<div class="drawing-box"></div>`; } }); if (inTable) html += '</table>'; if (inList) html += '</ul>'; return html; }; const renderedContent = parseMarkdownToHTML(cleanContent); const html = `<!DOCTYPE html><html><head><title>Worksheet Print</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"><style>@page { size: letter; margin: 0.75in; }body { font-family: 'Inter', sans-serif; font-size: 11pt; color: black; line-height: 1.5; margin: 0; padding: 20px; }table.header-table { width: 100%; border-bottom: 2px solid black; margin-bottom: 30px; padding-bottom: 10px; border-collapse: collapse; }td.header-left { width: 40%; vertical-align: bottom; }td.header-right { width: 60%; vertical-align: bottom; text-align: right; }.topic-title { font-size: 20pt; font-weight: 800; text-transform: uppercase; margin: 0; line-height: 1.2; }.meta-info { font-size: 11pt; font-weight: bold; color: #444; margin-top: 5px; }.field-row { margin-bottom: 10px; font-weight: bold; font-size: 11pt; }.line { display: inline-block; border-bottom: 1px solid black; }.line.long { width: 450px; }.line.med { width: 250px; }.line.short { width: 80px; }h1 { font-size: 18pt; margin-top: 20px; border-bottom: 1px solid #ccc; }h2 { font-size: 14pt; margin-top: 15px; font-weight: bold; }h3 { font-size: 12pt; text-transform: uppercase; margin-top: 15px; color: #444; }table.content-table { width: 100%; border-collapse: collapse; margin: 15px 0; page-break-inside: avoid; }table.content-table td { border: 1px solid black; padding: 8px; vertical-align: top; }.drawing-box { height: 300px; border: 2px solid black; margin: 15px 0; background: #fff; page-break-inside: avoid; }.blank-line { display: inline-block; min-width: 100px; border-bottom: 1px solid black; }ul { padding-left: 20px; margin: 10px 0; }li { margin-bottom: 5px; }p { margin-bottom: 10px; }.footer { margin-top: 50px; text-align: center; font-size: 9pt; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }</style></head><body><table class="header-table"><tr><td class="header-left"><div class="topic-title">${generatedWorksheet.topic}</div><div class="meta-info">${generatedWorksheet.grade} • ${generatedWorksheet.subject}</div></td><td class="header-right">${showWorksheetAnswerKey ? '<div style="font-size: 16pt; font-weight: bold; border: 3px solid black; padding: 5px 15px; display:inline-block;">ANSWER KEY</div>' : '<div class="field-row">Name: <span class="line long"></span></div><div class="field-row">Date: <span class="line med"></span></div><div class="field-row">Score: <span class="line short"></span> / <span class="line short"></span></div>'}</td></tr></table><div id="content">${renderedContent}</div><div class="footer">Generated by MaplePrep</div></body></html>`; const doc = iframe.contentWindow?.document; if (doc) { doc.open(); doc.write(html); doc.close(); setTimeout(() => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); setTimeout(() => document.body.removeChild(iframe), 1000); }, 500); } };
  const handleAddBookmark = (e: React.FormEvent) => { e.preventDefault(); if (newBookmark.title && newBookmark.url) { let url = newBookmark.url; if (!/^https?:\/\//i.test(url)) url = 'https://' + url; const bookmark: TeacherBookmark = { id: crypto.randomUUID(), title: newBookmark.title, url: url, dateAdded: new Date().toISOString() }; setBookmarks([bookmark, ...bookmarks]); setNewBookmark({ title: '', url: '' }); setIsBookmarkModalOpen(false); } };
  const handleDeleteBookmark = (id: string) => { if (confirm("Delete this bookmark?")) setBookmarks(bookmarks.filter(b => b.id !== id)); };
  const handlePlannerCellClick = (day: string, period: number | string) => { const key = `${day}-${period}`; const entry = weeklyPlan[key] || { subject: '', notes: '', color: 'bg-white', presentationId: '', externalUrl: '', smartBoardData: '' }; setEditingSlot({ day, period }); setSlotForm(entry); setPlannerModalOpen(true); };
  const handleSaveSlot = () => { if (!editingSlot) return; const key = `${editingSlot.day}-${editingSlot.period}`; const newPlan = { ...weeklyPlan, [key]: slotForm }; setWeeklyPlan(newPlan); setPlannerModalOpen(false); };
  const handleClearSlot = () => { if (!editingSlot) return; const key = `${editingSlot.day}-${editingSlot.period}`; const newPlan = { ...weeklyPlan }; delete newPlan[key]; setWeeklyPlan(newPlan); setPlannerModalOpen(false); };
  
  const handleSaveSmartBoard = () => { localStorage.setItem('mapleprep_sb_notes', JSON.stringify(sbNotes)); localStorage.setItem('mapleprep_sb_bg', sbBackground); setShowSbSaveToast(true); setTimeout(() => setShowSbSaveToast(false), 2000); };
  const handleSavePreset = () => { const name = prompt("Name this board layout (e.g. 'Monday Morning'):"); if (!name) return; const newPreset = { id: Date.now().toString(), name, bg: sbBackground, notes: sbNotes }; const updated = [newPreset, ...sbPresets]; setSbPresets(updated); localStorage.setItem('mapleprep_sb_presets', JSON.stringify(updated)); alert("Layout saved successfully!"); };
  const handleLoadPreset = (preset: any) => { if(confirm(`Load layout "${preset.name}"? Current notes will be replaced.`)) { setSbBackground(preset.bg); setSbNotes(preset.notes); setIsSbSettingsOpen(false); } };
  const handleDeletePreset = (id: string, e: React.MouseEvent) => { e.stopPropagation(); if(confirm("Delete this saved layout?")) { const updated = sbPresets.filter(p => p.id !== id); setSbPresets(updated); localStorage.setItem('mapleprep_sb_presets', JSON.stringify(updated)); } };
  const handleSbSaveToLibrary = () => { const name = prompt("Enter a name to save this Smart Board to your library:"); if (!name) return; const sbConfig = JSON.stringify({ bg: sbBackground, notes: sbNotes }); const newLesson: LessonPlan = { id: crypto.randomUUID(), topic: name, subject: 'SmartBoard', gradeLevel: 'General', province: 'All', createdAt: new Date().toISOString(), curriculumExpectations: sbConfig, learningObjectives: [], slides: [], activities: [], worksheetMarkdown: '', quiz: [] }; onSaveLesson(newLesson); setTimeout(() => alert("Smart Board saved to Lesson Library!"), 100); };
  const handleSbAddToPlanner = () => { const key = `${sbTargetDay}-${sbTargetPeriod}`; const sbConfig = JSON.stringify({ bg: sbBackground, notes: sbNotes }); const entry: PlannerEntry = { subject: 'Smart Board Plan', notes: 'Custom Smart Board Layout', color: 'bg-yellow-50', smartBoardData: sbConfig }; const newPlan = { ...weeklyPlan, [key]: entry }; setWeeklyPlan(newPlan); setSbPlannerModalOpen(false); alert(`Added Smart Board plan to ${sbTargetDay}, Period ${sbTargetPeriod}`); };
  const handleLessonCardClick = (lesson: LessonPlan) => { if (lesson.subject === 'SmartBoard') { try { const config = JSON.parse(lesson.curriculumExpectations); if (config.bg && config.notes) { if(confirm(`Load Smart Board "${lesson.topic}"?`)) { setSbBackground(config.bg); setSbNotes(config.notes); setActiveTab('smartboard'); } } } catch (e) { console.error("Failed to load smart board lesson", e); alert("Could not load this Smart Board configuration."); } } else { onLessonClick(lesson); } };
  const handleLaunchSbFromPlanner = (dataString: string, e: React.MouseEvent) => { e.stopPropagation(); try { const config = JSON.parse(dataString); if (config.bg && config.notes) { setSbBackground(config.bg); setSbNotes(config.notes); setActiveTab('smartboard'); } } catch (err) { console.error("Failed to parse SB data", err); } };

  const formatStopwatch = (ms: number) => { const minutes = Math.floor(ms / 60000); const seconds = Math.floor((ms % 60000) / 1000); const centiseconds = Math.floor((ms % 1000) / 10); return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`; };
  const formatTimer = (secs: number) => { const minutes = Math.floor(secs / 60); const seconds = secs % 60; return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; };

  const handleSpinName = () => { let list: string[] = []; if (namePickerMode === 'class') { if (namePickerGrade === 'All') { list = students.map(s => s.name); } else { list = students.filter(s => s.grade === namePickerGrade).map(s => s.name); } } else { list = customNames.split('\n').filter(n => n.trim() !== ''); } if (list.length === 0) { alert(namePickerMode === 'class' ? "No students found for this selection." : "Please enter some names."); return; } setIsSpinning(true); setShowConfetti(false); let counter = 0; const totalSpins = 25; const interval = setInterval(() => { const randomName = list[Math.floor(Math.random() * list.length)]; setPickedName(randomName); counter++; if (counter >= totalSpins) { clearInterval(interval); setIsSpinning(false); setShowConfetti(true); setNamePickerHistory(prev => [randomName, ...prev].slice(0, 5)); } }, 100); };
  const handleScrambleWord = () => { if (!scrambleInput.trim()) return; const original = scrambleInput.trim().toUpperCase(); const scrambled = original.split('').sort(() => 0.5 - Math.random()).join(''); const finalScramble = scrambled === original && original.length > 1 ? original.split('').sort(() => 0.5 - Math.random()).join('') : scrambled; const newScramble = { original, scrambled: finalScramble }; setCurrentScramble(newScramble); setScrambleHistory(prev => [newScramble, ...prev].slice(0, 5)); setShowScrambleAnswer(false); setScrambleInput(''); };
  
  const handleWordChainSubmit = async () => {
    const word = wordChainInput.trim();
    if (!word) return;

    if (wordChain.length > 0) {
        const lastWord = wordChain[wordChain.length - 1];
        const lastLetter = lastWord[lastWord.length - 1].toLowerCase();
        if (word[0].toLowerCase() !== lastLetter) {
            setWordChainError(`Word must start with '${lastLetter.toUpperCase()}'`);
            return;
        }
        if (wordChain.map(w => w.toLowerCase()).includes(word.toLowerCase())) {
            setWordChainError('Word already used!');
            return;
        }
    }

    setIsCheckingSpelling(true);
    setWordChainError(null);
    
    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (res.status === 404) {
            setWordChainError("Wrong spelling!");
            setIsCheckingSpelling(false);
            return;
        }
    } catch (e) {
        console.warn("Dictionary check failed, skipping validation", e);
    }
    setIsCheckingSpelling(false);

    const newChain = [...wordChain, word];
    setWordChain(newChain);
    setWordChainInput('');
    
    // Level Logic
    const count = newChain.length;
    if (count === 20) {
        setWordChainLevel(2);
        setShowLevelComplete(true);
    } else if (count === 50) {
        setWordChainLevel(3);
        setShowLevelComplete(true);
    } else if (count === 100) {
        setWordChainLevel(4);
        setShowLevelComplete(true);
    }
  };

  const filteredLessons = savedLessons.filter(l => l.topic.toLowerCase().includes(searchTerm.toLowerCase()) || l.subject.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredGames = gameSubjectFilter === 'All' ? GAMES_LIBRARY : GAMES_LIBRARY.filter(g => g.subject === gameSubjectFilter);
  const activeGameDef = activeGameId ? GAMES_LIBRARY.find(g => g.id === activeGameId) : null;

  // --- TOOL RENDERERS ---
  
  const renderStopwatch = (isMaximized: boolean) => (
    <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full transition-all ${isMaximized ? 'h-full' : ''}`}>
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Hourglass className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-800">Stopwatch</h2>
            </div>
            <button onClick={() => setMaximizedTool(isMaximized ? null : 'stopwatch')} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                {isMaximized ? <Minimize className="w-6 h-6" /> : <Maximize className="w-5 h-5" />}
            </button>
        </div>
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
            <div className={`font-mono font-bold text-slate-900 mb-8 tracking-wider transition-all duration-300 ${isMaximized ? 'text-[12vw] leading-tight' : 'text-5xl'}`}>
                {formatStopwatch(swTime)}
            </div>
            <div className={`flex gap-4 w-full ${isMaximized ? 'max-w-3xl scale-125 transform' : ''}`}>
                {!swActive ? (
                    <button onClick={() => setSwActive(true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-all active:scale-95"><Play className="w-6 h-6" /> Start</button>
                ) : (
                    <button onClick={() => setSwActive(false)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-200 flex items-center justify-center gap-2 transition-all active:scale-95"><Pause className="w-6 h-6" /> Pause</button>
                )}
                <button onClick={() => { setSwActive(false); setSwTime(0); }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 rounded-xl font-bold transition-all"><RotateCcwIcon className="w-6 h-6" /></button>
            </div>
        </div>
    </div>
  );

  const renderTimer = (isMaximized: boolean) => (
    <div className={`bg-white rounded-2xl shadow-lg border overflow-hidden flex flex-col h-full transition-colors duration-500 ${timerAlert ? 'border-red-500 ring-4 ring-red-100' : 'border-slate-200'}`}>
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Timer className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-slate-800">Timer</h2>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setTimerVolume(!timerVolume)} className="text-slate-400 hover:text-slate-600 mr-2">
                    {timerVolume ? <Volume2 className="w-5 h-5"/> : <VolumeX className="w-5 h-5"/>}
                </button>
                <button onClick={() => setMaximizedTool(isMaximized ? null : 'timer')} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                    {isMaximized ? <Minimize className="w-6 h-6" /> : <Maximize className="w-5 h-5" />}
                </button>
            </div>
        </div>
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
            {timerAlert ? (
                <div className="animate-pulse mb-8 text-center">
                    <div className={`font-bold text-red-600 mb-2 transition-all duration-300 ${isMaximized ? 'text-[12vw]' : 'text-5xl'}`}>00:00</div>
                    <p className="text-red-500 font-bold uppercase tracking-widest text-2xl">Time's Up!</p>
                </div>
            ) : (
                <div className={`font-mono font-bold text-slate-900 mb-8 tracking-wider transition-all duration-300 ${isMaximized ? 'text-[12vw] leading-tight' : 'text-5xl'}`}>
                    {formatTimer(timerTime)}
                </div>
            )}
            {!timerActive && !timerAlert && (
                <div className={`w-full space-y-4 ${isMaximized ? 'max-w-2xl scale-125' : ''}`}>
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 justify-center">
                        {[1, 5, 10, 15, 20, 30].map(m => (
                            <button key={m} onClick={() => setTimerTime(m * 60)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold text-slate-600 min-w-[3rem]">{m}m</button>
                        ))}
                    </div>
                    <div className="flex items-end gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 justify-center">
                        <div><label className="block text-[10px] font-bold text-slate-400 text-center mb-1">MIN</label><input type="number" value={timerCustomMin} onChange={(e) => setTimerCustomMin(Math.max(0, parseInt(e.target.value) || 0).toString())} className="w-14 p-2 border rounded-lg text-center font-bold text-lg outline-none focus:ring-2 focus:ring-red-500" min="0"/></div>
                        <span className="font-bold text-slate-300 text-xl pb-2">:</span>
                        <div><label className="block text-[10px] font-bold text-slate-400 text-center mb-1">SEC</label><input type="number" value={timerCustomSec} onChange={(e) => setTimerCustomSec(Math.max(0, parseInt(e.target.value) || 0).toString())} className="w-14 p-2 border rounded-lg text-center font-bold text-lg outline-none focus:ring-2 focus:ring-red-500" min="0" max="59"/></div>
                        <button onClick={() => { const m = parseInt(timerCustomMin) || 0; const s = parseInt(timerCustomSec) || 0; if (m + s > 0) setTimerTime((m * 60) + s); }} className="bg-slate-800 text-white px-3 py-2 rounded-lg font-bold text-xs mb-[1px] hover:bg-slate-900">Set</button>
                    </div>
                </div>
            )}
            <div className={`flex gap-4 w-full mt-auto ${isMaximized ? 'max-w-3xl scale-125 transform pb-8' : ''}`}>
                {timerAlert ? (
                    <button onClick={() => { setTimerAlert(false); setTimerTime(300); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-200 flex items-center justify-center gap-2 transition-all active:scale-95 animate-bounce"><CheckCircle className="w-6 h-6" /> Dismiss</button>
                ) : !timerActive ? (
                    <button onClick={() => setTimerActive(true)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-200 flex items-center justify-center gap-2 transition-all active:scale-95"><Play className="w-6 h-6" /> Start</button>
                ) : (
                    <button onClick={() => setTimerActive(false)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-200 flex items-center justify-center gap-2 transition-all active:scale-95"><Pause className="w-6 h-6" /> Pause</button>
                )}
                <button onClick={() => { setTimerActive(false); setTimerTime(300); setTimerAlert(false); }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 rounded-xl font-bold transition-all"><RotateCcwIcon className="w-6 h-6" /></button>
            </div>
        </div>
    </div>
  );

  const renderNamePicker = (isMaximized: boolean) => (
    <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full transition-all ${isMaximized ? 'h-full' : ''}`}>
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Dices className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-slate-800">Name Picker</h2>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex bg-slate-200 p-0.5 rounded-lg items-center">
                    <button onClick={() => setNamePickerMode('class')} className={`p-1.5 rounded-md ${namePickerMode === 'class' ? 'bg-white shadow text-purple-600' : 'text-slate-500'}`} title="Use Class Roster"><Users className="w-4 h-4"/></button>
                    <button onClick={() => setNamePickerMode('custom')} className={`p-1.5 rounded-md ${namePickerMode === 'custom' ? 'bg-white shadow text-purple-600' : 'text-slate-500'}`} title="Custom List"><List className="w-4 h-4"/></button>
                    {namePickerMode === 'class' && (
                        <>
                            <div className="h-4 w-px bg-slate-300 mx-1"></div>
                            <select 
                                value={namePickerGrade} 
                                onChange={(e) => setNamePickerGrade(e.target.value)} 
                                className="text-xs p-1.5 rounded-md border-slate-300 border bg-white ml-1 outline-none font-bold text-slate-600 max-w-[80px]"
                            >
                                <option value="All">All Grades</option>
                                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </>
                    )}
                </div>
                <button onClick={() => setMaximizedTool(isMaximized ? null : 'picker')} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                    {isMaximized ? <Minimize className="w-6 h-6" /> : <Maximize className="w-5 h-5" />}
                </button>
            </div>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-center">
            <div className={`relative flex-1 bg-purple-50 rounded-xl mb-6 flex items-center justify-center overflow-hidden border-2 ${showConfetti ? 'border-purple-400' : 'border-purple-100'}`}>
                {showConfetti && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-6xl opacity-50 animate-pulse">🎉</div>}
                <div className={`font-bold text-center px-4 break-words transition-transform duration-300 ${isSpinning ? 'text-slate-400 blur-[1px]' : 'text-purple-800 scale-110'} ${isMaximized ? 'text-9xl' : 'text-3xl'}`}>
                    {pickedName}
                </div>
            </div>
            
            {namePickerMode === 'custom' && !isMaximized && (
                <textarea 
                    className="w-full h-24 p-3 border rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-purple-500" 
                    placeholder="Enter names (one per line)..."
                    value={customNames}
                    onChange={(e) => setCustomNames(e.target.value)}
                />
            )}

            <Button onClick={handleSpinName} disabled={isSpinning} className={`w-full py-4 text-lg bg-purple-600 hover:bg-purple-700 shadow-purple-200 ${isMaximized ? 'max-w-2xl mx-auto text-2xl' : ''}`}>
                {isSpinning ? 'Spinning...' : 'Pick Random Name'}
            </Button>
        </div>
    </div>
  );

  const renderWordScramble = (isMaximized: boolean) => (
    <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full transition-all ${isMaximized ? 'h-full' : ''}`}>
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Shuffle className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-slate-800">Word Scramble</h2>
            </div>
            <button onClick={() => setMaximizedTool(isMaximized ? null : 'scramble')} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                {isMaximized ? <Minimize className="w-6 h-6" /> : <Maximize className="w-5 h-5" />}
            </button>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-center">
            {!currentScramble ? (
                <div className={`flex-1 flex flex-col justify-center gap-4 ${isMaximized ? 'max-w-3xl mx-auto w-full' : ''}`}>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Enter a Word</label>
                        <input 
                            type="text" 
                            className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold text-center uppercase ${isMaximized ? 'text-4xl p-6' : 'text-lg'}`}
                            placeholder="E.g. ELEPHANT"
                            value={scrambleInput}
                            onChange={(e) => setScrambleInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScrambleWord()}
                        />
                    </div>
                    <Button onClick={handleScrambleWord} className={`w-full py-4 text-lg bg-orange-500 hover:bg-orange-600 shadow-orange-200 ${isMaximized ? 'text-2xl py-6' : ''}`}>
                        Scramble It!
                    </Button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {currentScramble.scrambled.split('').map((char, i) => (
                            <div key={i} className={`bg-orange-100 rounded-lg flex items-center justify-center font-bold text-orange-800 shadow-sm border border-orange-200 ${isMaximized ? 'w-24 h-32 text-6xl' : 'w-10 h-12 text-2xl'}`}>
                                {char}
                            </div>
                        ))}
                    </div>

                    <div className={`bg-slate-50 rounded-xl p-4 w-full text-center mb-6 flex items-center justify-center ${isMaximized ? 'min-h-[10rem]' : 'min-h-[5rem]'}`}>
                        {showScrambleAnswer ? (
                            <div className="animate-fadeIn">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Answer</div>
                                <div className={`font-bold text-green-600 tracking-widest ${isMaximized ? 'text-6xl' : 'text-2xl'}`}>{currentScramble.original}</div>
                            </div>
                        ) : (
                            <div className="text-slate-400 text-sm italic">Answer hidden</div>
                        )}
                    </div>

                    <div className={`flex gap-2 w-full mt-auto ${isMaximized ? 'max-w-3xl' : ''}`}>
                        <Button onClick={() => setShowScrambleAnswer(!showScrambleAnswer)} variant="outline" className={`flex-1 ${isMaximized ? 'text-xl py-6' : ''}`}>
                            {showScrambleAnswer ? 'Hide' : 'Reveal'}
                        </Button>
                        <Button onClick={() => { setCurrentScramble(null); setScrambleInput(''); }} className={`flex-1 bg-orange-500 hover:bg-orange-600 ${isMaximized ? 'text-xl py-6' : ''}`}>
                            New Word
                        </Button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  const renderWordChain = (isMaximized: boolean) => (
    <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full transition-all ${isMaximized ? 'h-full' : ''} relative`}>
        {showLevelComplete && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">
                    <button onClick={() => setShowLevelComplete(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500 shadow-inner">
                        <Award className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Level Up!</h3>
                    <p className="text-slate-500 mb-6">You've reached <strong className="text-teal-600">Level {wordChainLevel}</strong> with {wordChain.length} words!</p>
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
                    <Button onClick={() => setShowLevelComplete(false)} className="w-full bg-teal-600 hover:bg-teal-700">Keep Playing</Button>
                </div>
            </div>
        )}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Link className="w-6 h-6 text-teal-600" />
                <h2 className="text-xl font-bold text-slate-800">Word Chain</h2>
            </div>
            <div className="flex items-center gap-2">
                <div className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" /> Level {wordChainLevel}
                </div>
                <div className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                    {wordChain.length} Words
                </div>
                <button onClick={() => setMaximizedTool(isMaximized ? null : 'chain')} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors ml-2">
                    {isMaximized ? <Minimize className="w-6 h-6" /> : <Maximize className="w-5 h-5" />}
                </button>
            </div>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-center">
            {wordChain.length === 0 ? (
                <div className={`flex-1 flex flex-col justify-center items-center text-center gap-4 ${isMaximized ? 'max-w-3xl mx-auto w-full' : ''}`}>
                    <div className="bg-teal-50 p-6 rounded-full text-teal-600 mb-2"><Link className={`w-12 h-12 ${isMaximized ? 'w-24 h-24' : ''}`} /></div>
                    <h3 className={`font-bold text-slate-700 ${isMaximized ? 'text-3xl' : 'text-lg'}`}>Start the Chain!</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Each word must start with the last letter of the previous word.</p>
                    <div className="w-full mt-4">
                        <input 
                            type="text" 
                            className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500 font-bold text-center ${isMaximized ? 'text-4xl p-6' : 'text-lg'}`}
                            placeholder="Enter starting word..."
                            value={wordChainInput}
                            onChange={(e) => setWordChainInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleWordChainSubmit()}
                        />
                        <Button onClick={handleWordChainSubmit} disabled={isCheckingSpelling} className={`w-full mt-4 py-4 text-lg bg-teal-500 hover:bg-teal-600 shadow-teal-200 ${isMaximized ? 'text-2xl py-6' : ''}`}>
                            {isCheckingSpelling ? 'Checking...' : 'Start Game'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div ref={wordChainScrollRef} className="flex-1 overflow-y-auto mb-4 bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-inner flex flex-wrap content-start gap-3 justify-center items-center">
                        {wordChain.map((word, i) => (
                            <React.Fragment key={i}>
                                <div className={`relative px-4 py-2 rounded-full font-bold shadow-sm border flex items-center animate-fadeIn ${i === wordChain.length - 1 ? 'bg-teal-100 text-teal-800 border-teal-300 ring-2 ring-teal-200' : 'bg-white text-slate-700 border-slate-200'}`}>
                                    {i > 0 && <span className="font-normal opacity-50 mr-0.5">{word[0]}</span>}
                                    <span>{i > 0 ? word.slice(1) : word}</span>
                                    {i < wordChain.length - 1 && <ArrowRight className="w-4 h-4 ml-2 text-slate-400" />}
                                </div>
                                {i < wordChain.length - 1 && <div className="w-4 border-t-2 border-slate-300 border-dashed h-0"></div>}
                            </React.Fragment>
                        ))}
                        <div className="animate-pulse opacity-50 px-4 py-2 border-2 border-dashed border-teal-300 rounded-full text-teal-400 text-sm font-bold flex items-center">
                            {wordChain[wordChain.length-1].slice(-1).toUpperCase()}...
                        </div>
                    </div>

                    <div className={`w-full ${isMaximized ? 'max-w-3xl mx-auto' : ''}`}>
                       {wordChainError && <div className="text-red-500 text-xs font-bold text-center mb-2 animate-bounce">{wordChainError}</div>}
                       <div className="flex gap-2">
                           <input 
                                type="text" 
                                className={`flex-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500 font-bold ${isMaximized ? 'text-2xl p-4' : ''} ${wordChainError ? 'border-red-300 bg-red-50' : ''}`}
                                placeholder={`Starts with '${wordChain[wordChain.length-1].slice(-1).toUpperCase()}'...`}
                                value={wordChainInput}
                                onChange={(e) => { setWordChainInput(e.target.value); setWordChainError(null); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleWordChainSubmit()}
                                autoFocus
                                disabled={isCheckingSpelling}
                            />
                            <Button onClick={handleWordChainSubmit} disabled={isCheckingSpelling} className={`bg-teal-500 hover:bg-teal-600 shadow-teal-200 ${isMaximized ? 'px-8 text-xl' : ''}`}>
                                {isCheckingSpelling ? <span className="animate-spin text-white">⌛</span> : 'Add'}
                            </Button>
                            <button 
                                onClick={() => { 
                                    if(window.confirm('Start a new word chain?')) { 
                                        setWordChain([]); 
                                        setWordChainInput('');
                                        setWordChainError(null);
                                        setWordChainLevel(1);
                                    } 
                                }}
                                className={`bg-slate-200 hover:bg-red-100 text-slate-500 hover:text-red-500 rounded-lg px-3 transition-colors ${isMaximized ? 'px-6' : ''}`}
                                title="Reset Game"
                            >
                                <RotateCcwIcon className={`w-5 h-5 ${isMaximized ? 'w-6 h-6' : ''}`} />
                            </button>
                       </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
          <p className="text-slate-500">Welcome back, {teacherName}</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto no-scrollbar">
           <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><Grid className="w-4 h-4" /> Overview</button>
           <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'students' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><Users className="w-4 h-4" /> My Class</button>
           <button onClick={() => setActiveTab('games')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'games' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><Gamepad2 className="w-4 h-4" /> Educational Games</button>
           <button onClick={() => setActiveTab('bookmarks')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'bookmarks' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><Link2 className="w-4 h-4" /> Web Links</button>
           <button onClick={() => setActiveTab('planner')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'planner' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><CalendarDays className="w-4 h-4" /> Weekly Plan</button>
           <button onClick={() => setActiveTab('tools')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'tools' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><Timer className="w-4 h-4" /> Tools</button>
           <button onClick={() => setActiveTab('smartboard')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'smartboard' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><Monitor className="w-4 h-4" /> Smart Board</button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button onClick={onCreateClick} className="bg-red-600 text-white p-6 rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 hover:scale-[1.02] transition-all text-left group">
              <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform"><Plus className="w-6 h-6" /></div>
              <h3 className="font-bold text-lg">Create New Lesson</h3>
              <p className="text-red-100 text-sm mt-1">Start from scratch with AI</p>
            </button>
            <button onClick={() => setIsWorksheetModalOpen(true)} className="bg-blue-600 text-white p-6 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition-all text-left group">
              <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform"><FileText className="w-6 h-6" /></div>
              <h3 className="font-bold text-lg">Worksheet Maker</h3>
              <p className="text-blue-100 text-sm mt-1">Generate printables instantly</p>
            </button>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex items-center justify-between mb-2"><h3 className="font-bold text-slate-700">Total Lessons</h3><BookOpen className="w-5 h-5 text-slate-400" /></div>
               <p className="text-3xl font-extrabold text-slate-900">{savedLessons.length}</p>
               <p className="text-xs text-slate-500 mt-1">Saved to library</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex items-center justify-between mb-2"><h3 className="font-bold text-slate-700">Class Size</h3><Users className="w-5 h-5 text-slate-400" /></div>
               <p className="text-3xl font-extrabold text-slate-900">{students.length}</p>
               <p className="text-xs text-slate-500 mt-1">Students enrolled</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
               <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><BookOpen className="w-5 h-5 text-slate-500" /> My Lesson Library</h2>
               <div className="relative w-full sm:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input type="text" placeholder="Search lessons..." className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
               </div>
            </div>
            {filteredLessons.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">No lessons found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredLessons.map((lesson) => (
                  <div key={lesson.id} className="group bg-slate-50 rounded-xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all overflow-hidden flex flex-col">
                    <div className="h-40 bg-white relative overflow-hidden border-b border-slate-100 p-4">
                      {lesson.subject === 'SmartBoard' ? (
                          <div className="w-full h-full bg-slate-800 rounded-lg shadow-sm flex items-center justify-center border-4 border-yellow-400/50">
                             <div className="text-center">
                                <span className="text-3xl">✨</span>
                                <p className="text-yellow-400 font-bold text-sm mt-1 uppercase">Smart Board</p>
                             </div>
                          </div>
                      ) : (
                          <div className="w-full h-full bg-white shadow-sm border border-slate-100 rounded flex flex-col p-3 overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                             <div className="h-2 w-16 bg-red-500 rounded-full mb-3"></div>
                             <h4 className="font-bold text-slate-800 text-sm leading-tight mb-2 line-clamp-2">{lesson.topic}</h4>
                             <div className="space-y-1.5 opacity-60">
                               <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                               <div className="h-1.5 w-3/4 bg-slate-200 rounded"></div>
                               <div className="h-1.5 w-5/6 bg-slate-200 rounded"></div>
                             </div>
                          </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onDeleteLesson(lesson.id)} className="p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-lg shadow-sm hover:shadow"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${lesson.subject === 'SmartBoard' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{lesson.subject}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600">{lesson.gradeLevel}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 truncate" title={lesson.topic}>{lesson.topic}</h3>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-200 flex gap-2">
                        {lesson.subject === 'SmartBoard' ? (
                           <Button variant="primary" className="w-full text-sm py-2" onClick={() => handleLessonCardClick(lesson)}><Play className="w-3 h-3 mr-1.5" /> Open Board</Button>
                        ) : (
                           <>
                            <Button variant="primary" className="flex-1 text-sm py-2" onClick={() => handleLessonCardClick(lesson)}><Play className="w-3 h-3 mr-1.5" /> Present</Button>
                            <Button variant="outline" className="flex-1 text-sm py-2" onClick={() => handleLessonCardClick(lesson)}><Edit className="w-3 h-3 mr-1.5" /> Edit</Button>
                           </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TOOLS TAB */}
      {activeTab === 'tools' && (
        <div className="animate-fadeIn">
            {maximizedTool ? (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4 flex items-center justify-center">
                    <div className="w-full h-full max-w-7xl max-h-screen bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {maximizedTool === 'stopwatch' && renderStopwatch(true)}
                        {maximizedTool === 'timer' && renderTimer(true)}
                        {maximizedTool === 'picker' && renderNamePicker(true)}
                        {maximizedTool === 'scramble' && renderWordScramble(true)}
                        {maximizedTool === 'chain' && renderWordChain(true)}
                    </div>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {renderStopwatch(false)}
                    {renderTimer(false)}
                    {renderNamePicker(false)}
                    {renderWordScramble(false)}
                    {renderWordChain(false)}
                </div>
            )}
        </div>
      )}

      {/* ... (OTHER TABS) ... */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-slate-500" /> Student Roster</h2>
              <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
                 <button onClick={() => setRosterGradeFilter('All')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${rosterGradeFilter === 'All' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All Students</button>
                 {GRADES.map(g => (<button key={g} onClick={() => setRosterGradeFilter(g)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${rosterGradeFilter === g ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{g}</button>))}
              </div>
           </div>
           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-500" /> Add Student</h3>
                 <form onSubmit={handleAddStudent} className="space-y-4">
                    <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label><input type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Student Name" /></div>
                    <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Grade</label><select value={rosterGradeFilter !== 'All' ? rosterGradeFilter : newStudentGrade} onChange={(e) => setNewStudentGrade(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 bg-white" disabled={rosterGradeFilter !== 'All'}>{GRADES.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                    <Button type="submit" className="w-full">Add to Roster</Button>
                 </form>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                 {students.filter(s => rosterGradeFilter === 'All' || s.grade === rosterGradeFilter).map(student => (
                   <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">{student.name.charAt(0)}</div><div><div className="font-bold text-slate-800">{student.name}</div><div className="text-xs text-slate-500">{student.grade}</div></div></div>
                      <button onClick={() => handleDeleteStudent(student.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                   </div>
                 ))}
                 {students.length === 0 && <p className="text-center text-slate-400 py-8">No students yet.</p>}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'games' && (
        <div className="space-y-6">
           <div className="flex bg-white p-2 rounded-xl shadow-sm border border-slate-200 overflow-x-auto no-scrollbar gap-2">
              <button onClick={() => setGameSubjectFilter('All')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${gameSubjectFilter === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>All Subjects</button>
              {SUBJECTS.map(subject => (<button key={subject} onClick={() => setGameSubjectFilter(subject)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${gameSubjectFilter === subject ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{subject}</button>))}
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                 <div key={game.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                    <div className={`${game.color} p-6 flex items-center justify-between`}><div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">{game.icon}</div><span className="text-xs font-bold text-white/90 bg-black/20 px-2 py-1 rounded uppercase tracking-wider">{game.subject}</span></div>
                    <div className="p-6 flex-1 flex flex-col">
                       <h3 className="font-bold text-xl text-slate-900 mb-2">{game.title}</h3>
                       <p className="text-slate-500 text-sm mb-6 flex-1">{game.description}</p>
                       {game.type === 'external' ? (
                          <a href={game.url} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-lg border-2 border-slate-200 font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors">Open Resource <ExternalLink className="w-4 h-4" /></a>
                       ) : (
                          <button onClick={() => { setMathGameData({ rounds: [], currentRound: 0, score: 0, lives: 3, bananas: [], gameActive: false, roundProgress: 0, victory: false }); setSortingData(null); setStoryData(null); setMemoryData({ cards: [], flipped: [], matched: [] }); setQuizGameData({ questions: [], currentIndex: 0, score: 0, showResult: false, selectedAnswer: null, feedback: null }); setGameConfig({ grade: GRADES[2], topic: '' }); setActiveGameId(game.id); }} className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${game.color}`}>Launch Activity <Play className="w-4 h-4 fill-current" /></button>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="animate-fadeIn">
           <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Globe2 className="w-6 h-6 text-blue-500" /> My Bookmarks</h2><Button onClick={() => setIsBookmarkModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Link</Button></div>
           {bookmarks.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300"><Link2 className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No bookmarks yet. Save your favorite sites here.</p></div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {bookmarks.map(b => (
                  <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
                     <button onClick={() => handleDeleteBookmark(b.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
                     <a href={b.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden border border-slate-100"><img src={`https://www.google.com/s2/favicons?domain=${b.url}&sz=64`} alt="icon" className="w-8 h-8" onError={(e) => e.currentTarget.style.display = 'none'} /></div>
                        <span className="font-bold text-slate-700 text-sm line-clamp-2">{b.title}</span>
                     </a>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}

      {activeTab === 'planner' && (
         <div className="animate-fadeIn bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full border-collapse">
                  <thead><tr><th className="p-4 border-b border-r border-slate-200 bg-slate-50 min-w-[100px]"></th>{PLANNER_DAYS.map(day => (<th key={day} className="p-4 border-b border-slate-200 bg-slate-50 text-slate-700 font-bold min-w-[180px]">{day}</th>))}</tr></thead>
                  <tbody>
                     {PLANNER_PERIODS.map((period, idx) => (
                        <tr key={idx}>
                           <td className="p-4 border-r border-b border-slate-200 bg-slate-50 font-bold text-slate-500 text-center text-sm">{typeof period === 'number' ? `Period ${period}` : period}</td>
                           {PLANNER_DAYS.map(day => {
                              const key = `${day}-${period}`;
                              const entry = weeklyPlan[key];
                              return (
                                 <td key={key} onClick={() => handlePlannerCellClick(day, period)} className={`p-3 border-b border-r border-slate-100 hover:bg-slate-50 cursor-pointer align-top h-32 transition-colors relative group ${entry?.color || ''}`}>
                                    {entry ? (
                                       <div className="h-full flex flex-col">
                                          <div className="font-bold text-slate-800 text-sm mb-1">{entry.subject}</div>
                                          <div className="text-xs text-slate-500 line-clamp-3 whitespace-pre-wrap flex-1">{entry.notes}</div>
                                          {entry.smartBoardData && (
                                              <button onClick={(e) => handleLaunchSbFromPlanner(entry.smartBoardData!, e)} className="mt-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded flex items-center gap-1 font-bold hover:bg-yellow-200 w-fit z-10 relative">
                                                <Monitor className="w-3 h-3 fill-current" /> Launch Board
                                              </button>
                                          )}
                                          {entry.presentationId && (
                                              <button onClick={(e) => { e.stopPropagation(); const lesson = savedLessons.find(l => l.id === entry.presentationId); if (lesson) handleLessonCardClick(lesson); }} className="mt-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1 font-bold hover:bg-red-200 w-fit z-10 relative">
                                                <Play className="w-3 h-3 fill-current" /> Play Lesson
                                              </button>
                                          )}
                                          {entry.externalUrl && (
                                              <a href={entry.externalUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1 font-bold hover:bg-blue-200 w-fit z-10 relative">
                                                <ExternalLink className="w-3 h-3" /> Open Link
                                              </a>
                                          )}
                                       </div>
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100"><Plus className="w-5 h-5 text-slate-300" /></div>
                                    )}
                                 </td>
                              );
                           })}
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {activeTab === 'smartboard' && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col overflow-hidden">
           {showSbSaveToast && (<div className="absolute top-20 right-4 z-[70] bg-green-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-fadeIn"><CheckCircle className="w-4 h-4" /> Board Saved</div>)}
           <div className="h-14 bg-slate-800 flex items-center justify-between px-4 shrink-0 z-50">
              <div className="flex items-center gap-4">
                 <h2 className="text-white font-bold flex items-center gap-2"><Monitor className="w-5 h-5 text-green-400" /> Smart Board</h2>
                 <div className="bg-slate-700 px-3 py-1 rounded-full text-slate-300 font-mono text-sm">{sbTime.toLocaleDateString()} • {sbTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                 <button onClick={() => setIsStudentMode(!isStudentMode)} className={`ml-4 p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${isStudentMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                    {isStudentMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} {isStudentMode ? 'Student View' : 'Teacher View'}
                 </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleSaveSmartBoard} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white relative"><Save className="w-5 h-5" /></button>
                <button onClick={handleSbSaveToLibrary} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white relative"><BookPlus className="w-5 h-5" /></button>
                <button onClick={() => setSbPlannerModalOpen(true)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white relative"><CalendarPlus className="w-5 h-5" /></button>
                <button onClick={() => setIsSbSettingsOpen(!isSbSettingsOpen)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white relative">
                   <Settings className="w-5 h-5" />
                   {isSbSettingsOpen && (
                      <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-4 animate-fadeIn z-[60] max-h-[80vh] overflow-y-auto">
                         <div className="mb-6 border-b border-slate-700 pb-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex justify-between items-center">Saved Layouts <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">{sbPresets.length}</span></h3>
                            <button onClick={handleSavePreset} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg mb-3 flex items-center justify-center gap-2 transition-colors"><Plus className="w-3 h-3" /> Save Current as New</button>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {sbPresets.map(preset => (
                                    <div key={preset.id} onClick={() => handleLoadPreset(preset)} className="group flex items-center justify-between p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors border border-transparent hover:border-slate-600"><span className="text-xs text-slate-300 font-medium truncate flex-1">{preset.name}</span><button onClick={(e) => handleDeletePreset(preset.id, e)} className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button></div>
                                ))}
                            </div>
                         </div>
                         <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Background Theme</h3>
                         <div className="grid grid-cols-2 gap-2">{SB_BG_IMAGES.map(bg => (<button key={bg.id} onClick={() => { setSbBackground(bg.url); setIsSbSettingsOpen(false); }} className={`h-16 rounded-lg bg-cover bg-center border-2 transition-all ${sbBackground === bg.url ? 'border-green-500' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ backgroundImage: `url(${bg.url})` }} title={bg.name} />))}</div>
                      </div>
                   )}
                </button>
                <button onClick={() => setActiveTab('overview')} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
           </div>
           <div className="flex-1 relative bg-cover bg-center transition-all duration-700 flex flex-col" style={{ backgroundImage: `url(${sbBackground})` }}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
              <div className="relative z-10 flex justify-center pt-8 md:pt-12 mb-8">
                 <div className="bg-white/90 backdrop-blur-md px-12 py-4 rounded-full shadow-2xl border-4 border-white/50 animate-bounce-slow">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight flex items-center gap-3"><span className="text-yellow-500">✨</span> Today in Our Class <span className="text-yellow-500">✨</span></h1>
                 </div>
              </div>
              <div className="relative z-10 flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 h-full max-h-[800px]">
                    <div className="bg-yellow-200 rounded-xl shadow-xl p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300 flex flex-col relative group">
                       <div className="absolute top-4 right-4 text-yellow-500/30 rotate-12 pointer-events-none"><BookOpen className="w-24 h-24" /></div>
                       <div className="w-32 h-8 bg-yellow-300/50 mx-auto rounded-full mb-4"></div>
                       <h3 className="text-2xl font-bold text-yellow-900 mb-2 text-center uppercase tracking-wider">Today's Learning</h3>
                       <textarea value={sbNotes.learning} onChange={(e) => setSbNotes({...sbNotes, learning: e.target.value})} className="flex-1 bg-transparent border-none outline-none resize-none font-medium text-lg text-yellow-900 placeholder:text-yellow-800/50" />
                    </div>
                    <div className="bg-pink-200 rounded-xl shadow-xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300 flex flex-col relative group">
                       <div className="absolute top-4 right-4 text-pink-500/30 -rotate-12 pointer-events-none"><Star className="w-24 h-24" /></div>
                       <div className="w-32 h-8 bg-pink-300/50 mx-auto rounded-full mb-4"></div>
                       <h3 className="text-2xl font-bold text-pink-900 mb-2 text-center uppercase tracking-wider">Activities</h3>
                       <textarea value={sbNotes.activities} onChange={(e) => setSbNotes({...sbNotes, activities: e.target.value})} className="flex-1 bg-transparent border-none outline-none resize-none font-medium text-lg text-pink-900 placeholder:text-pink-800/50" />
                    </div>
                    <div className="bg-blue-200 rounded-xl shadow-xl p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300 flex flex-col relative group">
                       <div className="absolute top-4 right-4 text-blue-500/30 rotate-6 pointer-events-none"><Bell className="w-24 h-24" /></div>
                       <div className="w-32 h-8 bg-blue-300/50 mx-auto rounded-full mb-4"></div>
                       <h3 className="text-2xl font-bold text-blue-900 mb-2 text-center uppercase tracking-wider">Reminders</h3>
                       <textarea value={sbNotes.reminders} onChange={(e) => setSbNotes({...sbNotes, reminders: e.target.value})} className="flex-1 bg-transparent border-none outline-none resize-none font-medium text-lg text-blue-900 placeholder:text-blue-800/50" />
                    </div>
                    <div className="bg-green-200 rounded-xl shadow-xl p-6 transform -rotate-2 hover:rotate-0 transition-transform duration-300 flex flex-col relative group">
                       <div className="absolute top-4 right-4 text-green-500/30 -rotate-6 pointer-events-none"><PartyPopper className="w-24 h-24" /></div>
                       <div className="w-32 h-8 bg-green-300/50 mx-auto rounded-full mb-4"></div>
                       <h3 className="text-2xl font-bold text-green-900 mb-2 text-center uppercase tracking-wider">Special Notes</h3>
                       <textarea value={sbNotes.special} onChange={(e) => setSbNotes({...sbNotes, special: e.target.value})} className="flex-1 bg-transparent border-none outline-none resize-none font-medium text-lg text-green-900 placeholder:text-green-800/50" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- MODALS --- */}
      
      {isWorksheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-[95vw] h-[95vh] flex overflow-hidden">
            <div className="w-96 shrink-0 bg-slate-50 border-r border-slate-200 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2"><FileText className="w-6 h-6 text-blue-600" /> Worksheet Studio</h2><button onClick={() => setIsWorksheetModalOpen(false)}><X className="w-5 h-5 text-slate-400"/></button></div>
              <div className="space-y-4 mb-6">
                 <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic</label><input type="text" value={worksheetConfig.topic} onChange={(e) => setWorksheetConfig({...worksheetConfig, topic: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Ancient Egypt" /></div>
                 <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label><select value={worksheetConfig.subject} onChange={(e) => setWorksheetConfig({...worksheetConfig, subject: e.target.value})} className="w-full p-2.5 border rounded-lg">{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                 <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grade</label><select value={worksheetConfig.grade} onChange={(e) => setWorksheetConfig({...worksheetConfig, grade: e.target.value})} className="w-full p-2.5 border rounded-lg">{GRADES.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                 <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Style</label><select value={worksheetConfig.style} onChange={(e) => setWorksheetConfig({...worksheetConfig, style: e.target.value as WorksheetStyle})} className="w-full p-2.5 border rounded-lg"><option value="standard">Standard Review</option><option value="vocabulary">Vocabulary & Match</option><option value="critical_thinking">Critical Thinking</option><option value="math_drill">Math Drills</option></select></div>
                 <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Questions</label><input type="number" min="5" max="30" value={worksheetConfig.questionCount} onChange={(e) => setWorksheetConfig({...worksheetConfig, questionCount: parseInt(e.target.value)})} className="w-full p-2.5 border rounded-lg" /></div>
                 <Button onClick={handleWorksheetGenerate} isLoading={isWorksheetLoading} className="w-full bg-blue-600 hover:bg-blue-700">Generate Worksheet</Button>
              </div>
            </div>
            <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex justify-center">
              {generatedWorksheet ? (
                 <div className="w-full max-w-[800px] bg-white shadow-xl min-h-[1000px] p-12 relative group">
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => setShowWorksheetAnswerKey(!showWorksheetAnswerKey)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded text-xs font-bold border border-slate-300 flex items-center gap-1">{showWorksheetAnswerKey ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>} {showWorksheetAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}</button>
                      <button onClick={handleWorksheetPrint} className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold hover:bg-slate-800 flex items-center gap-1"><Printer className="w-3 h-3"/> Print</button>
                    </div>
                    <div className="border-b-2 border-black pb-4 mb-8">
                       <h1 className="text-3xl font-bold text-center uppercase mb-2 text-black">{generatedWorksheet.topic}</h1>
                       <div className="flex justify-between text-sm text-black font-bold">
                         <span>{generatedWorksheet.grade} • {generatedWorksheet.subject}</span>
                         {showWorksheetAnswerKey && <span className="border-2 border-black px-2 bg-red-100">ANSWER KEY</span>}
                       </div>
                    </div>
                    <div id="worksheet-preview-content" className="prose-lg max-w-none text-black">
                       <SimpleMarkdown content={showWorksheetAnswerKey ? generatedWorksheet.teacherMarkdown : generatedWorksheet.studentMarkdown} />
                    </div>
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400"><FileText className="w-16 h-16 mb-4 opacity-50" /><p>Configure settings and click generate to create a worksheet.</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {isBookmarkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Bookmark</h2>
            <form onSubmit={handleAddBookmark} className="space-y-4">
              <input type="text" placeholder="Title (e.g. Kahoot)" value={newBookmark.title} onChange={e => setNewBookmark({...newBookmark, title: e.target.value})} className="w-full p-2.5 border rounded-lg" required />
              <input type="text" placeholder="URL (e.g. kahoot.com)" value={newBookmark.url} onChange={e => setNewBookmark({...newBookmark, url: e.target.value})} className="w-full p-2.5 border rounded-lg" required />
              <div className="flex gap-2 justify-end pt-2"><Button type="button" variant="outline" onClick={() => setIsBookmarkModalOpen(false)}>Cancel</Button><Button type="submit">Add Link</Button></div>
            </form>
          </div>
        </div>
      )}

      {plannerModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
               <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">Plan {editingSlot?.day}, Period {editingSlot?.period}</h2><button onClick={() => setPlannerModalOpen(false)}><X className="w-5 h-5 text-slate-400"/></button></div>
               <div className="space-y-4">
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Subject</label><input type="text" value={slotForm.subject} onChange={e => setSlotForm({...slotForm, subject: e.target.value})} className="w-full p-2.5 border rounded-lg" /></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Notes / Plan</label><textarea value={slotForm.notes} onChange={e => setSlotForm({...slotForm, notes: e.target.value})} className="w-full p-2.5 border rounded-lg h-24" /></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Color Code</label><div className="flex gap-2"><button onClick={() => setSlotForm({...slotForm, color: 'bg-white'})} className={`w-6 h-6 rounded-full border ${slotForm.color === 'bg-white' ? 'ring-2 ring-slate-400' : ''} bg-white`}/><button onClick={() => setSlotForm({...slotForm, color: 'bg-red-50'})} className={`w-6 h-6 rounded-full border ${slotForm.color === 'bg-red-50' ? 'ring-2 ring-slate-400' : ''} bg-red-50`}/><button onClick={() => setSlotForm({...slotForm, color: 'bg-blue-50'})} className={`w-6 h-6 rounded-full border ${slotForm.color === 'bg-blue-50' ? 'ring-2 ring-slate-400' : ''} bg-blue-50`}/><button onClick={() => setSlotForm({...slotForm, color: 'bg-green-50'})} className={`w-6 h-6 rounded-full border ${slotForm.color === 'bg-green-50' ? 'ring-2 ring-slate-400' : ''} bg-green-50`}/><button onClick={() => setSlotForm({...slotForm, color: 'bg-yellow-50'})} className={`w-6 h-6 rounded-full border ${slotForm.color === 'bg-yellow-50' ? 'ring-2 ring-slate-400' : ''} bg-yellow-50`}/></div></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Attach Lesson</label><select value={slotForm.presentationId || ''} onChange={e => setSlotForm({...slotForm, presentationId: e.target.value})} className="w-full p-2.5 border rounded-lg"><option value="">None</option>{savedLessons.map(l => <option key={l.id} value={l.id}>{l.topic}</option>)}</select></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">External Link</label><input type="text" value={slotForm.externalUrl || ''} onChange={e => setSlotForm({...slotForm, externalUrl: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="https://..." /></div>
                  <div className="flex gap-2 pt-4"><Button variant="outline" onClick={handleClearSlot} className="text-red-600 border-red-200 hover:bg-red-50">Clear Slot</Button><div className="flex-1"></div><Button variant="outline" onClick={() => setPlannerModalOpen(false)}>Cancel</Button><Button onClick={handleSaveSlot}>Save Plan</Button></div>
               </div>
            </div>
         </div>
      )}

      {sbPlannerModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-lg font-bold mb-4">Add Board to Planner</h2>
                <div className="space-y-4">
                    <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Day</label><select value={sbTargetDay} onChange={e => setSbTargetDay(e.target.value)} className="w-full p-2 border rounded-lg">{PLANNER_DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                    <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Period</label><select value={sbTargetPeriod} onChange={e => setSbTargetPeriod(e.target.value)} className="w-full p-2 border rounded-lg">{PLANNER_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                    <Button onClick={handleSbAddToPlanner} className="w-full">Add to Schedule</Button>
                    <Button variant="outline" onClick={() => setSbPlannerModalOpen(false)} className="w-full">Cancel</Button>
                </div>
            </div>
          </div>
      )}

      {activeGameId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
             <button onClick={() => setActiveGameId(null)} className="absolute top-4 right-4 z-50 bg-white/50 hover:bg-white p-2 rounded-full transition-colors"><X className="w-6 h-6 text-slate-900" /></button>
             
             {(!mathGameData.gameActive && !sortingData && !storyData && !memoryData.cards.length && !quizGameData.questions.length && !gameLoading) && (
                <div className="p-12 flex flex-col items-center text-center">
                   <div className={`w-20 h-20 ${activeGameDef?.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>{activeGameDef?.icon}</div>
                   <h2 className="text-3xl font-bold text-slate-900 mb-2">{activeGameDef?.title}</h2>
                   <p className="text-slate-500 max-w-md mb-8">{activeGameDef?.description}</p>
                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 w-full max-w-md space-y-4">
                      <div><label className="block text-left text-xs font-bold uppercase text-slate-500 mb-1">Grade Level</label><select value={gameConfig.grade} onChange={(e) => setGameConfig({...gameConfig, grade: e.target.value})} className="w-full p-3 rounded-lg border border-slate-300">{GRADES.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                      <div><label className="block text-left text-xs font-bold uppercase text-slate-500 mb-1">Specific Topic (Optional)</label><input type="text" placeholder="e.g. Fractions, Ancient Egypt..." value={gameConfig.topic} onChange={(e) => setGameConfig({...gameConfig, topic: e.target.value})} className="w-full p-3 rounded-lg border border-slate-300" /></div>
                      <Button onClick={startGame} className={`w-full py-4 text-lg shadow-lg ${activeGameDef?.color.replace('bg-', 'shadow-').replace('500', '200')}`}>Start Game</Button>
                   </div>
                </div>
             )}

             {gameLoading && (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                   <div className="w-16 h-16 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
                   <h3 className="text-xl font-bold text-slate-700">Generating Game...</h3>
                   <p className="text-slate-500">Our AI is creating content just for you.</p>
                </div>
             )}

             {activeGameId === 'math-ninja' && mathGameData.gameActive && (
               <div className="flex-1 relative bg-slate-900 overflow-hidden select-none cursor-crosshair">
                  <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 pointer-events-none">
                     <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-white"><div className="text-xs uppercase font-bold opacity-70">Target</div><div className="text-2xl font-bold text-yellow-400">{mathGameData.rounds[mathGameData.currentRound]?.targetDescription} ({mathGameData.rounds[mathGameData.currentRound]?.target})</div></div>
                     <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-white"><div className="text-xs uppercase font-bold opacity-70">Wave</div><div className="text-xl font-bold text-blue-400">{mathGameData.currentRound + 1} / 3 <span className="text-sm ml-2 text-slate-400">🍌 {mathGameData.roundProgress}/5</span></div></div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-white"><div className="text-xs uppercase font-bold opacity-70">Score</div><div className="text-xl font-bold">{mathGameData.score}</div></div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-white"><div className="text-xs uppercase font-bold opacity-70">Lives</div><div className="flex text-xl text-red-500">{'❤️'.repeat(mathGameData.lives)}</div></div>
                     </div>
                  </div>
                  <div className="absolute bottom-0 right-10 z-10 text-[100px] transition-transform duration-300">{monkeyMood === 'happy' ? '🐵' : monkeyMood === 'mad' ? '😡' : '🐒'}</div>
                  {mathGameData.bananas.map(b => (
                     <button key={b.id} onClick={() => handleBananaClick(b.id, b.isCorrect)} className="absolute text-3xl font-bold bg-yellow-400 px-4 py-2 rounded-full shadow-lg border-2 border-yellow-600 hover:scale-110 active:scale-95 transition-transform animate-spin-slow" style={{ left: `${b.x}%`, top: `${b.y}%` }}>{b.content}</button>
                  ))}
                  {(mathGameData.victory || mathGameData.lives <= 0) && (
                     <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center pointer-events-auto">
                        <div className="bg-white p-8 rounded-2xl text-center max-w-sm">
                           <div className="text-6xl mb-4">{mathGameData.victory ? '🏆' : '💀'}</div>
                           <h2 className="text-3xl font-bold mb-2">{mathGameData.victory ? 'You Win!' : 'Game Over'}</h2>
                           <p className="text-xl mb-6">Final Score: {mathGameData.score}</p>
                           <Button onClick={() => setMathGameData(prev => ({ ...prev, gameActive: false, currentRound: 0, score: 0, lives: 3, victory: false }))}>Play Again</Button>
                        </div>
                     </div>
                  )}
               </div>
             )}

             {sortingData && (
                <div className="flex-1 flex flex-col bg-slate-100 p-6">
                   <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">Sort the Items!</h2>
                      <p className="text-slate-500">Drag items to the correct bucket.</p>
                   </div>
                   <div className="flex-1 flex gap-4">
                      <div className={`flex-1 ${activeGameDef?.color.replace('bg-', 'bg-opacity-10 bg-')} rounded-2xl border-2 border-dashed border-slate-300 p-4 flex flex-col items-center justify-center`}>
                         <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 mb-4 w-full text-center font-bold text-lg">{sortingData.categories[0]}</div>
                         <div className="flex-1 w-full bg-white/50 rounded-xl p-2 space-y-2 overflow-y-auto">
                            {sortingState.buckets[0].map(item => (<div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-sm font-medium">{item.text}</div>))}
                         </div>
                         <Button className="mt-4 w-full" onClick={() => sortingState.itemsLeft.length > 0 && handleSortDrop(sortingState.itemsLeft[0].id, 0)}>Add Here</Button>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center py-8">
                         {sortingState.itemsLeft.length > 0 ? (
                            <div className="w-full max-w-xs bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center transform hover:scale-105 transition-transform cursor-grab active:cursor-grabbing">
                               <div className="text-4xl mb-4">📦</div>
                               <h3 className="text-xl font-bold text-slate-900">{sortingState.itemsLeft[0].text}</h3>
                            </div>
                         ) : (
                            <div className="text-center animate-fadeIn">
                               <div className="text-6xl mb-4">🎉</div>
                               <h3 className="text-2xl font-bold text-slate-900">All Sorted!</h3>
                               <p className="text-slate-500 mb-6">Check your results below.</p>
                               <div className="grid grid-cols-2 gap-4 text-left w-full max-w-md bg-white p-4 rounded-xl shadow-sm border mb-4">
                                  {sortingState.buckets.map((bucket, bIdx) => (
                                     <div key={bIdx}>
                                        <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">{sortingData.categories[bIdx]}</h4>
                                        <ul className="space-y-1">
                                           {bucket.map(item => {
                                              const correct = item.categoryIndex === bIdx;
                                              return (
                                                 <li key={item.id} className={`text-xs flex items-center gap-1 ${correct ? 'text-green-600' : 'text-red-500'}`}>
                                                    {correct ? <CheckCircle className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>} {item.text}
                                                 </li>
                                              );
                                           })}
                                        </ul>
                                     </div>
                                  ))}
                               </div>
                               <Button onClick={() => setSortingData(null)}>Play Again</Button>
                            </div>
                         )}
                      </div>
                      <div className={`flex-1 ${activeGameDef?.color.replace('bg-', 'bg-opacity-10 bg-')} rounded-2xl border-2 border-dashed border-slate-300 p-4 flex flex-col items-center justify-center`}>
                         <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 mb-4 w-full text-center font-bold text-lg">{sortingData.categories[1]}</div>
                         <div className="flex-1 w-full bg-white/50 rounded-xl p-2 space-y-2 overflow-y-auto">
                            {sortingState.buckets[1].map(item => (<div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-sm font-medium">{item.text}</div>))}
                         </div>
                         <Button className="mt-4 w-full" onClick={() => sortingState.itemsLeft.length > 0 && handleSortDrop(sortingState.itemsLeft[0].id, 1)}>Add Here</Button>
                      </div>
                   </div>
                </div>
             )}
             
             {storyData && (
               <div className="flex-1 flex flex-col p-8 bg-pink-50 overflow-y-auto">
                 {!showStoryResult ? (
                   <div className="max-w-xl mx-auto w-full">
                      <h2 className="text-3xl font-bold text-pink-900 mb-2 text-center">Create Your Story</h2>
                      <p className="text-pink-700 text-center mb-8">Fill in the blanks to write a funny story!</p>
                      <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 space-y-4">
                         {storyData.placeholders.map((p, i) => (
                            <div key={i}>
                               <label className="block text-xs font-bold uppercase text-pink-400 mb-1">{p.label}</label>
                               <input type="text" className="w-full p-3 bg-pink-50 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder={`Type a ${p.label.toLowerCase()}...`} onChange={(e) => setStoryInputs({...storyInputs, [p.key]: e.target.value})} />
                            </div>
                         ))}
                         <Button onClick={() => setShowStoryResult(true)} className="w-full mt-4 bg-pink-500 hover:bg-pink-600">Read Story</Button>
                      </div>
                   </div>
                 ) : (
                   <div className="max-w-2xl mx-auto w-full text-center animate-fadeIn">
                      <h2 className="text-3xl font-bold text-pink-900 mb-8">{storyData.title}</h2>
                      <div className="bg-white p-8 rounded-2xl shadow-xl border border-pink-100 text-xl leading-relaxed text-slate-800 text-left">
                         {storyData.template.split(/(\{\d+\})/g).map((part, i) => {
                            if (part.match(/^\{\d+\}$/)) {
                               return <span key={i} className="font-bold text-pink-600 border-b-2 border-pink-300 px-1 bg-pink-50 rounded">{storyInputs[part] || '___'}</span>;
                            }
                            return <span key={i}>{part}</span>;
                         })}
                      </div>
                      <Button onClick={() => { setStoryData(null); }} className="mt-8 bg-pink-500 hover:bg-pink-600">Create Another</Button>
                   </div>
                 )}
               </div>
             )}

             {memoryData.cards.length > 0 && (
                <div className="flex-1 bg-blue-50 p-6 flex flex-col">
                   <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">Memory Match</h2>
                      <p className="text-slate-500">Find the matching pairs!</p>
                   </div>
                   <div className="flex-1 flex items-center justify-center">
                      <div className="grid grid-cols-4 gap-4 max-w-2xl w-full">
                         {memoryData.cards.map((card, i) => {
                            const isFlipped = memoryData.flipped.includes(i) || memoryData.matched.includes(card.id);
                            const isMatched = memoryData.matched.includes(card.id);
                            return (
                               <div key={card.id} onClick={() => handleCardClick(i)} className={`aspect-[3/4] rounded-xl cursor-pointer perspective-1000 group relative`}>
                                  <div className={`w-full h-full transition-all duration-500 transform style-3d relative rounded-xl shadow-md border-2 ${isFlipped ? 'bg-white border-blue-500' : 'bg-blue-600 border-blue-700'}`}>
                                     {isFlipped ? (
                                        <div className={`absolute inset-0 flex items-center justify-center p-2 text-center font-bold text-slate-800 text-sm break-words ${isMatched ? 'bg-green-50 text-green-700' : ''}`}>
                                           {card.content}
                                        </div>
                                     ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-blue-200">
                                           <HelpCircle className="w-8 h-8 opacity-50" />
                                        </div>
                                     )}
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   </div>
                   {memoryData.matched.length === memoryData.cards.length && (
                      <div className="text-center py-4 animate-fadeIn">
                         <h3 className="text-2xl font-bold text-blue-600 mb-2">Excellent Memory!</h3>
                         <Button onClick={() => setMemoryData({ cards: [], flipped: [], matched: [] })}>Play Again</Button>
                      </div>
                   )}
                </div>
             )}

             {quizGameData.questions.length > 0 && (
                <div className="flex-1 bg-slate-50 p-8 flex flex-col items-center justify-center min-h-full py-8 overflow-y-auto">
                   {!quizGameData.showResult ? (
                      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
                         <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Question {quizGameData.currentIndex + 1} of {quizGameData.questions.length}</span>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">Score: {quizGameData.score}</span>
                         </div>
                         <h2 className="text-2xl font-bold text-slate-900 mb-8">{quizGameData.questions[quizGameData.currentIndex].text}</h2>
                         <div className="grid grid-cols-1 gap-4 mb-8">
                            {quizGameData.questions[quizGameData.currentIndex].options.map((opt, i) => (
                               <button 
                                 key={i} 
                                 onClick={() => handleQuizAnswer(opt)} 
                                 disabled={!!quizGameData.selectedAnswer}
                                 className={`p-4 rounded-xl text-left font-medium border-2 transition-all ${
                                    quizGameData.selectedAnswer === opt 
                                      ? (opt === quizGameData.questions[quizGameData.currentIndex].correctAnswer ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700')
                                      : 'bg-white border-slate-100 hover:border-blue-300 hover:bg-blue-50 text-slate-700'
                                 }`}
                               >
                                  {opt}
                               </button>
                            ))}
                         </div>
                         {quizGameData.selectedAnswer && (
                            <div ref={feedbackRef} key={quizGameData.currentIndex} className="animate-fadeIn pt-4 border-t border-slate-100">
                               <div className={`p-4 rounded-lg mb-4 ${quizGameData.selectedAnswer === quizGameData.questions[quizGameData.currentIndex].correctAnswer ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {quizGameData.feedback}
                               </div>
                               <Button onClick={nextQuizQuestion} className="w-full py-3 text-lg">
                                  {quizGameData.currentIndex < quizGameData.questions.length - 1 ? "Next Question" : "See Results"}
                                </Button>
                            </div>
                         )}
                      </div>
                   ) : (
                      <div className="text-center animate-fadeIn">
                         <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600 shadow-lg border-4 border-white"><Trophy className="w-12 h-12 fill-current"/></div>
                         <h2 className="text-4xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
                         <p className="text-xl text-slate-600 mb-8">You scored {quizGameData.score} out of {quizGameData.questions.length}</p>
                         <Button onClick={() => setQuizGameData({ questions: [], currentIndex: 0, score: 0, showResult: false, selectedAnswer: null, feedback: null })} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">Play Again</Button>
                      </div>
                   )}
                </div>
             )}
          </div>
        </div>
      )}

    </div>
  );
};
