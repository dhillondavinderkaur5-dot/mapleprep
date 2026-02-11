import React, { useState, useEffect, useRef } from 'react';
import { LessonPlan, Student, UserProfile, TeacherBookmark, PlannerEntry, GradeLevel, WorksheetStyle, GeneratedWorksheet, WeeklyPlanSlot } from '../types';
import { 
  Plus, Search, Trash2, BookOpen, Users, UserPlus, Shuffle, Play, X, 
  Timer as TimerIcon, RefreshCcw, Pause, ChevronDown, ArrowRight, 
  CheckSquare, Square, Loader2, LifeBuoy, Dices, Globe, Link as LinkIcon, 
  ExternalLink, GraduationCap, UserCheck, Monitor, Calendar, User as UserIcon, 
  Bell, Lightbulb, Pen, Eraser, Sparkles, Zap, Clock, ClipboardList, 
  Layers, MapPin, MoreVertical, Layout, Type, FileText, Printer, Eye, EyeOff, Save, Download, Check,
  Maximize, Minimize, Trophy, ListChecks, Upload, Timer, AlertCircle, Maximize2, Minimize2,
  ChevronUp, ChevronDown as ChevronDownIcon, PlayCircle
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../constants';
import { Button } from './Button';
import { HelpCenter } from './HelpCenter';
import { generateStandaloneWorksheet } from '../services/geminiService';

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

type DashboardTab = 'overview' | 'planner' | 'worksheets' | 'students' | 'groups' | 'tools' | 'links' | 'smartboard';

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
          // Detect correctness: explicitly bolded in markdown or contains "correct" hint
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

        // Standard Paragraph or Answer Key text
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

  const handleOpenLibraryItem = (item: LessonPlan) => {
    if (item.isWorksheet) {
      setCurrentWorksheet({ topic: item.topic, style: 'standard', studentMarkdown: item.worksheetMarkdown || '', teacherMarkdown: item.answerSheetMarkdown || '' });
      setWsTopic(item.topic); setWsGrade(item.gradeLevel as GradeLevel); setActiveTab('worksheets');
    } else onLessonClick(item);
  };

  // --- WEEKLY PLANNER STATE ---
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, WeeklyPlanSlot[]>>(() => {
    try { const saved = localStorage.getItem('mapleprep_weekly_plan'); return saved ? JSON.parse(saved) : { 'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [] }; } catch { return { 'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [] }; }
  });
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{day: string, slot?: WeeklyPlanSlot} | null>(null);
  const [planForm, setPlanForm] = useState<Partial<WeeklyPlanSlot>>({ subject: '', time: '', notes: '', color: '#3B82F6', presentationId: '', externalUrl: '' });

  useEffect(() => { localStorage.setItem('mapleprep_weekly_plan', JSON.stringify(weeklyPlan)); }, [weeklyPlan]);

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
        localStorage.setItem('mapleprep_weekly_plan', JSON.stringify(res));
        return res;
    });
    setIsPlanModalOpen(false); setEditingSlot(null);
  };

  const handleLaunchPlannerLesson = (e: React.MouseEvent, presentationId: string) => { e.stopPropagation(); const lesson = savedLessons.find(l => l.id === presentationId); if (lesson) onLessonClick(lesson); else alert("Lesson not found."); };
  const handleOpenPlannerUrl = (e: React.MouseEvent, url: string) => { e.stopPropagation(); let f = url.trim(); if (f && !f.startsWith('http')) f = 'https://' + f; window.open(f, '_blank'); };

  // --- MY CLASS & GROUPS STATE ---
  const [students, setStudents] = useState<Student[]>(() => { try { return JSON.parse(localStorage.getItem('mapleprep_students') || '[]'); } catch { return []; } });
  useEffect(() => { localStorage.setItem('mapleprep_students', JSON.stringify(students)); }, [students]);
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
  const [bookmarks, setBookmarks] = useState<TeacherBookmark[]>(() => { try { const saved = localStorage.getItem('mapleprep_bookmarks'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
  useEffect(() => { localStorage.setItem('mapleprep_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
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

  // --- FULLSCREEN ---
  const timerContainerRef = useRef<HTMLDivElement>(null);
  const stopwatchContainerRef = useRef<HTMLDivElement>(null);
  const pickerContainerRef = useRef<HTMLDivElement>(null);
  const toggleFS = (ref: React.RefObject<HTMLDivElement>) => {
    if (!document.fullscreenElement) ref.current?.requestFullscreen().catch(e => console.error(e));
    else document.exitFullscreen();
  };

  // --- DAILY BOARD ---
  const [boardHeading, setBoardHeading] = useState('Welcome Class!');
  const [boardLearning, setBoardLearning] = useState('');
  const [boardReminders, setBoardReminders] = useState('');
  const [boardSchedule, setBoardSchedule] = useState('');
  const [isBoardFullscreen, setIsBoardFullscreen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#EF4444');

  useEffect(() => {
    const saved = localStorage.getItem('mapleprep_daily_board');
    if (saved) {
      const data = JSON.parse(saved);
      setBoardHeading(data.heading || 'Welcome Class!'); setBoardLearning(data.learning || ''); setBoardReminders(data.reminders || ''); setBoardSchedule(data.schedule || '');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mapleprep_daily_board', JSON.stringify({ heading: boardHeading, learning: boardLearning, reminders: boardReminders, schedule: boardSchedule }));
  }, [boardHeading, boardLearning, boardReminders, boardSchedule]);

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

  const [checklist, setChecklist] = useState<{id: string, text: string, done: boolean}[]>(() => { try { const saved = localStorage.getItem('mapleprep_checklist'); return saved ? JSON.parse(saved) : [{ id: '1', text: 'Photocopy Worksheets', done: false }, { id: '2', text: 'Set up Smart Board', done: false }]; } catch { return []; } });

  const filteredLessons = savedLessons.filter(l => (l.topic?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (l.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()));

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn ${activeTab === 'smartboard' ? 'h-[calc(100vh-100px)]' : ''}`}>
      {/* Header */}
      {!isBoardFullscreen && (
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Teacher Dashboard</h1>
            <p className="text-slate-500 font-medium tracking-tight">MaplePrep Hub • {userProfile.name}</p>
          </div>
          <div className="flex bg-slate-200/50 p-1 rounded-2xl overflow-x-auto no-scrollbar border shadow-inner">
             {(['overview', 'planner', 'worksheets', 'students', 'groups', 'tools', 'links', 'smartboard'] as const).map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap capitalize transition-all tracking-widest ${activeTab === tab ? 'bg-white text-red-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-800'}`}>
                 {tab === 'smartboard' ? 'Daily Board' : tab === 'students' ? 'My Class' : tab === 'planner' ? 'Weekly Planner' : tab === 'worksheets' ? 'Worksheet Maker' : tab === 'links' ? 'Web Links' : tab}
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
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border mb-4 inline-block ${item.isWorksheet ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{item.isWorksheet ? 'Worksheet' : item.subject}</span>
                      <h3 className="font-black text-slate-900 text-lg leading-tight truncate group-hover:text-red-700">{item.topic}</h3>
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                      <Button variant="primary" className="flex-1 py-3 text-xs font-black uppercase" onClick={() => handleOpenLibraryItem(item)}>{item.isWorksheet ? <FileText className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}{item.isWorksheet ? 'Open Handout' : 'Launch'}</Button>
                      <button onClick={() => onDeleteLesson(item.id)} className="p-3 text-slate-300 hover:text-red-600 transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-8">
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

      {/* RESTORED: PLANNER TAB */}
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

      {/* RESTORED: WORKSHEETS TAB */}
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

      {/* RESTORED: STUDENTS TAB */}
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

      {/* RESTORED: GROUPS TAB */}
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

      {/* RESTORED: WEB LINKS TAB */}
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
        <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* CLASS TIMER TOOL */}
           <div ref={timerContainerRef} className="bg-white p-10 rounded-[2.5rem] border shadow-xl flex flex-col items-center relative group/tool min-h-[500px]">
              <button onClick={() => toggleFS(timerContainerRef)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl opacity-100 transition-opacity" title="Toggle Fullscreen">
                <Maximize2 className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 fullscreen-hide"><Timer className="w-8 h-8" /></div>
              <h2 className="text-2xl font-black mb-6 fullscreen-hide text-slate-800">Class Timer</h2>
              
              {/* Massive Running/Display View */}
              {(timerTime > 0 || timerActive) && (
                <div className="flex flex-col items-center justify-center w-full flex-1">
                  <div className="massive-tool-text timer-red">
                     {formatTimerDisplay(timerTime)}
                  </div>
                  <div className="fullscreen-controls">
                    <Button onClick={startTimer} variant={timerActive ? 'secondary' : 'primary'} className="min-w-[180px]">
                       {timerActive ? 'Pause' : 'Resume'}
                    </Button>
                    <button onClick={() => { setTimerTime(0); setTimerActive(false); }} className="p-4 bg-slate-800 text-white rounded-2xl hover:bg-red-600 transition-colors" title="Reset">
                       <RefreshCcw className="w-8 h-8" />
                    </button>
                  </div>
                </div>
              )}

              {/* Redesigned Setting View (No scrolling, large buttons) */}
              {!timerActive && timerTime === 0 && (
                 <div className="w-full flex-1 flex flex-col items-center justify-center">
                    <div className="timer-setter-grid mb-10">
                       <div className="setter-col">
                          <span className="setter-label">Hours</span>
                          <button onClick={() => setTH(h => Math.min(99, h + 1))} className="setter-btn"><ChevronUp className="w-8 h-8 md:w-12 md:h-12"/></button>
                          <div className="setter-val">{tH.toString().padStart(2, '0')}</div>
                          <button onClick={() => setTH(h => Math.max(0, h - 1))} className="setter-btn"><ChevronDownIcon className="w-8 h-8 md:w-12 md:h-12"/></button>
                       </div>
                       <div className="setter-col">
                          <span className="setter-label">Minutes</span>
                          <button onClick={() => setTM(m => Math.min(59, m + 1))} className="setter-btn"><ChevronUp className="w-8 h-8 md:w-12 md:h-12"/></button>
                          <div className="setter-val">{tM.toString().padStart(2, '0')}</div>
                          <button onClick={() => setTM(m => Math.max(0, m - 1))} className="setter-btn"><ChevronDownIcon className="w-8 h-8 md:w-12 md:h-12"/></button>
                       </div>
                       <div className="setter-col">
                          <span className="setter-label">Seconds</span>
                          <button onClick={() => setTS(s => Math.min(59, s + 1))} className="setter-btn"><ChevronUp className="w-8 h-8 md:w-12 md:h-12"/></button>
                          <div className="setter-val">{tS.toString().padStart(2, '0')}</div>
                          <button onClick={() => setTS(s => Math.max(0, s - 1))} className="setter-btn"><ChevronDownIcon className="w-8 h-8 md:w-12 md:h-12"/></button>
                       </div>
                    </div>
                    
                    <button 
                      onClick={startTimer} 
                      className="fs-start-btn py-6 px-12 rounded-[2rem] font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl transition-all hover:scale-105 active:scale-95 bg-red-600 text-white"
                    >
                      <PlayCircle className="w-8 h-8 md:w-10 md:h-10" />
                      Start Countdown
                    </button>
                 </div>
              )}
           </div>

           {/* STOPWATCH TOOL */}
           <div ref={stopwatchContainerRef} className="bg-white p-10 rounded-[2.5rem] border shadow-xl flex flex-col items-center justify-center relative group/tool min-h-[500px]">
              <button onClick={() => toggleFS(stopwatchContainerRef)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl opacity-100 transition-opacity" title="Toggle Fullscreen">
                <Maximize2 className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 fullscreen-hide"><Clock className="w-8 h-8" /></div>
              <h2 className="text-2xl font-black mb-6 fullscreen-hide text-slate-800">Precision Stopwatch</h2>
              
              <div className="massive-tool-text sw-blue">
                 {formatStopwatchDisplay(swTime)}
              </div>

              <div className="fullscreen-controls">
                 <Button onClick={() => setSwActive(!swActive)} variant={swActive ? 'secondary' : 'primary'} className="min-w-[180px]">
                    {swActive ? 'Pause' : (swTime > 0 ? 'Resume' : 'Start')}
                 </Button>
                 <button onClick={() => { setSwTime(0); setSwActive(false); }} className="p-4 bg-slate-800 text-white rounded-2xl hover:bg-blue-600 transition-colors" title="Reset">
                    <RefreshCcw className="w-8 h-8" />
                 </button>
              </div>
           </div>

           {/* FAIR PICKER TOOL */}
           <div ref={pickerContainerRef} className="bg-white p-10 rounded-[2.5rem] border shadow-xl text-center flex flex-col items-center justify-center relative group/tool min-h-[500px]">
              <button onClick={() => toggleFS(pickerContainerRef)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-purple-600 rounded-xl opacity-100 transition-opacity" title="Toggle Fullscreen">
                <Maximize2 className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 fullscreen-hide"><Dices className="w-8 h-8" /></div>
              <h2 className="text-2xl font-black mb-4 picker-title-fs text-slate-800">Fair Participation Picker</h2>
              <div className="w-full max-w-sm mb-6 fullscreen-hide">
                 <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={pickerGradeFilter} onChange={e => setPickerGradeFilter(e.target.value)}>
                    <option value="All">All Grades</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                 </select>
              </div>
              <div className="w-full h-48 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200 flex items-center justify-center mb-8 relative overflow-hidden picker-box-fs">
                 {pickedStudent ? <span className="font-black text-slate-900 animate-bounce-subtle text-5xl picker-name-fs">{pickedStudent.name}</span> : <span className="text-slate-300 font-bold uppercase tracking-widest">Spin for a Name</span>}
                 {isPicking && <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-purple-600 w-12 h-12"/></div>}
              </div>
              <Button onClick={handlePickStudent} isLoading={isPicking} className="w-full py-6 text-xl font-black shadow-xl shadow-purple-100 picker-button-fullscreen">Randomize Student!</Button>
           </div>
        </div>
      )}

      {/* DAILY BOARD TAB */}
      {activeTab === 'smartboard' && (
        <div ref={boardRef} className={`animate-fadeIn flex flex-col h-full bg-slate-50 transition-all duration-500 ${isBoardFullscreen ? 'fixed inset-0 z-[1000] p-10 bg-slate-900' : 'space-y-6'}`}>
           <div className={`p-8 rounded-[2.5rem] shadow-2xl flex justify-between items-center shrink-0 border-4 ${isBoardFullscreen ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
              <div className="flex-1"><input type="text" value={boardHeading} onChange={e => setBoardHeading(e.target.value)} className={`text-6xl font-black bg-transparent border-none outline-none focus:ring-0 w-full tracking-tight ${isBoardFullscreen ? 'text-white' : 'text-slate-900'}`} placeholder="Enter Heading..." /></div>
              <div className="flex items-center gap-8 pl-12 shrink-0">
                 <div className="flex flex-col items-end">
                    <div className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] font-mono font-black text-5xl tracking-[0.1em] shadow-inner ${isBoardFullscreen ? 'bg-slate-900 text-red-500 shadow-black' : 'bg-slate-100 text-slate-900 shadow-slate-200'}`}><Clock className="w-10 h-10" />{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    <p className={`text-sm font-black uppercase tracking-[0.3em] mt-3 pr-4 ${isBoardFullscreen ? 'text-slate-500' : 'text-slate-400'}`}>{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                 </div>
                 <button onClick={toggleBoardFullscreen} className={`p-5 rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95 ${isBoardFullscreen ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>{isBoardFullscreen ? <Minimize className="w-8 h-8" /> : <Maximize className="w-8 h-8" />}</button>
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

      {/* PLAN ENTRY MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
           <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl border animate-slideUp">
              <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-slate-900">{editingSlot?.slot ? 'Edit Period' : 'Add Period'} — {editingSlot?.day}</h3><button onClick={() => { setIsPlanModalOpen(false); setEditingSlot(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6"/></button></div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6"><div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label><input type="text" className="w-full p-4 bg-slate-50 border-2 rounded-xl outline-none focus:border-blue-500 font-bold transition-all" value={planForm.subject || ''} onChange={e => setPlanForm({...planForm, subject: e.target.value})} placeholder="e.g. Mathematics" /></div><div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label><input type="text" className="w-full p-4 bg-slate-50 border-2 rounded-xl outline-none focus:border-blue-500 font-bold transition-all" value={planForm.time || ''} onChange={e => setPlanForm({...planForm, time: e.target.value})} placeholder="e.g. 9:30 AM" /></div></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Presentation</label><select className="w-full p-4 bg-slate-50 border-2 rounded-xl font-bold transition-all" value={planForm.presentationId || ''} onChange={e => setPlanForm({...planForm, presentationId: e.target.value})}><option value="">No lesson linked</option>{savedLessons.map(l => <option key={l.id} value={l.id}>{l.topic} ({l.subject})</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">External Resource URL</label><input type="text" placeholder="https://..." className="w-full p-4 bg-slate-50 border-2 rounded-xl font-bold focus:border-blue-500 outline-none transition-all" value={planForm.externalUrl || ''} onChange={e => setPlanForm({...planForm, externalUrl: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Labels</label><div className="flex gap-3 mt-2">{['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'].map(c => (<button key={c} type="button" onClick={() => setPlanForm({...planForm, color: c})} className={`w-9 h-9 rounded-full border-4 transition-all ${planForm.color === c ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ backgroundColor: c }} />))}</div></div>
              </div>
              <div className="flex gap-4 mt-10"><button onClick={() => { setIsPlanModalOpen(false); setEditingSlot(null); }} type="button" className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button><Button onClick={handleSavePlan} type="button" className="flex-[2] py-4 font-black shadow-xl">Save to Calendar</Button></div>
           </div>
        </div>
      )}
      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} user={userProfile} />
    </div>
  );
};