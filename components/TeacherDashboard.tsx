
import React, { useState, useEffect, useRef } from 'react';
import { LessonPlan, Student, UserProfile, TeacherBookmark, PlannerEntry, GradeLevel, WorksheetStyle, GeneratedWorksheet, WeeklyPlanSlot, DailyActivity } from '../types';
import { 
  Plus, Search, Trash2, BookOpen, Users, UserPlus, Shuffle, Play, X, 
  Timer as TimerIcon, RefreshCcw, Pause, ChevronDown, ArrowRight, 
  CheckSquare, Square, Loader2, LifeBuoy, Dices, Globe, Link as LinkIcon, 
  ExternalLink, GraduationCap, UserCheck, Monitor, Calendar, User as UserIcon, 
  Bell, Lightbulb, Pen, Eraser, Sparkles, Zap, Clock, ClipboardList, KeyRound,
  Layers, MapPin, MoreVertical, Layout, Type, FileText, Printer, Eye, EyeOff, Save, Download, Check,
  Maximize, Minimize, Trophy, ListChecks, Upload, Timer, AlertCircle, Maximize2, Minimize2,
  ChevronUp, ChevronDown as ChevronDownIcon, PlayCircle, ShieldCheck, Crown, Image as ImageIcon,
  GripVertical, Coffee, Activity as ActivityIcon, Minus
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../constants';
import { Button } from './Button';
import { HelpCenter } from './HelpCenter';
import { resetPassword } from '../services/auth';
import { generateStandaloneWorksheet } from '../services/geminiService';
import { saveWeeklyPlan, getWeeklyPlan, saveUserSettings, getUserSettings } from '../services/repository';

interface TeacherDashboardProps {
  userProfile: UserProfile;
  savedLessons: LessonPlan[];
  onCreateClick: () => void;
  onLessonClick: (lesson: LessonPlan) => void;
  onDeleteLesson: (id: string) => void;
  onSaveLesson: (lesson: LessonPlan) => Promise<void>;
  usageStats?: {
      used: number;
      limit: number;
  };
}

type DashboardTab = 'overview' | 'planner' | 'worksheets' | 'students' | 'groups' | 'tools' | 'links' | 'smartboard' | 'daily_activity';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 11);
};

const WorksheetRenderer: React.FC<{ markdown: string; isTeacher: boolean }> = ({ markdown, isTeacher }) => {
  if (!markdown) return null;
  const cleanContent = (text: string) => text.replace(/\\\$/g, '').replace(/\$/g, '').replace(/\\/g, '').replace(/```/g, '').trim();

  return (
    <div className={`prose prose-slate max-w-none font-serif leading-relaxed printable-content ${isTeacher ? 'teacher-key-style' : 'student-handout-style'}`}>
      <div className="hidden print:block mb-10 border-b-4 border-slate-900 pb-6">
        <div className="flex justify-between items-end mb-4">
           <h1 className="text-3xl font-black m-0 uppercase tracking-tight">{isTeacher ? 'Teacher Answer Key' : 'Student Handout'}</h1>
           <div className="text-right"><p className="text-[10px] font-bold uppercase text-slate-400 m-0">MaplePrep Canadian Education</p></div>
        </div>
        {!isTeacher && <div className="flex justify-between text-[11px] font-bold text-slate-500 mt-6 pt-4 border-t border-slate-100"><div className="flex-1">Name: ________________________________________________</div><div className="w-48 text-right">Date: ____________________</div></div>}
      </div>
      {markdown.split('\n').map((line, i) => {
        let trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-6"></div>;
        const content = cleanContent(trimmed);
        if (!content) return null;

        if (trimmed.startsWith('---')) return <hr key={i} className="my-10 border-slate-300" />;
        if (trimmed.startsWith('# ')) return <h1 key={i} className="text-4xl font-black text-slate-900 border-b-2 border-slate-200 pb-4 mb-10 uppercase tracking-tight">{content.replace(/^#\s*/, '')}</h1>;
        if (trimmed.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-slate-800 mt-12 mb-6 border-l-8 border-slate-200 pl-6 bg-slate-50 py-2">{content.replace(/^##\s*/, '')}</h2>;
        
        // Match Question Number
        const qMatch = trimmed.match(/^(\*\*)?(\d+)[\.\)]/);
        if (qMatch) {
          return (
            <div key={i} className="mb-8 mt-10">
              <div className="flex gap-6 items-start">
                <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-lg shadow-md">{qMatch[2]}</span>
                <p className="text-xl font-bold text-slate-900 pt-1 leading-snug">{content.replace(/^(\*\*)?\d+[\.\)]\s*/, '').replace(/\*\*$/, '')}</p>
              </div>
            </div>
          );
        }

        // Match Option Letter (a, b, c, d)
        const oMatch = trimmed.match(/^(\*\*)?([a-dA-D1-4])[\.\)]/);
        if (oMatch) {
          const letter = oMatch[2].toUpperCase();
          const isCorrect = isTeacher && (trimmed.startsWith('**') || trimmed.endsWith('**') || trimmed.toLowerCase().includes('(correct)') || trimmed.toLowerCase().includes('answer:'));
          
          return (
            <div key={i} className={`ml-16 mb-4 flex items-center gap-5 group py-3 px-6 rounded-2xl transition-all ${isCorrect ? 'bg-green-50 border-2 border-green-200 shadow-sm' : 'border-2 border-transparent'}`}>
              <div className={`w-7 h-7 border-2 rounded-full flex items-center justify-center shrink-0 transition-all ${isCorrect ? 'bg-green-600 border-green-600 text-white' : 'border-slate-200'}`}>
                {isCorrect ? <Check className="w-4 h-4" /> : <span className="text-[10px] font-black opacity-30">{letter}</span>}
              </div>
              <p className={`text-lg font-medium ${isCorrect ? 'text-green-800 font-bold' : 'text-slate-700'}`}>
                <span className="font-black mr-3 opacity-40">{letter})</span>
                {content.replace(/^(\*\*)?([a-dA-D1-4])[\.\)]\s*/, '').replace(/\*\*/g, '').replace(/\(correct\)/gi, '')}
              </p>
            </div>
          );
        }

        const isAnswerText = isTeacher && (content.toLowerCase().includes('answer:') || content.toLowerCase().includes('key:'));
        return (
          <p key={i} className={`mb-4 text-lg leading-relaxed pl-1 ${isAnswerText ? 'font-black text-red-600 bg-red-50 p-6 rounded-2xl border-l-8 border-red-500 shadow-inner mt-8' : 'text-slate-700 font-medium'}`}>
            {content}
          </p>
        );
      })}
    </div>
  );
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  userProfile, savedLessons, onCreateClick, onLessonClick, onDeleteLesson, onSaveLesson, usageStats
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!userProfile.email) return;
    setIsResettingPassword(true);
    try {
      await resetPassword(userProfile.email);
      alert(`A password reset link has been sent to ${userProfile.email}. Please check your inbox.`);
    } catch (err) {
      console.error("Reset error:", err);
      alert("Failed to send reset email. Please try again later.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // --- WORKSHEET MAKER STATE ---
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);
  const [currentWorksheet, setCurrentWorksheet] = useState<GeneratedWorksheet | null>(null);
  const [worksheetView, setWorksheetView] = useState<'student' | 'teacher'>('student');
  const [wsTopic, setWsTopic] = useState('');
  const [wsGrade, setWsGrade] = useState<GradeLevel>(GRADES[0]);
  const [wsStyle, setWsStyle] = useState<WorksheetStyle>('standard');
  const [wsCount, setWsCount] = useState(15);
  const [isSavingWorksheet, setIsSavingWorksheet] = useState(false);
  const [hasSavedWorksheet, setHasSavedWorksheet] = useState(false);

  const handleGenerateWorksheet = async () => {
    if (!wsTopic.trim()) return;
    setIsGeneratingWorksheet(true);
    setHasSavedWorksheet(false);
    try {
      const ws = await generateStandaloneWorksheet(wsTopic, wsGrade, SUBJECTS[0], wsStyle, wsCount);
      setCurrentWorksheet(ws);
    } catch (e) { alert("Failed to generate worksheet."); } finally { setIsGeneratingWorksheet(false); }
  };

  const handleSaveWorksheet = async () => {
    if (!currentWorksheet || isSavingWorksheet) return;
    setIsSavingWorksheet(true);
    try {
      await onSaveLesson({
        id: generateId(), createdAt: new Date().toISOString(), topic: currentWorksheet.topic,
        gradeLevel: wsGrade, province: 'Ontario', subject: SUBJECTS[0], theme: 'classic', structure: 'standard',
        learningObjectives: [`Complete worksheet on ${currentWorksheet.topic}`],
        curriculumExpectations: 'Worksheet generated for practice.', slides: [], activities: [],
        worksheetMarkdown: currentWorksheet.studentMarkdown, answerSheetMarkdown: currentWorksheet.teacherMarkdown,
        quiz: [], isWorksheet: true 
      });
      setHasSavedWorksheet(true);
      setTimeout(() => setHasSavedWorksheet(false), 3000);
    } catch (error) { alert("Error saving."); } finally { setIsSavingWorksheet(false); }
  };

  // --- DAILY BOARD STATE & SAVING ---
  const [boardHeading, setBoardHeading] = useState('Welcome Class!');
  const [boardLearning, setBoardLearning] = useState('');
  const [boardReminders, setBoardReminders] = useState('');
  const [boardSchedule, setBoardSchedule] = useState('');
  const [isBoardFullscreen, setIsBoardFullscreen] = useState(false);
  const [isSavingBoard, setIsSavingBoard] = useState(false);
  const [hasSavedBoard, setHasSavedBoard] = useState(false);

  const handleSaveBoardToLibrary = async () => {
    setIsSavingBoard(true);
    try {
      const drawingData = canvasRef.current?.toDataURL();
      await onSaveLesson({
        id: generateId(),
        createdAt: new Date().toISOString(),
        topic: boardHeading || 'Daily Morning Board',
        gradeLevel: userProfile.role || 'All Grades',
        province: 'Ontario',
        subject: 'Morning Meeting',
        theme: 'classic',
        structure: 'standard',
        learningObjectives: ['Start the day with organized goals'],
        curriculumExpectations: 'Social Emotional Learning',
        slides: [],
        activities: [],
        quiz: [],
        isDailyBoard: true,
        boardData: {
          heading: boardHeading,
          learning: boardLearning,
          reminders: boardReminders,
          schedule: boardSchedule,
          drawingData: drawingData
        }
      });
      setHasSavedBoard(true);
      setTimeout(() => setHasSavedBoard(false), 3000);
    } catch (e) {
      alert("Failed to save board.");
    } finally {
      setIsSavingBoard(false);
    }
  };

  const handleOpenLibraryItem = (item: LessonPlan) => {
    if (item.isWorksheet) {
      setCurrentWorksheet({ topic: item.topic, style: 'standard', studentMarkdown: item.worksheetMarkdown || '', teacherMarkdown: item.answerSheetMarkdown || '' });
      setWsTopic(item.topic); setWsGrade(item.gradeLevel as GradeLevel); setActiveTab('worksheets');
    } else if (item.isDailyBoard && item.boardData) {
      setBoardHeading(item.boardData.heading);
      setBoardLearning(item.boardData.learning);
      setBoardReminders(item.boardData.reminders);
      setBoardSchedule(item.boardData.schedule);
      if (item.boardData.drawingData && canvasRef.current) {
         const img = new Image();
         img.onload = () => canvasRef.current?.getContext('2d')?.drawImage(img, 0, 0);
         img.src = item.boardData.drawingData;
      }
      setActiveTab('smartboard');
    } else {
      onLessonClick(item);
    }
  };

  // --- WEEKLY PLANNER STATE ---
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, WeeklyPlanSlot[]>>({ 'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [] });
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{day: string, slot?: WeeklyPlanSlot} | null>(null);
  const [planForm, setPlanForm] = useState<Partial<WeeklyPlanSlot>>({ subject: '', time: '', notes: '', color: '#3B82F6', presentationId: '', externalUrl: '' });

  useEffect(() => {
    const loadPlan = async () => {
      const saved = await getWeeklyPlan(userProfile.id);
      if (saved) {
        setWeeklyPlan(saved);
      } else {
        try {
          const local = localStorage.getItem('mapleprep_weekly_plan');
          if (local) setWeeklyPlan(JSON.parse(local));
        } catch (e) {}
      }
    };
    loadPlan();
  }, [userProfile.id]);

  useEffect(() => { 
    if (Object.values(weeklyPlan).some(day => (day as WeeklyPlanSlot[]).length > 0)) {
      saveWeeklyPlan(userProfile.id, weeklyPlan);
    }
  }, [weeklyPlan, userProfile.id]);

  const openAddPlan = (day: string) => { setEditingSlot({ day }); setPlanForm({ subject: '', time: '', notes: '', color: '#3B82F6', presentationId: '', externalUrl: '' }); setIsPlanModalOpen(true); };
  const openEditPlan = (day: string, slot: WeeklyPlanSlot) => { setEditingSlot({ day, slot }); setPlanForm({ ...slot }); setIsPlanModalOpen(true); };

  const handleSavePlan = () => {
    if (!editingSlot || !editingSlot.day) return;
    const subject = String(planForm.subject || '').trim();
    const time = String(planForm.time || '').trim();
    if (!subject || !time) { alert("Subject and Time are required."); return; }
    const day = editingSlot.day;
    const newSlot: WeeklyPlanSlot = { id: editingSlot.slot?.id || generateId(), day: day, subject: subject, time: time, notes: String(planForm.notes || '').trim(), color: planForm.color || '#3B82F6', presentationId: planForm.presentationId || '', externalUrl: String(planForm.externalUrl || '').trim() };
    setWeeklyPlan(prev => {
        const slots = [...(prev[day] || [])];
        const updated = editingSlot.slot ? slots.map(s => s.id === editingSlot.slot?.id ? newSlot : s) : [...slots, newSlot];
        updated.sort((a, b) => a.time.localeCompare(b.time, undefined, { numeric: true }));
        const res = { ...prev, [day]: updated };
        return res;
    });
    setIsPlanModalOpen(false); setEditingSlot(null);
  };

  const handleLaunchPlannerLesson = (e: React.MouseEvent, presentationId: string) => { e.stopPropagation(); const lesson = savedLessons.find(l => l.id === presentationId); if (lesson) onLessonClick(lesson); else alert("Lesson not found."); };
  const handleOpenPlannerUrl = (e: React.MouseEvent, url: string) => { e.stopPropagation(); let f = url.trim(); if (f && !f.startsWith('http')) f = 'https://' + f; window.open(f, '_blank'); };

  // --- MY CLASS & GROUPS STATE ---
  const [students, setStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    const loadStudents = async () => {
      const saved = await getUserSettings(userProfile.id, 'students');
      if (saved) setStudents(saved);
      else {
        try {
          const local = localStorage.getItem('mapleprep_students');
          if (local) setStudents(JSON.parse(local));
        } catch (e) {}
      }
    };
    loadStudents();
  }, [userProfile.id]);

  useEffect(() => {
    if (students.length > 0) {
      saveUserSettings(userProfile.id, 'students', students);
    }
  }, [students, userProfile.id]);
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault(); if (!newStudentName.trim()) return;
    setStudents([...students, { id: generateId(), name: newStudentName.trim(), grade: newStudentGrade }]);
    setNewStudentName('');
  };
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState(GRADES[0]);
  const removeStudent = (id: string) => { setStudents(students.filter(s => s.id !== id)); };

  const [groupMode, setGroupMode] = useState<'size' | 'count'>('size');
  const [groupSize, setGroupSize] = useState(3);
  const [numGroups, setNumGroups] = useState(4);
  const [groupGradeFilter, setGroupGradeFilter] = useState('All');
  const [generatedGroups, setGeneratedGroups] = useState<Student[][]>([]);

  const handleGenerateGroups = () => {
    let pool = students.filter(s => groupGradeFilter === 'All' || s.grade === groupGradeFilter);
    if (pool.length === 0) { alert("No students found."); return; }
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const groups: Student[][] = [];
    if (groupMode === 'size') {
      for (let i = 0; i < shuffled.length; i += groupSize) groups.push(shuffled.slice(i, i + groupSize));
    } else {
      const per = Math.ceil(shuffled.length / numGroups);
      for (let i = 0; i < numGroups; i++) {
        const p = shuffled.slice(i * per, (i + 1) * per);
        if (p.length > 0) groups.push(p);
      }
    }
    setGeneratedGroups(groups);
  };

  // --- WEB LINKS ---
  // --- WEB LINKS STATE ---
  const [bookmarks, setBookmarks] = useState<TeacherBookmark[]>([]);
  
  useEffect(() => {
    const loadBookmarks = async () => {
      const saved = await getUserSettings(userProfile.id, 'bookmarks');
      if (saved) setBookmarks(saved);
      else {
        try {
          const local = localStorage.getItem('mapleprep_bookmarks');
          if (local) setBookmarks(JSON.parse(local));
        } catch (e) {}
      }
    };
    loadBookmarks();
  }, [userProfile.id]);

  useEffect(() => {
    if (bookmarks.length > 0) {
      saveUserSettings(userProfile.id, 'bookmarks', bookmarks);
    }
  }, [bookmarks, userProfile.id]);
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault(); if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    let url = newLinkUrl.trim(); if (!url.startsWith('http')) url = 'https://' + url;
    setBookmarks([{ id: generateId(), title: newLinkTitle.trim(), url, dateAdded: new Date().toISOString() }, ...bookmarks]);
    setNewLinkTitle(''); setNewLinkUrl('');
  };
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const removeLink = (id: string) => { setBookmarks(bookmarks.filter(b => b.id !== id)); };

  // --- TOOLS STATE: STOPWATCH ---
  const [swTime, setSwTime] = useState(0); 
  const [swActive, setSwActive] = useState(false);
  const swRef = useRef<number | null>(null);
  useEffect(() => {
    if (swActive) swRef.current = window.setInterval(() => setSwTime(prev => prev + 10), 10);
    else if (swRef.current) clearInterval(swRef.current);
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swActive]);

  // --- TOOLS STATE: TIMER ---
  const [timerActive, setTimerActive] = useState(false);
  const [timerTime, setTimerTime] = useState(0); 
  const [tH, setTH] = useState(0); 
  const [tM, setTM] = useState(5); 
  const [tS, setTS] = useState(0);
  const timerRef = useRef<number | null>(null);

  const startTimer = () => {
    if (timerActive) { setTimerActive(false); return; }
    if (timerTime === 0) {
      const ms = (tH * 3600 + tM * 60 + tS) * 1000;
      if (ms <= 0) return;
      setTimerTime(ms); 
    }
    setTimerActive(true);
  };

  useEffect(() => {
    if (timerActive && timerTime > 0) {
      timerRef.current = window.setInterval(() => {
        setTimerTime(prev => prev <= 10 ? (setTimerActive(false), 0) : prev - 10);
      }, 10);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timerTime]);

  const formatTimerDisplay = (ms: number) => { 
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000); 
    const s = Math.floor((ms % 60000) / 1000); 
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatStopwatchDisplay = (ms: number) => {
    const m = Math.floor(ms / 60000); 
    const s = Math.floor((ms % 60000) / 1000); 
    const cs = Math.floor((ms % 1000) / 10); 
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  // --- FAIR PICKER ---
  const [pickerGradeFilter, setPickerGradeFilter] = useState('All');
  const [pickedStudent, setPickedStudent] = useState<Student | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const handlePickStudent = () => {
    let pool = students.filter(s => pickerGradeFilter === 'All' || s.grade === pickerGradeFilter);
    if (pool.length === 0) return;
    setIsPicking(true) ; setPickedStudent(null);
    let count = 0;
    const interval = setInterval(() => {
      setPickedStudent(pool[Math.floor(Math.random() * pool.length)]);
      count++; if (count > 15) { clearInterval(interval); setIsPicking(false); }
    }, 80);
  };

  // --- WORD SCRAMBLE STATE ---
  const [scrambleInput, setScrambleInput] = useState('');
  const [scrambledWords, setScrambledWords] = useState<{ original: string, scrambled: string }[]>([]);
  const [showScrambleAnswers, setShowScrambleAnswers] = useState(false);

  const handleScramble = () => {
    const words = scrambleInput.split(/[\n,]+/).map(w => w.trim()).filter(w => w.length > 0);
    const scrambled = words.map(word => {
      let s = word.split('');
      for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
      }
      if (s.join('') === word && word.length > 1) {
          [s[0], s[1]] = [s[1], s[0]];
      }
      return { original: word, scrambled: s.join('').toUpperCase() };
    });
    setScrambledWords(scrambled);
    setShowScrambleAnswers(false);
  };

  // --- FULLSCREEN ---
  const timerContainerRef = useRef<HTMLDivElement>(null);
  const stopwatchContainerRef = useRef<HTMLDivElement>(null);
  const pickerContainerRef = useRef<HTMLDivElement>(null);
  const scrambleContainerRef = useRef<HTMLDivElement>(null);
  const toggleFS = (ref: React.RefObject<HTMLDivElement>) => {
    if (!document.fullscreenElement) ref.current?.requestFullscreen().catch(e => console.error(e));
    else document.exitFullscreen();
  };

  // --- DAILY BOARD ---
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#EF4444');

  useEffect(() => {
    const loadBoard = async () => {
      const saved = await getUserSettings(userProfile.id, 'daily_board');
      if (saved) {
        setBoardHeading(saved.heading || 'Welcome Class!');
        setBoardLearning(saved.learning || '');
        setBoardReminders(saved.reminders || '');
        setBoardSchedule(saved.schedule || '');
      } else {
        const local = localStorage.getItem('mapleprep_daily_board');
        if (local) {
          const data = JSON.parse(local);
          setBoardHeading(data.heading || 'Welcome Class!');
          setBoardLearning(data.learning || '');
          setBoardReminders(data.reminders || '');
          setBoardSchedule(data.schedule || '');
        }
      }
    };
    loadBoard();
  }, [userProfile.id]);

  useEffect(() => {
    saveUserSettings(userProfile.id, 'daily_board', { 
      heading: boardHeading, 
      learning: boardLearning, 
      reminders: boardReminders, 
      schedule: boardSchedule 
    });
  }, [boardHeading, boardLearning, boardReminders, boardSchedule, userProfile.id]);

  useEffect(() => {
    if (activeTab === 'smartboard' && canvasRef.current) {
        const canvas = canvasRef.current;
        const resize = () => { const rect = canvas.parentElement?.getBoundingClientRect(); if (rect) { canvas.width = rect.width; canvas.height = rect.height; } };
        resize(); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize);
    }
  }, [activeTab, isBoardFullscreen]);

  const toggleBoardFullscreen = () => { if (!document.fullscreenElement) { boardRef.current?.requestFullscreen(); setIsBoardFullscreen(true); } else { document.exitFullscreen(); setIsBoardFullscreen(false); } };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
    setIsDrawing(true); const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.strokeStyle = color; ctx.lineWidth = isBoardFullscreen ? 8 : 4; ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); if (!ctx) return; const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
    ctx.lineTo(x, y); ctx.stroke();
  };

  const clearCanvas = () => { const canvas = canvasRef.current; if (canvas) { const ctx = canvas.getContext('2d'); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); } };

  const [checklist, setChecklist] = useState<{id: string, text: string, done: boolean}[]>([]);
  
  useEffect(() => {
    const loadChecklist = async () => {
      const saved = await getUserSettings(userProfile.id, 'checklist');
      if (saved) setChecklist(saved);
      else {
        try {
          const local = localStorage.getItem('mapleprep_checklist');
          if (local) setChecklist(JSON.parse(local));
          else setChecklist([{ id: '1', text: 'Photocopy Worksheets', done: false }, { id: '2', text: 'Set up Smart Board', done: false }]);
        } catch (e) {}
      }
    };
    loadChecklist();
  }, [userProfile.id]);

  useEffect(() => {
    if (checklist.length > 0) {
      saveUserSettings(userProfile.id, 'checklist', checklist);
    }
  }, [checklist, userProfile.id]);

  // --- DAILY ACTIVITY STATE ---
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [dailyStartTime, setDailyStartTime] = useState<string>('09:00');
  const [dailyScheduleTheme, setDailyScheduleTheme] = useState<string>('sunny');
  const dailyActivityRef = useRef<HTMLDivElement>(null);
  const [isSmartBoardMode, setIsSmartBoardMode] = useState(false);
  const smartBoardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsSmartBoardMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleSmartBoard = () => {
    if (!isSmartBoardMode) {
      if (smartBoardRef.current) {
        smartBoardRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
      setIsSmartBoardMode(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsSmartBoardMode(false);
    }
  };

  const DAILY_THEMES = [
    { id: 'sunny', name: 'Sunny', bg: 'bg-amber-50', card: 'bg-white', text: 'text-slate-900', accent: 'text-amber-600', border: 'border-amber-200', icon: '☀️' },
    { id: 'ocean', name: 'Ocean', bg: 'bg-blue-50', card: 'bg-white', text: 'text-slate-900', accent: 'text-blue-600', border: 'border-blue-200', icon: '🌊' },
    { id: 'forest', name: 'Forest', bg: 'bg-emerald-50', card: 'bg-white', text: 'text-slate-900', accent: 'text-emerald-600', border: 'border-emerald-200', icon: '🌲' },
    { id: 'chalkboard', name: 'Board', bg: 'bg-slate-800', card: 'bg-slate-900/50', text: 'text-white', accent: 'text-indigo-400', border: 'border-slate-700', icon: '📝' },
    { id: 'minimal', name: 'Clean', bg: 'bg-slate-50', card: 'bg-white', text: 'text-slate-900', accent: 'text-indigo-600', border: 'border-slate-200', icon: '⚪' },
  ];

  const currentTheme = DAILY_THEMES.find(t => t.id === dailyScheduleTheme) || DAILY_THEMES[0];

  useEffect(() => {
    const loadDailyActivities = async () => {
      const saved = await getUserSettings(userProfile.id, 'daily_activities');
      if (saved) setDailyActivities(saved);
      else {
        try {
          const local = localStorage.getItem('mapleprep_daily_activities');
          if (local) setDailyActivities(JSON.parse(local));
        } catch (e) {}
      }
      
      const savedTime = await getUserSettings(userProfile.id, 'daily_start_time');
      if (savedTime) setDailyStartTime(savedTime);

      const savedTheme = await getUserSettings(userProfile.id, 'daily_schedule_theme');
      if (savedTheme) setDailyScheduleTheme(savedTheme);
    };
    loadDailyActivities();
  }, [userProfile.id]);

  useEffect(() => {
    if (dailyActivities.length > 0) {
      saveUserSettings(userProfile.id, 'daily_activities', dailyActivities);
    }
  }, [dailyActivities, userProfile.id]);

  useEffect(() => {
    saveUserSettings(userProfile.id, 'daily_start_time', dailyStartTime);
  }, [dailyStartTime, userProfile.id]);

  useEffect(() => {
    saveUserSettings(userProfile.id, 'daily_schedule_theme', dailyScheduleTheme);
  }, [dailyScheduleTheme, userProfile.id]);

  const formatTimeTo12h = (time24: string) => {
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const getActivityTimeRange = (index: number) => {
    let currentMinutes = 0;
    const [hours, minutes] = dailyStartTime.split(':').map(Number);
    const startTotalMinutes = (hours * 60) + minutes;

    for (let i = 0; i < index; i++) {
      currentMinutes += dailyActivities[i].duration;
    }

    const startTime = startTotalMinutes + currentMinutes;
    const endTime = startTime + dailyActivities[index].duration;

    const formatMinutes = (totalMinutes: number) => {
      const h = Math.floor((totalMinutes % 1440) / 60);
      const m = totalMinutes % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    return `${formatMinutes(startTime)} - ${formatMinutes(endTime)}`;
  };

  const addDailyActivity = (type: 'activity' | 'break') => {
    const newActivity: DailyActivity = {
      id: generateId(),
      type,
      name: '',
      duration: type === 'break' ? 15 : 60
    };
    setDailyActivities([...dailyActivities, newActivity]);
  };

  const updateDailyActivity = (id: string, updates: Partial<DailyActivity>) => {
    setDailyActivities(dailyActivities.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const removeDailyActivity = (id: string) => {
    setDailyActivities(dailyActivities.filter(a => a.id !== id));
  };

  const moveActivity = (index: number, direction: 'up' | 'down') => {
    const newActivities = [...dailyActivities];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newActivities.length) return;
    [newActivities[index], newActivities[targetIndex]] = [newActivities[targetIndex], newActivities[index]];
    setDailyActivities(newActivities);
  };

  const filteredLessons = savedLessons.filter(l => (l.topic?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (l.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()));

  // Subscription Status Component
   const SubscriptionBadge = () => {
    const sub = userProfile.subscription;
    
    // Check Stripe status explicitly
    const isTrial = sub && (sub.status === 'trial' || sub.status === 'trialing');
    const isActive = sub && (sub.status === 'active');
    
    // No sub and not in an active trial redirect flow
    if (!sub || (!isActive && !isTrial)) return (
      <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 shadow-sm flex items-center gap-1.5">
        <AlertCircle className="w-3 h-3" /> Upgrade for Trial
      </div>
    );

    const used = sub.imagesUsedThisMonth || 0;
    const limit = sub.imageLimit || 50;
    const percent = Math.min(100, (used / limit) * 100);

    return (
      <div className="flex items-center gap-3">
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 shadow-sm ${
          isActive ? 'bg-green-50 text-green-700 border-green-200' : 
          'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
          {isActive ? <Crown className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {sub.planId} {isTrial ? '(Trial)' : '(Active)'}
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
          <ImageIcon className="w-3 h-3 text-slate-400" />
          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${percent}%` }}></div>
          </div>
          <span className="text-[9px] font-black text-slate-500">{limit - used} Left</span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* SMART BOARD MODE OVERLAY */}
      {isSmartBoardMode && (
        <div ref={smartBoardRef} className={`fixed inset-0 z-[9999] flex flex-col p-12 overflow-hidden transition-colors duration-500 ${currentTheme.bg}`}>
           <div className="flex justify-between items-center mb-6">
              <h1 className={`text-3xl font-black tracking-tight ${currentTheme.text}`}>Today's Schedule</h1>
              <button 
                onClick={toggleSmartBoard}
                className="px-5 py-2.5 bg-red-600 text-white rounded-2xl shadow-xl hover:bg-red-700 transition-all active:scale-95 flex items-center gap-2 font-black uppercase tracking-widest text-xs"
              >
                <Minimize2 className="w-4 h-4" /> Exit Board
              </button>
           </div>

           <div className={`flex-1 flex flex-col justify-center overflow-hidden ${dailyActivities.length > 6 ? 'gap-2' : 'gap-4'}`}>
              {dailyActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`flex items-center gap-6 rounded-[2rem] border-4 transition-all shadow-lg flex-1 min-h-0 ${currentTheme.card} ${currentTheme.border} ${dailyActivities.length > 8 ? 'p-3' : 'p-5'}`}
                >
                   <div className={`${dailyActivities.length > 8 ? 'w-10 h-10' : 'w-14 h-14'} rounded-xl flex items-center justify-center shrink-0 shadow-lg ${activity.type === 'break' ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'}`}>
                      {activity.type === 'break' ? <Coffee className="w-6 h-6" /> : <ActivityIcon className="w-6 h-6" />}
                   </div>
                   <div className="flex-1 flex justify-between items-center">
                      <h3 className={`${dailyActivities.length > 8 ? 'text-xl' : 'text-3xl'} font-black truncate pr-4 ${currentTheme.text}`}>{activity.name || (activity.type === 'break' ? 'Break' : 'Activity')}</h3>
                      <div className="flex items-center gap-4 shrink-0">
                         <div className={`px-5 py-1.5 rounded-xl font-black border shadow-sm ${currentTheme.bg} ${currentTheme.accent} ${currentTheme.border} ${dailyActivities.length > 8 ? 'text-lg' : 'text-xl'}`}>
                            {getActivityTimeRange(index)}
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn ${activeTab === 'smartboard' ? 'h-[calc(100vh-100px)]' : ''}`}>
        {/* Header */}
        {!isBoardFullscreen && !isSmartBoardMode && (
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">Teacher Dashboard</h1>
               <div className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase border border-green-200 shadow-sm flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Toronto Server 🇨🇦
               </div>
               <SubscriptionBadge />
            </div>
            <p className="text-slate-500 font-medium tracking-tight">MaplePrep Hub • {userProfile.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleResetPassword} 
              disabled={isResettingPassword}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {isResettingPassword ? 'Sending...' : 'Reset Password'}
            </button>
          </div>
          <div className="flex bg-slate-200/50 p-1 rounded-2xl overflow-x-auto no-scrollbar border shadow-inner">
               {(['overview', 'planner', 'worksheets', 'students', 'groups', 'tools', 'links', 'smartboard', 'daily_activity'] as const).map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap capitalize transition-all tracking-widest ${activeTab === tab ? 'bg-white text-red-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-800'}`}>
                 {tab === 'smartboard' ? 'Daily Board' : tab === 'students' ? 'My Class' : tab === 'planner' ? 'Weekly Planner' : tab === 'worksheets' ? 'Worksheet Maker' : tab === 'links' ? 'Web Links' : tab === 'daily_activity' ? 'Daily Activity' : tab}
               </button>
             ))}
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <button onClick={onCreateClick} className="bg-red-600 text-white p-8 rounded-3xl shadow-2xl hover:bg-red-700 transition-all text-left group">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Plus className="w-7 h-7" /></div>
                <h3 className="font-black text-xl mb-1">New Lesson</h3>
                <p className="text-red-100 text-xs font-bold uppercase tracking-wider">AI Generator</p>
              </button>
              <button onClick={() => setActiveTab('worksheets')} className="bg-white border-2 border-slate-100 p-8 rounded-3xl hover:border-purple-500 transition-all text-left shadow-xl">
                <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-purple-600"><FileText className="w-7 h-7" /></div>
                <h3 className="font-black text-xl mb-1 text-slate-900">Worksheets</h3>
              </button>
              <button onClick={() => setActiveTab('smartboard')} className="bg-white border-2 border-slate-100 p-8 rounded-3xl hover:border-emerald-500 transition-all text-left shadow-xl">
                <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-emerald-600"><Monitor className="w-7 h-7" /></div>
                <h3 className="font-black text-xl mb-1 text-slate-900">Daily Board</h3>
              </button>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                 <h2 className="text-xl font-black flex items-center gap-3"><BookOpen className="w-6 h-6 text-red-600" /> My Library</h2>
                 <div className="relative flex-1 max-w-xs ml-4">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input type="text" placeholder="Search..." className="w-full pl-10 pr-6 py-2.5 border-2 border-slate-100 rounded-2xl text-sm outline-none bg-white focus:border-red-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                 </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8">
                {filteredLessons.map((item) => (
                  <div key={item.id} className="group bg-slate-50 rounded-3xl border border-slate-200 hover:border-red-400 transition-all overflow-hidden flex flex-col shadow-sm">
                    <div className="p-6 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                         <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${item.isWorksheet ? 'bg-purple-50 text-purple-600 border-purple-100' : item.isDailyBoard ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{item.isWorksheet ? 'Worksheet' : item.isDailyBoard ? 'Board' : 'Lesson'}</span>
                         {item.topic && !item.topic.includes(item.gradeLevel) && (
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.gradeLevel}</span>
                         )}
                      </div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight truncate group-hover:text-red-700" title={item.topic}>{item.topic || 'Untitled Lesson'}</h3>
                      {item.topic && !item.topic.includes(item.subject) && (
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{item.subject}</p>
                      )}
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                      <Button variant="primary" className="flex-1 py-3 text-xs font-black uppercase" onClick={() => handleOpenLibraryItem(item)}>{item.isWorksheet ? <FileText className="w-4 h-4 mr-2" /> : item.isDailyBoard ? <Monitor className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}{item.isWorksheet ? 'Open Handout' : item.isDailyBoard ? 'Load Board' : 'Launch'}</Button>
                      <button onClick={() => onDeleteLesson(item.id)} className="p-3 text-slate-300 hover:text-red-600 transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
            <div className="space-y-8">
               {userProfile.subscription && (
                 <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-red-600 relative z-10"><ImageIcon className="w-6 h-6" /> Image Report</h2>
                    <div className="space-y-6 relative z-10">
                       <div>
                          <div className="flex justify-between items-end mb-2">
                             <span className="text-sm font-bold text-slate-600">Monthly Allowance</span>
                             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{(userProfile.subscription.imagesUsedThisMonth || 0)} / {userProfile.subscription.imageLimit || 50}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                             <div 
                               className={`h-full rounded-full transition-all duration-1000 ${
                                 ((userProfile.subscription.imagesUsedThisMonth || 0) / (userProfile.subscription.imageLimit || 50)) > 0.9 ? 'bg-red-500' : 
                                 ((userProfile.subscription.imagesUsedThisMonth || 0) / (userProfile.subscription.imageLimit || 50)) > 0.7 ? 'bg-amber-500' : 'bg-green-500'
                               }`} 
                               style={{ width: `${Math.min(100, ((userProfile.subscription.imagesUsedThisMonth || 0) / (userProfile.subscription.imageLimit || 50)) * 100)}%` }}
                             ></div>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                             <p className="text-2xl font-black text-slate-900">{(userProfile.subscription.imageLimit || 50) - (userProfile.subscription.imagesUsedThisMonth || 0)}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reset Date</p>
                             <p className="text-sm font-bold text-slate-900">
                                {userProfile.subscription.nextBillingDate ? new Date(userProfile.subscription.nextBillingDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : 'Next Month'}
                             </p>
                          </div>
                       </div>
                       <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                          * Your image allowance resets every billing cycle. High-quality AI generations are optimized for Canadian curriculum standards.
                       </p>
                    </div>
                 </div>
               )}
               <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl">
               <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-emerald-600"><CheckSquare className="w-6 h-6" /> Morning Prep</h2>
               <div className="space-y-4">
                  {checklist.map(item => (
                    <button key={item.id} onClick={() => setChecklist(prev => prev.map(i => i.id === item.id ? {...i, done: !i.done} : i))} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${item.done ? 'bg-emerald-50 border-transparent text-emerald-400' : 'bg-white border-slate-100 text-slate-700'}`}>
                      {item.done ? <CheckSquare className="w-6 h-6 text-emerald-500" /> : <Square className="w-6 h-6 text-slate-200" />}
                      <span className={`text-sm font-black ${item.done ? 'line-through' : ''}`}>{item.text}</span>
                    </button>
                  ))}
               </div>
             </div>
          </div>
        </div>
      )}

      {/* PLANNER TAB */}
      {activeTab === 'planner' && (
        <div className="animate-fadeIn space-y-6">
           <div className="bg-white p-8 rounded-[2rem] border shadow-xl flex justify-between items-center">
              <h2 className="text-2xl font-black">Weekly Timetable</h2>
              <button onClick={() => { if(confirm("Clear timetable?")) setWeeklyPlan({'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': []}) }} className="px-4 py-2 text-xs font-black uppercase text-slate-400 hover:text-red-600">Clear All</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {DAYS.map(day => (
                <div key={day} className="space-y-4">
                   <div className="bg-slate-900 text-white p-3 rounded-xl text-center text-xs font-black uppercase tracking-widest">{day}</div>
                   <div className="space-y-3">
                      {weeklyPlan[day]?.map(slot => (
                        <div key={slot.id} onClick={() => openEditPlan(day, slot)} className="bg-white p-4 rounded-xl border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-all group relative" style={{ borderLeftColor: slot.color }}>
                           <p className="text-[10px] font-black text-slate-400 mb-1">{slot.time}</p>
                           <h4 className="font-bold text-slate-800 text-sm truncate">{slot.subject}</h4>
                           <div className="mt-3 flex gap-2">
                             {slot.presentationId && <button onClick={(e) => handleLaunchPlannerLesson(e, slot.presentationId!)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Play className="w-4 h-4"/></button>}
                             {slot.externalUrl && <button onClick={(e) => handleOpenPlannerUrl(e, slot.externalUrl!)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Globe className="w-4 h-4"/></button>}
                           </div>
                        </div>
                      ))}
                      <button onClick={() => openAddPlan(day)} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-300 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center"><Plus className="w-4 h-4"/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* WORKSHEETS TAB */}
      {activeTab === 'worksheets' && (
        <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border shadow-xl">
                 <h2 className="text-xl font-black mb-6 flex items-center gap-3"><FileText className="w-6 h-6 text-purple-600" /> Maker</h2>
                 <div className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topic</label>
                      <input type="text" placeholder="e.g. Solar System" className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:border-purple-500 font-bold" value={wsTopic} onChange={e => setWsTopic(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                      <select className="w-full p-4 bg-slate-50 border rounded-xl font-bold" value={wsGrade} onChange={e => setWsGrade(e.target.value as GradeLevel)}>
                         {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Style</label>
                       <div className="grid grid-cols-2 gap-2">
                          {(['standard', 'vocabulary', 'math_drill', 'mcq'] as WorksheetStyle[]).map(s => (
                            <button key={s} onClick={() => setWsStyle(s)} className={`p-3 rounded-xl border text-xs font-bold transition-all ${wsStyle === s ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white hover:bg-slate-50'}`}>
                              {s.replace('_', ' ')}
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions: {wsCount}</label>
                       <input type="range" min="5" max="50" step="5" className="w-full accent-purple-600" value={wsCount} onChange={e => setWsCount(parseInt(e.target.value))} />
                    </div>
                    <Button onClick={handleGenerateWorksheet} isLoading={isGeneratingWorksheet} className="w-full py-4 font-black">Generate Handout</Button>
                 </div>
              </div>
           </div>
           <div className="lg:col-span-2 space-y-6">
              {currentWorksheet ? (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm print:hidden">
                       <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button onClick={() => setWorksheetView('student')} className={`px-4 py-2 rounded-lg text-xs font-black ${worksheetView === 'student' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500'}`}>Student</button>
                          <button onClick={() => setWorksheetView('teacher')} className={`px-4 py-2 rounded-lg text-xs font-black ${worksheetView === 'teacher' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}>Key</button>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black uppercase flex items-center gap-2"><Printer className="w-4 h-4"/> Print / PDF</button>
                          <button onClick={handleSaveWorksheet} disabled={isSavingWorksheet} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-lg"><Save className="w-4 h-4"/> {hasSavedWorksheet ? 'Saved!' : 'Save'}</button>
                       </div>
                    </div>
                    <div id="printable-worksheet" className="bg-white p-12 sm:p-20 rounded shadow-2xl border border-slate-100 print:shadow-none print:border-none min-h-[1100px] relative overflow-hidden">
                       <div className="print:hidden border-b-2 border-slate-100 pb-8 mb-12 flex justify-between items-end">
                          <div>
                             <h3 className="text-2xl font-black text-slate-900 m-0 uppercase tracking-tight">{currentWorksheet.topic}</h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Classroom Handout</p>
                          </div>
                          {worksheetView === 'teacher' && <span className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-black uppercase shadow-sm">Answer Key</span>}
                       </div>
                       <WorksheetRenderer markdown={worksheetView === 'student' ? currentWorksheet.studentMarkdown : currentWorksheet.teacherMarkdown} isTeacher={worksheetView === 'teacher'} />
                    </div>
                 </div>
              ) : (
                 <div className="h-full min-h-[400px] bg-white rounded-[2rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-4">
                    <FileText className="w-16 h-16 opacity-20" />
                    <p className="font-black uppercase tracking-widest">Worksheet Preview Area</p>
                 </div>
              )}
           </div>
        </div>
      )}

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[2rem] border shadow-xl">
                 <h2 className="text-xl font-black mb-6">Add Student</h2>
                 <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
                      <input type="text" placeholder="Sarah Jenkins" className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:border-red-500 font-bold transition-all" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Grade</label>
                      <select className="w-full p-4 bg-slate-50 border rounded-xl outline-none font-bold" value={newStudentGrade} onChange={e => setNewStudentGrade(e.target.value as GradeLevel)}>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <Button type="submit" className="w-full py-4">Add to Roster</Button>
                 </form>
              </div>
           </div>
           <div className="lg:col-span-2 bg-white rounded-[2rem] border shadow-xl overflow-hidden">
              <div className="p-8 border-b font-black flex justify-between items-center bg-slate-50/50">
                 <span>Class Roster</span>
                 <span className="text-xs bg-white px-3 py-1 rounded-full border shadow-sm">{students.length} Students</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-8">
                 {students.map(s => (
                   <div key={s.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border group hover:border-red-200 transition-all">
                      <div>
                        <span className="font-bold text-slate-800">{s.name}</span>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{s.grade}</p>
                      </div>
                      <button onClick={() => removeStudent(s.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                   </div>
                 ))}
                 {students.length === 0 && <div className="col-span-full py-12 text-center text-slate-300 italic font-medium">No students added to this class yet.</div>}
              </div>
           </div>
        </div>
      )}

      {/* GROUPS TAB */}
      {activeTab === 'groups' && (
        <div className="animate-fadeIn space-y-6">
           <div className="bg-white p-8 rounded-[2rem] border shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Mode</label>
                 <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={groupMode} onChange={e => setGroupMode(e.target.value as any)}>
                    <option value="size">By Group Size</option>
                    <option value="count">By Total Groups</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase">{groupMode === 'size' ? 'Students Per Group' : 'Total Groups'}</label>
                 <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={groupMode === 'size' ? groupSize : numGroups} onChange={e => groupMode === 'size' ? setGroupSize(parseInt(e.target.value)) : setNumGroups(parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Grade Filter</label>
                 <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={groupGradeFilter} onChange={e => setGroupGradeFilter(e.target.value)}>
                    <option value="All">All Grades</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                 </select>
              </div>
              <div className="flex items-end">
                 <Button onClick={handleGenerateGroups} className="w-full py-3.5 shadow-md"><Shuffle className="w-4 h-4 mr-2"/> Randomize Groups</Button>
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedGroups.map((group, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border shadow-md relative overflow-hidden animate-slideUp" style={{ animationDelay: `${i * 0.05}s` }}>
                   <div className="absolute top-0 right-0 w-8 h-8 bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600 rounded-bl-xl">{i+1}</div>
                   <h3 className="text-xs font-black text-blue-600 uppercase mb-4 tracking-widest">Group {i + 1}</h3>
                   <ul className="space-y-2">
                      {group.map(s => <li key={s.id} className="text-sm font-bold text-slate-700 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> {s.name}</li>)}
                   </ul>
                </div>
              ))}
              {generatedGroups.length === 0 && students.length > 0 && <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest">Click "Randomize" to generate breakout groups.</div>}
           </div>
        </div>
      )}

      {/* WEB LINKS TAB */}
      {activeTab === 'links' && (
        <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[2rem] border shadow-xl">
                 <h2 className="text-xl font-black mb-6 flex items-center gap-3"><Globe className="w-6 h-6 text-blue-600" /> Save Link</h2>
                 <form onSubmit={handleAddLink} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Link Title</label>
                      <input type="text" placeholder="e.g. Science Simulation" className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-bold" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">URL</label>
                      <input type="text" placeholder="https://..." className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-bold" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full py-4 shadow-lg"><Plus className="w-4 h-4 mr-2"/> Add to Collection</Button>
                 </form>
              </div>
           </div>
           <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {bookmarks.map(link => (
                   <div key={link.id} className="bg-white p-5 rounded-2xl border shadow-sm group hover:shadow-md transition-all flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                         <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm"><Globe className="w-5 h-5"/></div>
                         <button onClick={() => removeLink(link.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                      </div>
                      <div>
                         <h3 className="font-black text-slate-900 mb-1 truncate">{link.title}</h3>
                         <p className="text-[10px] text-slate-400 truncate mb-4">{link.url}</p>
                         <a href={link.url} target="_blank" rel="noopener noreferrer" className="w-full py-2 bg-slate-50 border rounded-xl flex items-center justify-center gap-2 text-xs font-black text-slate-600 transition-all hover:bg-slate-100">
                            Visit Site <ExternalLink className="w-3 h-3"/>
                         </a>
                      </div>
                   </div>
                 ))}
                 {bookmarks.length === 0 && (
                   <div className="col-span-full py-24 bg-white rounded-[2rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                      <Globe className="w-16 h-16 mb-4 opacity-20" />
                      <p className="font-black uppercase tracking-widest">No links saved yet.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* TOOLS TAB */}
      {activeTab === 'tools' && (
        <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div ref={timerContainerRef} className="bg-white p-10 rounded-[2.5rem] border shadow-xl flex flex-col items-center relative group/tool min-h-[500px]">
              <button onClick={() => toggleFS(timerContainerRef)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl opacity-100 transition-opacity" title="Toggle Fullscreen">
                <Maximize2 className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 fullscreen-hide"><Timer className="w-8 h-8" /></div>
              <h2 className="text-2xl font-black mb-6 fullscreen-hide text-slate-800">Class Timer</h2>
              {(timerTime > 0 || timerActive) && (
                <div className="flex flex-col items-center justify-center w-full flex-1">
                  <div className="massive-tool-text timer-red">{formatTimerDisplay(timerTime)}</div>
                  <div className="fullscreen-controls">
                    <Button onClick={startTimer} variant={timerActive ? 'secondary' : 'primary'} className="min-w-[180px]">{timerActive ? 'Pause' : 'Resume'}</Button>
                    <button onClick={() => { setTimerTime(0); setTimerActive(false); }} className="p-4 bg-slate-800 text-white rounded-2xl hover:bg-red-600 transition-colors" title="Reset"><RefreshCcw className="w-8 h-8" /></button>
                  </div>
                </div>
              )}
              {!timerActive && timerTime === 0 && (
                 <div className="w-full flex-1 flex flex-col items-center justify-center">
                    <div className="timer-setter-grid mb-10">
                       <div className="setter-col"><span className="setter-label">Hours</span><button onClick={() => setTH(h => Math.min(99, h + 1))} className="setter-btn"><ChevronUp className="w-8 h-8 md:w-12 md:h-12"/></button><div className="setter-val">{tH.toString().padStart(2, '0')}</div><button onClick={() => setTH(h => Math.max(0, h - 1))} className="setter-btn"><ChevronDownIcon className="w-8 h-8 md:w-12 md:h-12"/></button></div>
                       <div className="setter-col"><span className="setter-label">Minutes</span><button onClick={() => setTM(m => Math.min(59, m + 1))} className="setter-btn"><ChevronUp className="w-8 h-8 md:w-12 md:h-12"/></button><div className="setter-val">{tM.toString().padStart(2, '0')}</div><button onClick={() => setTM(m => Math.max(0, m - 1))} className="setter-btn"><ChevronDownIcon className="w-8 h-8 md:w-12 md:h-12"/></button></div>
                       <div className="setter-col"><span className="setter-label">Seconds</span><button onClick={() => setTS(s => Math.min(59, s + 1))} className="setter-btn"><ChevronUp className="w-8 h-8 md:w-12 md:h-12"/></button><div className="setter-val">{tS.toString().padStart(2, '0')}</div><button onClick={() => setTS(s => Math.max(0, s - 1))} className="setter-btn"><ChevronDownIcon className="w-8 h-8 md:w-12 md:h-12"/></button></div>
                    </div>
                    <button onClick={startTimer} className="fs-start-btn py-6 px-12 rounded-[2rem] font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl transition-all hover:scale-105 active:scale-95 bg-red-600 text-white"><PlayCircle className="w-8 h-8 md:w-10 md:h-10" />Start Countdown</button>
                 </div>
              )}
           </div>

           <div ref={stopwatchContainerRef} className="bg-white p-10 rounded-[2.5rem] border shadow-xl flex flex-col items-center justify-center relative group/tool min-h-[500px]">
              <button onClick={() => toggleFS(stopwatchContainerRef)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl opacity-100 transition-opacity" title="Toggle Fullscreen"><Maximize2 className="w-5 h-5" /></button>
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 fullscreen-hide"><Clock className="w-8 h-8" /></div>
              <h2 className="text-2xl font-black mb-6 fullscreen-hide text-slate-800">Precision Stopwatch</h2>
              <div className="massive-tool-text sw-blue">{formatStopwatchDisplay(swTime)}</div>
              <div className="fullscreen-controls"><Button onClick={() => setSwActive(!swActive)} variant={swActive ? 'secondary' : 'primary'} className="min-w-[180px]">{swActive ? 'Pause' : (swTime > 0 ? 'Resume' : 'Start')}</Button><button onClick={() => { setSwTime(0); setSwActive(false); }} className="p-4 bg-slate-800 text-white rounded-2xl hover:bg-blue-600 transition-colors" title="Reset"><RefreshCcw className="w-8 h-8" /></button></div>
           </div>

           <div ref={pickerContainerRef} className="bg-white p-10 rounded-[2.5rem] border shadow-xl flex flex-col items-center justify-center relative group/tool min-h-[500px]">
              <button onClick={() => toggleFS(pickerContainerRef)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl opacity-100 transition-opacity" title="Toggle Fullscreen"><Maximize2 className="w-5 h-5" /></button>
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 fullscreen-hide"><Users className="w-8 h-8" /></div>
              <h2 className="text-2xl font-black mb-6 fullscreen-hide text-slate-800">Student Picker</h2>
              
              <div className="w-full max-w-xs mb-8 fullscreen-hide">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-center">Filter by Grade</label>
                <select 
                  className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-center" 
                  value={pickerGradeFilter} 
                  onChange={e => setPickerGradeFilter(e.target.value)}
                >
                  <option value="All">All Students</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className={`massive-tool-text ${isPicking ? 'animate-pulse text-slate-300' : 'text-emerald-600'}`}>
                  {pickedStudent ? pickedStudent.name : '???'}
                </div>
                
                <div className="mt-10">
                  <Button 
                    onClick={handlePickStudent} 
                    disabled={isPicking}
                    className="min-w-[240px] py-6 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-xl"
                  >
                    {isPicking ? 'Picking...' : 'Pick a Student'}
                  </Button>
                </div>
              </div>
           </div>

           <div ref={scrambleContainerRef} className="bg-white p-10 rounded-[2.5rem] border shadow-xl flex flex-col items-center relative group/tool min-h-[500px]">
              <button onClick={() => toggleFS(scrambleContainerRef)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-purple-600 rounded-xl opacity-100 transition-opacity" title="Toggle Fullscreen"><Maximize2 className="w-5 h-5" /></button>
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 fullscreen-hide"><Type className="w-8 h-8" /></div>
              <h2 className="text-2xl font-black mb-6 fullscreen-hide text-slate-800">Word Scramble</h2>
              
              {scrambledWords.length === 0 ? (
                <div className="w-full max-w-md space-y-4 flex-1 flex flex-col justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Enter words (comma or newline separated)</p>
                  <textarea 
                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-lg outline-none focus:border-purple-500 min-h-[150px]"
                    placeholder="Apple, Banana, Cherry..."
                    value={scrambleInput}
                    onChange={e => setScrambleInput(e.target.value)}
                  />
                  <Button onClick={handleScramble} className="w-full py-4 rounded-2xl">Scramble Words</Button>
                </div>
              ) : (
                <div className="w-full flex-1 flex flex-col items-center justify-center overflow-y-auto no-scrollbar py-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                    {scrambledWords.map((item, i) => (
                      <div key={i} className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 flex flex-col items-center justify-center gap-2">
                        <span className="text-3xl font-black text-purple-600 tracking-[0.2em]">{item.scrambled}</span>
                        {showScrambleAnswers && <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{item.original}</span>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-12 flex gap-4">
                    <Button variant="secondary" onClick={() => setShowScrambleAnswers(!showScrambleAnswers)}>{showScrambleAnswers ? 'Hide Answers' : 'Show Answers'}</Button>
                    <Button variant="primary" onClick={() => setScrambledWords([])}>New List</Button>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* DAILY BOARD TAB */}
      {activeTab === 'smartboard' && (
        <div ref={boardRef} className={`animate-fadeIn flex flex-col h-full bg-slate-50 transition-all duration-500 ${isBoardFullscreen ? 'fixed inset-0 z-[1000] p-10 bg-slate-900' : 'space-y-6'}`}>
           <div className={`p-8 rounded-[2.5rem] shadow-2xl flex justify-between items-center shrink-0 border-4 ${isBoardFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
              <div className="flex-1"><input type="text" value={boardHeading} onChange={e => setBoardHeading(e.target.value)} className={`text-6xl font-black bg-transparent border-none outline-none focus:ring-0 w-full tracking-tight ${isBoardFullscreen ? 'text-white' : 'text-slate-900'}`} placeholder="Enter Heading..." /></div>
              <div className="flex items-center gap-6 pl-12 shrink-0">
                 <div className="flex flex-col items-end">
                    <div className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] font-mono font-black text-5xl tracking-[0.1em] shadow-inner ${isBoardFullscreen ? 'bg-slate-900 text-red-500 shadow-black' : 'bg-slate-100 text-slate-900 shadow-slate-200'}`}><Clock className="w-10 h-10" />{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={handleSaveBoardToLibrary} 
                      disabled={isSavingBoard}
                      className={`p-5 rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center gap-2 ${hasSavedBoard ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}
                      title="Save board to library"
                    >
                      {isSavingBoard ? <Loader2 className="w-8 h-8 animate-spin" /> : hasSavedBoard ? <Check className="w-8 h-8" /> : <Save className="w-8 h-8" />}
                    </button>
                    <button onClick={toggleBoardFullscreen} className={`p-5 rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95 ${isBoardFullscreen ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>{isBoardFullscreen ? <Minimize className="w-8 h-8" /> : <Maximize className="w-8 h-8" />}</button>
                 </div>
              </div>
           </div>
           <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-8 min-h-0 pt-4">
              <div className={`p-8 rounded-[3rem] shadow-2xl border-4 flex flex-col group relative overflow-hidden ${isBoardFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}><h2 className={`text-2xl font-black mb-6 flex items-center gap-4 ${isBoardFullscreen ? 'text-blue-400' : 'text-blue-600'}`}><Lightbulb className="w-8 h-8" /> Today's Learning Goal</h2><textarea className={`flex-1 w-full p-8 rounded-[2rem] outline-none text-4xl font-serif italic resize-none shadow-inner transition-all ${isBoardFullscreen ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-700 border-slate-100'}`} value={boardLearning} onChange={e => setBoardLearning(e.target.value)} placeholder="Today we will discover..." /></div>
              <div className={`p-8 rounded-[3rem] shadow-2xl border-4 flex flex-col group relative overflow-hidden ${isBoardFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}><h2 className={`text-2xl font-black mb-6 flex items-center gap-4 ${isBoardFullscreen ? 'text-amber-400' : 'text-amber-600'}`}><Bell className="w-8 h-8" /> Reminders</h2><textarea className={`flex-1 w-full p-8 rounded-[2rem] outline-none text-4xl font-hand resize-none shadow-inner transition-all ${isBoardFullscreen ? 'bg-slate-900 text-amber-100 border-slate-700' : 'bg-slate-50 text-amber-900 border-slate-100'}`} value={boardReminders} onChange={e => setBoardReminders(e.target.value)} placeholder="Don't forget library books..." /></div>
              <div className={`p-8 rounded-[3rem] shadow-2xl border-4 flex flex-col group relative overflow-hidden ${isBoardFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}><h2 className={`text-2xl font-black mb-6 flex items-center gap-4 ${isBoardFullscreen ? 'text-emerald-400' : 'text-emerald-600'}`}><Calendar className="w-8 h-8" /> Daily Schedule</h2><textarea className={`flex-1 w-full p-8 rounded-[2rem] outline-none text-3xl font-black resize-none shadow-inner transition-all leading-loose ${isBoardFullscreen ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-800 border-slate-100'}`} value={boardSchedule} onChange={e => setBoardSchedule(e.target.value)} placeholder="9:00 AM Entry..." /></div>
              <div className={`p-8 rounded-[3rem] shadow-2xl border-4 flex flex-col group relative overflow-hidden ${isBoardFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}><div className="flex justify-between items-center mb-6"><h2 className={`text-2xl font-black flex items-center gap-4 ${isBoardFullscreen ? 'text-red-400' : 'text-red-600'}`}><Pen className="w-8 h-8" /> Brainstorming</h2><div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-100 shadow-inner">{['#EF4444', '#3B82F6', '#10B981', '#111827'].map(c => <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'scale-125 border-slate-400 shadow-lg' : 'opacity-60'}`} style={{ backgroundColor: c }} />)}<button onClick={clearCanvas} className="p-3 bg-white rounded-xl shadow-sm"><Eraser className="w-5 h-5 text-slate-400" /></button></div></div><div className={`flex-1 rounded-[2rem] border-4 border-dashed cursor-crosshair relative shadow-inner overflow-hidden ${isBoardFullscreen ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}><canvas ref={canvasRef} className="absolute inset-0 w-full h-full" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)} /></div></div>
           </div>
        </div>
      )}

      {/* DAILY ACTIVITY TAB */}
      {activeTab === 'daily_activity' && (
        <div className="animate-fadeIn max-w-[1600px] mx-auto h-[calc(100vh-180px)] flex flex-col">
           <div className="flex-1 flex gap-8 min-h-0">
              {/* LEFT COLUMN: EDITOR */}
              <div className="w-[450px] flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar">
                 <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl space-y-6">
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 mb-4">Schedule Settings</h2>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <span className="text-slate-500 font-bold">Start Time</span>
                             <div className="relative group">
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-slate-100 shadow-sm group-hover:border-indigo-300 transition-all">
                                  <span className="text-indigo-600 font-black">{formatTimeTo12h(dailyStartTime)}</span>
                                  <Clock className="w-4 h-4 text-indigo-400" />
                                </div>
                                <input 
                                  type="time" 
                                  value={dailyStartTime} 
                                  onChange={(e) => setDailyStartTime(e.target.value)}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                             </div>
                          </div>

                          <div className="space-y-2">
                             <span className="text-slate-500 font-bold text-sm ml-1">Background Style</span>
                             <div className="grid grid-cols-5 gap-2">
                                {DAILY_THEMES.map(theme => (
                                  <button
                                    key={theme.id}
                                    onClick={() => setDailyScheduleTheme(theme.id)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${dailyScheduleTheme === theme.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                                  >
                                    <span className="text-xl">{theme.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{theme.name}</span>
                                  </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-2">
                       <button 
                         onClick={() => addDailyActivity('activity')} 
                         className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                       >
                         <Plus className="w-4 h-4" /> Activity
                       </button>
                       <button 
                         onClick={() => addDailyActivity('break')} 
                         className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-200 transition-all"
                       >
                         <Plus className="w-4 h-4" /> Break
                       </button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {dailyActivities.map((activity, index) => (
                      <div key={activity.id} className="bg-white p-5 rounded-3xl border shadow-md hover:shadow-lg transition-all group">
                         <div className="flex items-center gap-4 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activity.type === 'break' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                               {activity.type === 'break' ? <Coffee className="w-5 h-5" /> : <ActivityIcon className="w-5 h-5" />}
                            </div>
                            <input 
                              type="text" 
                              placeholder={activity.type === 'break' ? "Break Name" : "Activity Name"}
                              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                              value={activity.name}
                              onChange={(e) => updateDailyActivity(activity.id, { name: e.target.value })}
                            />
                            <button onClick={() => removeDailyActivity(activity.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                               <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="relative">
                                  <input 
                                    type="number" 
                                    className="w-16 p-2 bg-slate-50 rounded-lg text-center font-black text-indigo-600 outline-none"
                                    value={activity.duration}
                                    onChange={(e) => updateDailyActivity(activity.id, { duration: parseInt(e.target.value) || 0 })}
                                  />
                                  <span className="absolute -top-2 left-2 px-1 bg-white text-[7px] font-black text-slate-400 uppercase">Min</span>
                               </div>
                               <div className="flex gap-1">
                                  <button onClick={() => updateDailyActivity(activity.id, { duration: Math.max(0, activity.duration - 5) })} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg font-bold text-slate-400 hover:text-indigo-600 transition-all">-</button>
                                  <button onClick={() => updateDailyActivity(activity.id, { duration: activity.duration + 5 })} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg font-bold text-slate-400 hover:text-indigo-600 transition-all">+</button>
                               </div>
                            </div>
                            <div className="flex gap-1">
                               <button onClick={() => moveActivity(index, 'up')} disabled={index === 0} className="p-2 hover:bg-slate-50 rounded-lg disabled:opacity-0"><ChevronUp className="w-4 h-4 text-slate-400"/></button>
                               <button onClick={() => moveActivity(index, 'down')} disabled={index === dailyActivities.length - 1} className="p-2 hover:bg-slate-50 rounded-lg disabled:opacity-0"><ChevronDown className="w-4 h-4 text-slate-400"/></button>
                            </div>
                         </div>
                      </div>
                    ))}

                    {dailyActivities.length === 0 && (
                      <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                         <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                         <p className="text-slate-500 font-bold">No activities yet</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* RIGHT COLUMN: PREVIEW */}
              <div className="flex-1 flex flex-col min-h-0">
                 <div className={`flex-1 rounded-[3rem] border shadow-2xl overflow-hidden flex flex-col transition-colors duration-500 ${currentTheme.bg} ${currentTheme.border}`}>
                    <div className="p-8 flex justify-between items-center border-b border-black/5">
                       <h2 className={`text-3xl font-black tracking-tight ${currentTheme.text}`}>Schedule Preview</h2>
                       <button 
                         onClick={toggleSmartBoard}
                         className={`w-12 h-12 flex items-center justify-center rounded-2xl border shadow-sm transition-all hover:scale-110 active:scale-95 ${currentTheme.card} ${currentTheme.border} ${currentTheme.text}`}
                         title="Maximize for Smart Board"
                       >
                         <Maximize2 className="w-6 h-6" />
                       </button>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-4">
                       {dailyActivities.length > 0 ? (
                         dailyActivities.map((activity, index) => (
                           <div key={activity.id} className={`flex items-center gap-6 p-6 rounded-[2rem] border shadow-sm transition-all ${currentTheme.card} ${currentTheme.border}`}>
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${activity.type === 'break' ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'}`}>
                                 {activity.type === 'break' ? <Coffee className="w-6 h-6" /> : <ActivityIcon className="w-6 h-6" />}
                              </div>
                              <div className="flex-1 flex justify-between items-center">
                                 <span className={`text-xl font-black ${currentTheme.text}`}>{activity.name || (activity.type === 'break' ? 'Break' : 'Activity')}</span>
                                 <span className={`px-4 py-1.5 rounded-xl font-black text-sm border shadow-inner ${currentTheme.bg} ${currentTheme.accent} ${currentTheme.border}`}>
                                    {getActivityTimeRange(index)}
                                 </span>
                              </div>
                           </div>
                         ))
                       ) : (
                         <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <Calendar className={`w-20 h-20 mb-4 ${currentTheme.text}`} />
                            <p className={`text-xl font-bold ${currentTheme.text}`}>Your schedule will appear here</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* PLAN ENTRY MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
           <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl border animate-slideUp">
              <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-slate-900">{editingSlot?.slot ? 'Edit Period' : 'Add Period'} — {editingSlot?.day}</h3><button onClick={() => { setIsPlanModalOpen(false); setEditingSlot(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6"/></button></div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6"><div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label><input type="text" className="w-full p-4 bg-slate-50 border-2 rounded-xl outline-none focus:border-blue-500 font-bold transition-all" value={planForm.subject || ''} onChange={e => setPlanForm({...planForm, subject: e.target.value})} placeholder="e.g. Mathematics" /></div><div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label><input type="text" className="w-full p-4 bg-slate-50 border-2 rounded-xl outline-none focus:border-blue-500 font-bold transition-all" value={planForm.time || ''} onChange={e => setPlanForm({...planForm, time: e.target.value})} placeholder="e.g. 9:30 AM" /></div></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Presentation</label><select className="w-full p-4 bg-slate-50 border-2 rounded-xl font-bold transition-all" value={planForm.presentationId || ''} onChange={e => setPlanForm({...planForm, presentationId: e.target.value})}><option value="">No lesson linked</option>{savedLessons.filter(l => !l.isWorksheet && !l.isDailyBoard).map(l => <option key={l.id} value={l.id}>{l.topic} ({l.subject})</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">External Resource URL</label><input type="text" placeholder="https://..." className="w-full p-4 bg-slate-50 border-2 rounded-xl font-bold focus:border-blue-500 outline-none transition-all" value={planForm.externalUrl || ''} onChange={e => setPlanForm({...planForm, externalUrl: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Labels</label><div className="flex gap-3 mt-2">{['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'].map(c => (<button key={c} type="button" onClick={() => setPlanForm({...planForm, color: c})} className={`w-9 h-9 rounded-full border-4 transition-all ${planForm.color === c ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ backgroundColor: c }} />))}</div></div>
              </div>
              <div className="flex gap-4 mt-10"><button onClick={() => { setIsPlanModalOpen(false); setEditingSlot(null); }} type="button" className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button><Button onClick={handleSavePlan} type="button" className="flex-[2] py-4 font-black shadow-xl">Save to Calendar</Button></div>
           </div>
        </div>
      )}
      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} user={userProfile} />
    </div>
    </>
  );
};
