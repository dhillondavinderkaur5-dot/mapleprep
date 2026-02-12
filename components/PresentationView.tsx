<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { LessonPlan, Slide, PresentationTheme, DraggableElement, ElementType, QuizQuestion } from '../types';
import { Button } from './Button';
import { generateSlideImage } from '../services/geminiService';
import { 
  ChevronLeft, ChevronRight, X, Eye, EyeOff, Maximize, Minimize, 
  MessageSquare, Sparkles, ImageIcon, Video, Link as LinkIcon, 
  Plus, Trash2, Edit3, MousePointer2, AlertCircle, Pen, Eraser, Monitor,
  Clock, ClipboardList, CheckCircle as CheckIcon, XCircle, Upload, Link, Move,
  ExternalLink, ListChecks, Trophy, User, RefreshCw, CheckCircle2, AlertCircle as ErrorIcon,
  UploadCloud, FileVideo, FileImage, Loader2
=======

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LessonPlan, DraggableElement, ElementType, Slide } from '../types';
import { generateSlideImage } from '../services/geminiService';
import { Button } from './Button';
import { 
  ChevronLeft, 
  ChevronRight, 
  MonitorPlay, 
  X, 
  Lightbulb, 
  Clock, 
  Briefcase, 
  Pencil, 
  Type, 
  Image as ImageIcon, 
  Sticker, 
  BarChart, 
  Trash, 
  Layout, 
  ListChecks, 
  HelpCircle, 
  Wand2, 
  RefreshCcw, 
  Link as LinkIcon,
  Video,
  ExternalLink,
  PlayCircle,
  Edit2,
  Check,
  Save,
  Copy,
  Trophy,
  FileText,
  Printer,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  MessageSquare,
  BookOpen,
  Users
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
} from 'lucide-react';

interface PresentationViewProps {
  lessonPlan: LessonPlan;
  onReset: () => void;
  onUpdateLesson?: (plan: LessonPlan) => void;
<<<<<<< HEAD
}

type Tab = 'slides' | 'activities' | 'quiz';

export const PresentationView: React.FC<PresentationViewProps> = ({ lessonPlan, onReset, onUpdateLesson }) => {
  const [activeTab, setActiveTab] = useState<Tab>('slides');
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [showNotes, setShowNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Quiz State
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<ElementType | null>(null);
  const [modalInput, setModalInput] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const whiteboardCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#EF4444');

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showWhiteboard && whiteboardCanvasRef.current) {
      const canvas = whiteboardCanvasRef.current;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    }
  }, [showWhiteboard]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !whiteboardCanvasRef.current) return;
    const canvas = whiteboardCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleNextQuiz = () => {
    if (quizIdx < lessonPlan.quiz.length - 1) {
      setQuizIdx(prev => prev + 1);
      setSelectedAns(null);
      setIsAnswering(false);
    } else {
      setShowQuizResults(true);
    }
  };

  const handleSelectAnswer = (ans: string) => {
    if (isAnswering) return;
    setSelectedAns(ans);
    setIsAnswering(true);
    if (ans === lessonPlan.quiz[quizIdx].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const resetQuiz = () => {
    setQuizIdx(0);
    setQuizScore(0);
    setSelectedAns(null);
    setShowQuizResults(false);
    setIsAnswering(false);
  };

  if (!lessonPlan || !lessonPlan.slides || lessonPlan.slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Oops! No Slides Found</h2>
        <p className="text-slate-500 mb-8 max-w-md">We couldn't load the presentation content. Try generating the lesson again.</p>
        <Button onClick={onReset}>Back to Dashboard</Button>
      </div>
    );
  }

  const currentSlide = lessonPlan.slides[currentSlideIdx] || lessonPlan.slides[0];

  const handleNext = () => {
    setCurrentSlideIdx(prev => Math.min(prev + 1, lessonPlan.slides.length - 1));
  };
  const handlePrev = () => {
    setCurrentSlideIdx(prev => Math.max(prev - 1, 0));
  };
=======
  onSaveCopy?: (plan: LessonPlan) => void;
}

type Tab = 'slides' | 'worksheet' | 'activities' | 'quiz';

// --- MARKDOWN RENDERER ---
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
        let processedLine = trimmed
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/_{3,}/g, '<span class="blank-line"></span>');
        
        if (/\b(draw|sketch|shade|illustrate)\b/i.test(lowerLine)) {
           return (
             <div key={i} className="space-y-2">
                <p className="font-medium">{renderText(trimmed)}</p>
                <div className="w-full h-48 border-2 border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">Drawing Space</div>
             </div>
           );
        }

        if (trimmed.startsWith('- ')) {
          return <div key={i} className="flex gap-3 ml-4"><span className="font-bold">•</span><span>{renderText(trimmed.slice(2))}</span></div>;
        }
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

export const PresentationView: React.FC<PresentationViewProps> = ({ 
  lessonPlan, 
  onReset,
  onUpdateLesson,
  onSaveCopy
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('slides');
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [generatingImageTarget, setGeneratingImageTarget] = useState<'main' | 'example' | null>(null);
  
  // Design Mode State
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [designElements, setDesignElements] = useState<Record<number, DraggableElement[]>>({});
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Worksheet State
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  
  // URL Input Dialog State
  const [urlDialog, setUrlDialog] = useState<{isOpen: boolean, type: 'link'|'video', elementId?: string, initialValue?: string} | null>(null);
  const [urlInputValue, setUrlInputValue] = useState('');

  // Presentation Mode State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elementsMap: Record<number, DraggableElement[]> = {};
    lessonPlan.slides.forEach((slide, idx) => {
      if (slide.customElements) {
        elementsMap[idx] = slide.customElements;
      }
    });
    setDesignElements(elementsMap);
  }, [lessonPlan]);

  // Handle Fullscreen Change Events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle auto-focus when editing text
  useEffect(() => {
    if (editingElementId) {
      const el = document.getElementById(`element-content-${editingElementId}`);
      if (el) {
        el.focus();
        // Move cursor to end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [editingElementId]);
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
<<<<<<< HEAD
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const url = await generateSlideImage(currentSlide.imageDescription || currentSlide.title);
      const updatedSlides = [...lessonPlan.slides];
      updatedSlides[currentSlideIdx].base64Image = url;
      onUpdateLesson?.({ ...lessonPlan, slides: updatedSlides });
    } catch (e) {
      alert("Image generation failed. Try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSlideMouseMove = (e: React.MouseEvent) => {
    if (!isEditMode || !draggedElementId || !slideContainerRef.current) return;
    
    const containerRect = slideContainerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;

    const updatedSlides = [...lessonPlan.slides];
    const elements = [...(updatedSlides[currentSlideIdx].customElements || [])];
    const elementIdx = elements.findIndex(el => el.id === draggedElementId);
    
    if (elementIdx !== -1) {
      elements[elementIdx] = { ...elements[elementIdx], x, y };
      updatedSlides[currentSlideIdx] = { ...updatedSlides[currentSlideIdx], customElements: elements };
      onUpdateLesson?.({ ...lessonPlan, slides: updatedSlides });
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    if (!isEditMode) return;
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDraggedElementId(id);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleRemoveElement = (id: string) => {
    const updatedSlides = [...lessonPlan.slides];
    updatedSlides[currentSlideIdx].customElements = (updatedSlides[currentSlideIdx].customElements || []).filter(el => el.id !== id);
    onUpdateLesson?.({ ...lessonPlan, slides: updatedSlides });
  };

  const handleMouseUp = () => {
    setDraggedElementId(null);
  };

  const handleAddElement = (type: ElementType) => {
    setAddType(type);
    setModalInput('');
    setModalTitle('');
    setIsAddModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setModalInput(event.target.result as string);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to read file.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const processAddElement = () => {
    const trimmedInput = modalInput.trim();
    if (!trimmedInput && addType !== 'sticker') return;
    
    let content = trimmedInput;
    // Only prepend protocol if it's not a data URL and not already starting with http
    if (content && !content.startsWith('http') && !content.startsWith('data:')) {
      content = 'https://' + content;
    }

    // Video embed logic (YouTube only)
    if (addType === 'video' && content.includes('youtube.com/watch?v=')) {
      const id = content.split('v=')[1]?.split('&')[0];
      if (id) content = `https://www.youtube.com/embed/${id}`;
    } else if (addType === 'video' && content.includes('youtu.be/')) {
      const id = content.split('youtu.be/')[1]?.split('?')[0];
      if (id) content = `https://www.youtube.com/embed/${id}`;
    }

    const newElement: DraggableElement = {
      id: crypto.randomUUID(),
      type: addType!,
      x: 200,
      y: 200,
      content: content,
      color: modalTitle.trim() || '',
      scale: 1
    };
    const updatedSlides = [...lessonPlan.slides];
    updatedSlides[currentSlideIdx].customElements = [...(updatedSlides[currentSlideIdx].customElements || []), newElement];
    onUpdateLesson?.({ ...lessonPlan, slides: updatedSlides });
    setIsAddModalOpen(false);
  };

  const handleUpdatePersonalNotes = (val: string) => {
    const updatedSlides = [...lessonPlan.slides];
    updatedSlides[currentSlideIdx] = { ...updatedSlides[currentSlideIdx], personalNotes: val };
    onUpdateLesson?.({ ...lessonPlan, slides: updatedSlides });
  };

  const getThemeStyles = (theme?: PresentationTheme) => {
    switch (theme) {
      case 'chalkboard': return { slideBg: 'bg-slate-800', textTitle: 'text-white font-hand', textBody: 'text-slate-200', accent: 'bg-white' };
      case 'nature': return { slideBg: 'bg-emerald-50', textTitle: 'text-emerald-900 font-serif-theme', textBody: 'text-emerald-800', accent: 'bg-emerald-500' };
      case 'playful': return { slideBg: 'bg-yellow-50', textTitle: 'text-amber-900 font-hand', textBody: 'text-amber-800', accent: 'bg-amber-500' };
      default: return { slideBg: 'bg-white', textTitle: 'text-slate-900 font-black', textBody: 'text-slate-700', accent: 'bg-red-600' };
    }
  };

  const themeStyle = getThemeStyles(lessonPlan.theme);

  return (
    <div ref={containerRef} className={`flex flex-col overflow-hidden relative ${isFullscreen ? 'h-screen w-screen bg-slate-900' : 'h-full rounded-2xl shadow-2xl bg-slate-100'} animate-fadeIn`} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Modals & Overlays */}
      {isAddModalOpen && (
        <div className="absolute inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-fadeIn">
           <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-slate-200 animate-slideUp">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      {addType === 'image' && <ImageIcon className="w-5 h-5"/>}
                      {addType === 'video' && <Video className="w-5 h-5"/>}
                      {addType === 'link' && <LinkIcon className="w-5 h-5"/>}
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Add {addType}</h3>
                 </div>
                 <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400"/></button>
              </div>

              <div className="space-y-6 mb-8 text-left">
                {/* File Upload Option for Image/Video */}
                {(addType === 'image' || addType === 'video') && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Upload Local File</label>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept={addType === 'image' ? "image/*" : "video/*"} 
                      onChange={handleFileUpload}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-all text-slate-500 hover:text-blue-600"
                    >
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        <>
                          {addType === 'image' ? <FileImage className="w-8 h-8" /> : <FileVideo className="w-8 h-8" />}
                          <span className="text-sm font-black">Choose {addType} from Computer</span>
                        </>
                      )}
                    </button>
                    <div className="flex items-center gap-4 my-4">
                      <div className="h-px bg-slate-100 flex-1"></div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
                      <div className="h-px bg-slate-100 flex-1"></div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">
                    {addType === 'image' ? 'Image URL' : addType === 'video' ? 'Embed/Video URL' : 'Website URL'}
                  </label>
                  <input 
                    type="text" 
                    placeholder={addType === 'image' ? "example.com/photo.jpg" : "https://youtube.com/..."} 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-900 placeholder-slate-400 transition-all shadow-inner" 
                    value={modalInput.startsWith('data:') ? '(Local File Uploaded)' : modalInput} 
                    onChange={e => setModalInput(e.target.value)} 
                    disabled={modalInput.startsWith('data:')}
                  />
                  {modalInput.startsWith('data:') && (
                    <button onClick={() => setModalInput('')} className="text-[10px] font-bold text-red-500 mt-1 ml-1 hover:underline">Remove local file and use URL</button>
                  )}
                </div>

                {addType === 'link' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Button Display Text</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Science Article" 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 font-bold text-slate-900 placeholder-slate-400 transition-all shadow-inner" 
                      value={modalTitle} 
                      onChange={e => setModalTitle(e.target.value)} 
                    />
                  </div>
                )}

                {/* Local Preview */}
                {modalInput.startsWith('data:') && (
                  <div className="mt-4 p-2 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Preview</p>
                    {addType === 'image' && <img src={modalInput} className="max-h-32 rounded-lg mx-auto" alt="Preview" />}
                    {addType === 'video' && <video src={modalInput} className="max-h-32 rounded-lg mx-auto" controls />}
                  </div>
                )}
              </div>

              <Button className="w-full py-5 text-lg font-black uppercase tracking-widest shadow-xl active:scale-[0.98]" onClick={processAddElement} disabled={!modalInput}>
                 Confirm Add to Slide
              </Button>
           </div>
        </div>
      )}

      {showWhiteboard && (
        <div className="absolute inset-0 z-[400] bg-slate-50 flex flex-col animate-fadeIn">
          <div className="p-4 bg-white border-b flex justify-between items-center shrink-0">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Whiteboard</h3>
            <div className="flex items-center gap-3">
              <button onClick={clearWhiteboard} className="p-2 bg-slate-100 text-slate-400 hover:text-red-600 rounded-xl"><Eraser className="w-5 h-5" /></button>
              <Button variant="secondary" onClick={() => setShowWhiteboard(false)}>Exit</Button>
            </div>
          </div>
          <div className="flex-1 p-6 relative">
             <canvas ref={whiteboardCanvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} />
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <div className={`p-4 flex justify-between items-center bg-white border-b z-30 shrink-0 ${isFullscreen ? 'sticky top-0 left-0 right-0 border-none bg-white/90 backdrop-blur shadow-lg' : ''}`}>
        <div className="flex gap-2">
          <button onClick={onReset} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5"/></button>
          <div className="h-10 w-[2px] bg-slate-200 mx-2"></div>
          <button onClick={() => setActiveTab('slides')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${activeTab === 'slides' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Slides</button>
          <button onClick={() => setActiveTab('activities')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${activeTab === 'activities' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Activities</button>
          <button onClick={() => setActiveTab('quiz')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${activeTab === 'quiz' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Quiz</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${isEditMode ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-500'}`}>
             {isEditMode ? <MousePointer2 className="w-4 h-4"/> : <Edit3 className="w-4 h-4"/>} {isEditMode ? 'Finish Editing' : 'Edit Slide Tools'}
          </button>
          <button onClick={toggleFullscreen} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
             {isFullscreen ? <Minimize className="w-5 h-5"/> : <Maximize className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      <div className={`flex-1 flex overflow-hidden relative ${isFullscreen ? 'min-h-0' : ''}`}>
        {/* Left Toolbar (Edit Mode) */}
        {isEditMode && activeTab === 'slides' && (
          <div className={`w-20 ${isFullscreen ? 'bg-slate-800' : 'bg-white'} border-r flex flex-col items-center py-8 gap-8 z-40 animate-slideRight shadow-2xl shrink-0 transition-colors`}>
            <button onClick={() => handleAddElement('image')} className="flex flex-col items-center gap-1 group transition-transform hover:scale-105 active:scale-95">
               <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all"><ImageIcon className="w-7 h-7"/></div>
               <span className={`text-[9px] font-black uppercase tracking-tighter ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>Add Image</span>
            </button>
            <button onClick={() => handleAddElement('video')} className="flex flex-col items-center gap-1 group transition-transform hover:scale-105 active:scale-95">
               <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl shadow-sm border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-all"><Video className="w-7 h-7"/></div>
               <span className={`text-[9px] font-black uppercase tracking-tighter ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>Add Video</span>
            </button>
            <button onClick={() => handleAddElement('link')} className="flex flex-col items-center gap-1 group transition-transform hover:scale-105 active:scale-95">
               <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all"><LinkIcon className="w-7 h-7"/></div>
               <span className={`text-[9px] font-black uppercase tracking-tighter ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>Add Link</span>
            </button>
          </div>
        )}

        {/* Main Viewport */}
        <div className={`flex-1 overflow-hidden flex flex-col items-center justify-center relative min-w-0 ${isFullscreen ? 'bg-slate-900 p-2 sm:p-6' : 'bg-slate-50 p-8'}`}>
          {activeTab === 'slides' && (
            <div className={`w-full h-full flex gap-4 sm:gap-8 items-stretch relative min-h-0 ${isFullscreen ? 'max-w-none' : 'max-w-6xl'}`} ref={slideContainerRef} onMouseMove={handleSlideMouseMove}>
               
               {/* CUSTOM DRAGGABLE ELEMENTS */}
               {currentSlide.customElements?.map((el) => (
                  <div 
                    key={el.id}
                    style={{ left: el.x, top: el.y, zIndex: 50 }}
                    onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                    className={`absolute group/el transition-shadow ${isEditMode ? 'cursor-move border-2 border-dashed border-blue-400/50 p-2 bg-white/70 backdrop-blur-xl rounded-2xl hover:shadow-2xl' : ''}`}
                  >
                    {isEditMode && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveElement(el.id); }}
                        className="absolute -top-4 -right-4 p-2 bg-red-600 text-white rounded-full shadow-lg opacity-100 sm:opacity-0 group-hover/el:opacity-100 transition-opacity z-[60] hover:scale-110 active:scale-90"
                      >
                        <X className="w-4 h-4"/>
                      </button>
                    )}

                    {el.type === 'image' && (
                      <img 
                        src={el.content} 
                        className={`max-w-[400px] h-auto rounded-xl shadow-md ${isEditMode ? 'pointer-events-none' : ''}`} 
                        alt="Teacher visual" 
                      />
                    )}

                    {el.type === 'video' && (
                      <div className="w-[320px] sm:w-[480px] aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                        {el.content.startsWith('data:') ? (
                           <video 
                             src={el.content} 
                             className={`w-full h-full object-contain ${isEditMode ? 'pointer-events-none' : ''}`} 
                             controls={!isEditMode}
                             playsInline
                           />
                        ) : (
                          <iframe 
                            src={el.content} 
                            className={`w-full h-full border-none ${isEditMode ? 'pointer-events-none' : ''}`} 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          />
                        )}
                      </div>
                    )}

                    {el.type === 'link' && (
                      <div className="relative group/link-badge">
                        <a 
                          href={isEditMode ? undefined : el.content} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={(e) => isEditMode && e.preventDefault()}
                          className={`flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 rounded-full font-black text-slate-800 shadow-xl transition-all ${isEditMode ? 'cursor-move' : 'hover:bg-slate-50 hover:scale-105 active:scale-95'}`}
                        >
                          <LinkIcon className={`w-5 h-5 ${isEditMode ? 'text-slate-400' : 'text-blue-600'}`}/>
                          <span className="whitespace-nowrap">{el.color || 'View Resource'}</span>
                          {!isEditMode && <ExternalLink className="w-4 h-4 text-slate-300"/>}
                        </a>
                        
                        {isEditMode && (
                           <button 
                             onMouseDown={(e) => e.stopPropagation()}
                             onClick={() => window.open(el.content, '_blank')}
                             className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/el:opacity-100 transition-opacity whitespace-nowrap z-[60] shadow-lg flex items-center gap-2"
                           >
                             <ExternalLink className="w-3 h-3" /> Test Link
                           </button>
                        )}
                      </div>
                    )}
                  </div>
               ))}

               {/* Navigation Arrows */}
               <button 
                  onClick={handlePrev} 
                  disabled={currentSlideIdx === 0} 
                  className={`absolute top-1/2 left-4 -translate-y-1/2 z-[60] p-4 sm:p-6 bg-white border-2 border-slate-200 text-slate-900 hover:text-red-600 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:opacity-0 transition-all transform active:scale-95 ${currentSlideIdx === 0 ? 'pointer-events-none' : 'opacity-100'}`}
                  aria-label="Previous Slide"
               >
                  <ChevronLeft className="w-8 h-8 sm:w-12 sm:h-12"/>
               </button>
               
               <button 
                  onClick={handleNext} 
                  disabled={currentSlideIdx === lessonPlan.slides.length - 1} 
                  className={`absolute top-1/2 right-4 -translate-y-1/2 z-[60] p-4 sm:p-6 bg-white border-2 border-slate-200 text-slate-900 hover:text-red-600 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:opacity-0 transition-all transform active:scale-95 ${currentSlideIdx === lessonPlan.slides.length - 1 ? 'pointer-events-none' : 'opacity-100'}`}
                  aria-label="Next Slide"
               >
                  <ChevronRight className="w-8 h-8 sm:w-12 sm:h-12"/>
               </button>

               {/* Slide Left Column */}
               <div className={`flex-[2.5] ${themeStyle.slideBg} rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-12 border-2 border-slate-200/50 shadow-2xl relative overflow-hidden z-10 flex flex-col min-h-0`}>
                  <div className="mb-4 sm:mb-8 shrink-0">
                    <h2 className={`text-2xl sm:text-[clamp(2rem,5vh,4.5rem)] font-black leading-tight break-words ${themeStyle.textTitle}`}>{currentSlide.title}</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-4 no-scrollbar min-h-0 space-y-4 sm:space-y-6">
                    {currentSlide.bulletPoints?.map((bp, i) => (
                      <div key={i} className="flex gap-4 sm:gap-6 items-start">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mt-2.5 sm:mt-4 shrink-0 ${themeStyle.accent}`}></div>
                        <p className={`text-lg sm:text-[clamp(1.25rem,3.5vh,2.5rem)] font-bold leading-tight sm:leading-relaxed break-words ${themeStyle.textBody}`}>{bp}</p>
                      </div>
                    ))}
                  </div>

                  {/* PRACTICE BOX */}
                  {currentSlide.practicalExample && (
                    <div className={`mt-4 sm:mt-6 bg-blue-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-xl animate-fadeIn relative overflow-hidden flex flex-col z-20 shrink-0 ${isFullscreen ? 'max-h-[22%]' : 'max-h-[28%]'} overflow-y-auto no-scrollbar border-2 border-white/10`}>
                       <div className="relative z-10 flex flex-col min-h-0">
                          <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2 text-blue-100">
                             <Plus className="w-4 h-4 bg-white/20 rounded-full p-1" /> Let's Try Together!
                          </h4>
                          <div className="mb-2 sm:mb-3">
                             <p className={`font-black leading-snug break-words ${isFullscreen ? 'text-base sm:text-xl' : 'text-sm sm:text-base'}`}>{currentSlide.practicalExample.problem}</p>
                          </div>
                          <button onClick={() => setShowWhiteboard(true)} className="w-max px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-blue-50 transition-all shrink-0">
                             <Pen className="w-4 h-4" /> Whiteboard
                          </button>
                       </div>
                       <Monitor className="absolute -bottom-2 -right-2 w-16 h-16 sm:w-28 sm:h-28 opacity-10 rotate-12" />
                    </div>
                  )}
               </div>

               {/* Slide Right Column (Visual + Guide) */}
               <div className={`flex-[1.2] flex flex-col gap-4 sm:gap-8 z-10 overflow-hidden min-w-[200px] sm:min-w-[300px] ${isFullscreen ? 'max-w-[30%]' : 'hidden sm:flex'}`}>
                  <div className="flex-1 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden relative min-h-0">
                     {currentSlide.base64Image ? (
                        <img src={currentSlide.base64Image} className="w-full h-full object-cover" alt="Slide Visual" />
                     ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                           <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mb-3" />
                           <Button onClick={handleGenerateImage} isLoading={isGeneratingImage} className="px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                             Generate Visual
                           </Button>
                        </div>
                     )}
                  </div>
                  
                  <div className={`h-32 sm:h-64 bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 text-white flex flex-col shadow-inner border-l-8 border-red-600 relative overflow-hidden shrink-0`}>
                     <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3">Practice Guide</p>
                     <div className="flex-1 overflow-y-auto pr-2 no-scrollbar min-h-0">
                        {currentSlide.practicalExample?.solutionSteps?.length ? (
                           <ul className="space-y-1 sm:space-y-3">
                              {currentSlide.practicalExample.solutionSteps.map((step, i) => (
                                 <li key={i} className={`font-bold leading-snug opacity-90 flex gap-2 ${isFullscreen ? 'text-xs sm:text-base' : 'text-[10px] sm:text-xs'}`}>
                                    <span className="text-red-500 font-black">{i + 1}.</span> 
                                    <span className="break-words">{step}</span>
                                 </li>
                              ))}
                           </ul>
                        ) : (
                           <p className="text-[10px] italic opacity-40 font-bold">Brainstorm solutions with the class.</p>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'activities' && (
             <div className="w-full h-full max-w-4xl bg-white p-8 lg:p-12 rounded-[2rem] shadow-2xl overflow-y-auto animate-fadeIn min-h-0 no-scrollbar">
                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-8 flex items-center gap-4"><ClipboardList className="w-8 h-8 text-blue-600"/> Class Activities</h2>
                <div className="grid grid-cols-1 gap-6 lg:gap-8">
                   {lessonPlan.activities?.map((act, i) => (
                      <div key={i} className="bg-slate-50 border p-6 lg:p-8 rounded-3xl">
                         <h3 className="text-xl lg:text-2xl font-black text-slate-900 mb-2">{act.title}</h3>
                         <span className="inline-block px-3 py-1 bg-white border rounded-full text-[10px] font-black text-slate-500 mb-4">{act.duration}</span>
                         <div className="prose prose-sm lg:prose-base max-w-none text-slate-700 font-medium">{act.description}</div>
=======
    } else {
      document.exitFullscreen();
    }
  };

  const updateLessonWithElements = (newElementsMap: Record<number, DraggableElement[]>) => {
    setDesignElements(newElementsMap);
    if (onUpdateLesson) {
      const updatedSlides = lessonPlan.slides.map((slide, idx) => ({
        ...slide,
        customElements: newElementsMap[idx] || []
      }));
      onUpdateLesson({ ...lessonPlan, slides: updatedSlides });
    }
  };

  const handleNext = useCallback(() => {
    setCurrentSlideIdx(prev => {
      if (prev < lessonPlan.slides.length - 1) return prev + 1;
      return prev;
    });
  }, [lessonPlan.slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlideIdx(prev => {
      if (prev > 0) return prev - 1;
      return prev;
    });
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a text field
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '') || (document.activeElement as HTMLElement).isContentEditable) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); // Prevent scrolling for space
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen]);

  const handleGenerateImage = async (target: 'main' | 'example') => {
    setGeneratingImageTarget(target);
    const slide = lessonPlan.slides[currentSlideIdx];
    
    let prompt = slide.imageDescription;
    let stylePreset: 'default' | 'chalkboard' = 'default';

    if (target === 'example' && slide.practicalExample) {
        // Build a highly specific prompt for the diagram based on the problem and solution steps
        const steps = slide.practicalExample.solutionSteps.join('\n');
        prompt = `Math/Science Problem: "${slide.practicalExample.problem}"
        
        Step-by-Step Solution to Visualize:
        ${steps}
        
        INSTRUCTIONS:
        - Draw a diagram that strictly follows the solution steps above.
        - If the problem involves counting, fractions, geometry, or data, represent it ACCURATELY.
        - E.g., if it says "divide into 4 parts", show 4 distinct parts.
        - E.g., if it says "add 3 + 2", visually show the combining of groups.
        - This is for elementary students, so keep it visual and explicit.`;
        
        stylePreset = 'chalkboard';
    }

    try {
      const base64 = await generateSlideImage(prompt, stylePreset);
      
      const updatedSlides = [...lessonPlan.slides];
      if (target === 'main') {
          updatedSlides[currentSlideIdx] = { ...slide, base64Image: base64 };
      } else {
          updatedSlides[currentSlideIdx] = { 
              ...slide, 
              practicalExample: { ...slide.practicalExample!, base64Image: base64 } 
          };
      }
      
      if (onUpdateLesson) {
        onUpdateLesson({ ...lessonPlan, slides: updatedSlides });
      }
    } catch (error) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setGeneratingImageTarget(null);
    }
  };

  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const rawContent = showAnswerKey && lessonPlan.answerSheetMarkdown ? lessonPlan.answerSheetMarkdown : lessonPlan.worksheetMarkdown;
    const cleanContent = rawContent.replace(/!\[.*?\]\(.*?\)/g, '');

    const parseMarkdownToHTML = (md: string) => {
      let lines = md.split('\n');
      let html = '';
      let inTable = false;
      let inList = false;

      while(lines.length > 0 && lines[0].trim() === '') lines.shift();
      if (lines.length > 0 && lines[0].trim().startsWith('# ')) lines.shift();

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
             if(inList) { html += '</ul>'; inList = false; }
             html += '<br/>';
             return; 
        }
        if (trimmed === '---' || trimmed.match(/^-+$/)) return;

        if (trimmed.startsWith('|')) {
           if (!inTable) { html += '<table class="content-table">'; inTable = true; }
           const cells = trimmed.split('|').filter(c => c.trim() !== '');
           if (trimmed.includes('---')) return;
           html += '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
           return;
        } else if (inTable) { html += '</table>'; inTable = false; }

        if (trimmed.startsWith('### ')) { html += `<h3>${trimmed.slice(4)}</h3>`; return; }
        if (trimmed.startsWith('## ')) { html += `<h2>${trimmed.slice(3)}</h2>`; return; }
        if (trimmed.startsWith('# ')) { html += `<h1>${trimmed.slice(2)}</h1>`; return; }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (!inList) { html += '<ul>'; inList = true; }
            html += `<li>${trimmed.slice(2)}</li>`;
            return;
        } else if (inList) { html += '</ul>'; inList = false; }

        let processedLine = trimmed
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/_{3,}/g, '<span class="blank-line"></span>');
        
        html += `<p>${processedLine}</p>`;

        if (/\b(draw|sketch|shade|illustrate)\b/i.test(trimmed.toLowerCase())) {
            html += `<div class="drawing-box"></div>`;
        }
      });
      if (inTable) html += '</table>';
      if (inList) html += '</ul>';
      return html;
    };

    const renderedContent = parseMarkdownToHTML(cleanContent);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Worksheet Print</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @page { size: letter; margin: 0.75in; }
          body { font-family: 'Inter', sans-serif; font-size: 11pt; color: black; line-height: 1.5; margin: 0; padding: 20px; }
          table.header-table { width: 100%; border-bottom: 2px solid black; margin-bottom: 30px; padding-bottom: 10px; border-collapse: collapse; }
          td.header-left { width: 40%; vertical-align: bottom; }
          td.header-right { width: 60%; vertical-align: bottom; text-align: right; }
          .topic-title { font-size: 20pt; font-weight: 800; text-transform: uppercase; margin: 0; line-height: 1.2; }
          .meta-info { font-size: 11pt; font-weight: bold; color: #444; margin-top: 5px; }
          .field-row { margin-bottom: 10px; font-weight: bold; font-size: 11pt; }
          .line { display: inline-block; border-bottom: 1px solid black; }
          .line.long { width: 350px; } 
          .line.med { width: 200px; }
          .line.short { width: 80px; }
          h1 { font-size: 18pt; margin-top: 20px; border-bottom: 1px solid #ccc; }
          h2 { font-size: 14pt; margin-top: 15px; font-weight: bold; }
          h3 { font-size: 12pt; text-transform: uppercase; margin-top: 15px; color: #444; }
          table.content-table { width: 100%; border-collapse: collapse; margin: 15px 0; page-break-inside: avoid; }
          table.content-table td { border: 1px solid black; padding: 8px; vertical-align: top; }
          .drawing-box { height: 300px; border: 2px solid black; margin: 15px 0; background: #fff; page-break-inside: avoid; }
          .blank-line { display: inline-block; min-width: 100px; border-bottom: 1px solid black; }
          ul { padding-left: 20px; margin: 10px 0; }
          li { margin-bottom: 5px; }
          p { margin-bottom: 10px; }
          .footer { margin-top: 50px; text-align: center; font-size: 9pt; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td class="header-left">
               <div class="topic-title">${lessonPlan.topic}</div>
               <div class="meta-info">${lessonPlan.gradeLevel} • ${lessonPlan.subject}</div>
            </td>
            <td class="header-right">
               ${showAnswerKey ? 
                  '<div style="font-size: 16pt; font-weight: bold; border: 3px solid black; padding: 5px 15px; display:inline-block;">ANSWER KEY</div>' : 
                  `
                  <div class="field-row">Name: <span class="line long"></span></div>
                  <div class="field-row">Date: <span class="line med"></span></div>
                  <div class="field-row">Score: <span class="line short"></span> / <span class="line short"></span></div>
                  `
               }
            </td>
          </tr>
        </table>
        <div id="content">${renderedContent}</div>
        <div class="footer">Generated by MaplePrep</div>
      </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 500);
    }
  };

  // --- DRAG HANDLERS ---
  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editingElementId === id) return;
    
    // Calculate position based on percentages
    if (!slideContainerRef.current) return;
    const containerRect = slideContainerRef.current.getBoundingClientRect();

    setSelectedElementId(id);
    setIsDragging(true);
    const currentElements = designElements[currentSlideIdx] || [];
    const element = currentElements.find(el => el.id === id);
    
    if (element) {
        // Convert the element's stored percentage to pixels for drag calculation
        // Default to center (50%) if undefined
        const currentXPercent = element.x ?? 50;
        const currentYPercent = element.y ?? 50;
        
        const pixelX = (currentXPercent / 100) * containerRect.width;
        const pixelY = (currentYPercent / 100) * containerRect.height;
        
        setDragOffset({ x: e.clientX - pixelX, y: e.clientY - pixelY });
    }
  }, [designElements, currentSlideIdx, editingElementId]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && selectedElementId && !editingElementId && slideContainerRef.current) {
        const containerRect = slideContainerRef.current.getBoundingClientRect();
        
        setDesignElements(prev => {
            const currentElements = prev[currentSlideIdx] || [];
            const newElements = currentElements.map(el => {
                if (el.id === selectedElementId) {
                    // Calculate new pixel position relative to container
                    const newPixelX = e.clientX - dragOffset.x;
                    const newPixelY = e.clientY - dragOffset.y;
                    
                    // Convert back to percentages
                    const newPercentX = (newPixelX / containerRect.width) * 100;
                    const newPercentY = (newPixelY / containerRect.height) * 100;
                    
                    return { ...el, x: newPercentX, y: newPercentY };
                }
                return el;
            });
            return { ...prev, [currentSlideIdx]: newElements };
        });
    }
  }, [isDragging, selectedElementId, currentSlideIdx, dragOffset, editingElementId]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
        setIsDragging(false);
        updateLessonWithElements(designElements);
    }
  }, [isDragging, designElements]);

  useEffect(() => {
    if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const addElement = (type: ElementType, content: string = '', color?: string) => {
    const newElement: DraggableElement = {
      id: Date.now().toString(),
      type,
      x: 20, // Start at 20% width
      y: 20, // Start at 20% height
      content: content,
      color: color,
      scale: 1
    };
    const newMap = { ...designElements, [currentSlideIdx]: [...(designElements[currentSlideIdx] || []), newElement] };
    updateLessonWithElements(newMap);
    setSelectedElementId(newElement.id);
    if (type === 'text') setEditingElementId(newElement.id);
    if (type === 'link' || type === 'video') setUrlDialog({ isOpen: true, type, elementId: newElement.id });
  };

  const updateElementContent = (id: string, newContent: string) => {
    setDesignElements(prev => {
        const currentElements = prev[currentSlideIdx] || [];
        const newElements = currentElements.map(el => el.id === id ? { ...el, content: newContent } : el);
        return { ...prev, [currentSlideIdx]: newElements };
    });
  };

  const saveElementContent = () => { updateLessonWithElements(designElements); };
  const deleteElement = (id: string) => {
    const newMap = { ...designElements, [currentSlideIdx]: (designElements[currentSlideIdx] || []).filter(el => el.id !== id) };
    updateLessonWithElements(newMap);
    setSelectedElementId(null);
  };
  const handleUrlSubmit = () => {
      if (urlDialog && urlDialog.elementId) {
          updateElementContent(urlDialog.elementId, urlInputValue);
          const currentElements = designElements[currentSlideIdx] || [];
          const newElements = currentElements.map(el => el.id === urlDialog.elementId ? { ...el, content: urlInputValue } : el);
          updateLessonWithElements({ ...designElements, [currentSlideIdx]: newElements });
      }
      setUrlDialog(null);
      setUrlInputValue('');
  };
  const handleQuizSubmit = () => {
    let score = 0;
    lessonPlan.quiz.forEach((q, idx) => { if (quizAnswers[idx] === q.correctAnswer) score++; });
    setQuizScore(score);
    setShowQuizResult(true);
  };

  const currentSlide = lessonPlan.slides[currentSlideIdx];

  return (
    <div ref={containerRef} className={`flex flex-col bg-slate-100 overflow-hidden shadow-2xl relative transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full rounded-2xl'}`}>
      {/* Design Mode Overlay */}
      {urlDialog && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
                  <h3 className="text-lg font-bold mb-4">Setup {urlDialog.type === 'link' ? 'Link' : 'Video'}</h3>
                  <input type="text" placeholder={urlDialog.type === 'link' ? "https://example.com" : "https://youtube.com/..."} className="w-full p-2 border rounded mb-4" value={urlInputValue} onChange={e => setUrlInputValue(e.target.value)} autoFocus />
                  <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setUrlDialog(null)}>Cancel</Button><Button onClick={handleUrlSubmit}>Save</Button></div>
              </div>
          </div>
      )}

      {/* Quiz Result Modal */}
      {showQuizResult && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full relative">
                  <button onClick={() => setShowQuizResult(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500 shadow-inner"><Trophy className="w-10 h-10 fill-current" /></div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Complete!</h2>
                  <div className="text-5xl font-extrabold text-blue-600 mb-2">{quizScore} / {lessonPlan.quiz.length}</div>
                  <p className="text-slate-500 mb-6 font-medium">{Math.round((quizScore / lessonPlan.quiz.length) * 100)}% Correct</p>
                  <Button onClick={() => setShowQuizResult(false)} className="w-full">Review Answers</Button>
              </div>
          </div>
      )}

      {/* Header - HIDDEN IN FULLSCREEN PRESENTATION MODE */}
      {!isFullscreen && (
        <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0 z-20">
            <div className="flex items-center gap-4">
            <button onClick={onReset} className="p-2 hover:bg-slate-100 rounded-full transition-colors" title="Back to Dashboard"><X className="w-6 h-6 text-slate-500" /></button>
            <div>
                <h1 className="font-bold text-slate-900 leading-tight">{lessonPlan.topic}</h1>
                <p className="text-xs text-slate-500">{lessonPlan.gradeLevel} • {lessonPlan.subject}</p>
            </div>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['slides', 'worksheet', 'activities', 'quiz'] as Tab[]).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize flex items-center gap-2 ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {tab === 'slides' && <MonitorPlay className="w-4 h-4" />}
                {tab === 'worksheet' && <FileText className="w-4 h-4" />}
                {tab === 'activities' && <Briefcase className="w-4 h-4" />}
                {tab === 'quiz' && <ListChecks className="w-4 h-4" />}
                {tab}
                </button>
            ))}
            </div>
            <div className="flex items-center gap-2">
                <button onClick={toggleFullscreen} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"><MonitorPlay className="w-4 h-4" /> Present</button>
                {onSaveCopy && (<button onClick={() => onSaveCopy(lessonPlan)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"><Copy className="w-4 h-4" /> Save Copy</button>)}
                <button className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold"><Save className="w-4 h-4" /> Saved</button>
            </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative flex">
        
        {/* DESIGN MODE TOOLBAR - HIDDEN IN FULLSCREEN */}
        {activeTab === 'slides' && isDesignMode && !isFullscreen && (
             <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 z-30 shadow-xl overflow-visible shrink-0">
                 <div className="mb-2 pb-2 border-b border-slate-100 w-full flex justify-center"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Pencil className="w-5 h-5" /></div></div>
                 
                 <label className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 flex flex-col items-center gap-1 cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => addElement('image', reader.result as string); reader.readAsDataURL(file); } }} />
                    <ImageIcon className="w-6 h-6" /><span className="text-[9px] font-bold">Upload</span>
                 </label>
                 <button onClick={() => addElement('link', 'Link Text')} className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 flex flex-col items-center gap-1" title="Add Link"><LinkIcon className="w-6 h-6" /><span className="text-[9px] font-bold">Link</span></button>
                 <button onClick={() => addElement('video', '')} className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 flex flex-col items-center gap-1" title="Add Video"><Video className="w-6 h-6" /><span className="text-[9px] font-bold">Video</span></button>
             </div>
        )}

        {/* --- MAIN SLIDE VIEW --- */}
        {activeTab === 'slides' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-200 relative">
             <div className={`flex-1 overflow-hidden flex items-center justify-center relative ${isFullscreen ? 'p-0 bg-black' : 'p-8'}`}>
                
                {/* Fullscreen Controls overlay */}
                {isFullscreen && (
                   <div className="absolute top-4 right-4 z-50 flex gap-2">
                       <button onClick={toggleFullscreen} className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm font-bold border border-white/20 transition-all flex items-center gap-2 group">
                          <Minimize className="w-4 h-4" /> Exit Presentation
                       </button>
                   </div>
                )}

                {/* Design Mode Toggle - HIDDEN IN FULLSCREEN */}
                {!isFullscreen && (
                    <div className="absolute top-4 right-4 z-40">
                        <button onClick={() => { setIsDesignMode(!isDesignMode); setSelectedElementId(null); }} className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg font-bold transition-all ${isDesignMode ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
                            {isDesignMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />} {isDesignMode ? 'Finish Design' : 'Design Slide'}
                        </button>
                        {isDesignMode && (<div className="mt-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-lg shadow-lg animate-bounce">Drag & drop active</div>)}
                    </div>
                )}
                
                {/* Slide Container */}
                <div 
                  ref={slideContainerRef} 
                  className={`bg-white overflow-hidden relative flex flex-col ${isFullscreen ? 'shadow-none' : 'w-full aspect-[16/9] max-w-[1600px] shadow-2xl rounded-xl border border-slate-300'}`} 
                  style={isFullscreen ? {
                      width: 'min(100vw, 177.78vh)', 
                      height: 'min(100vh, 56.25vw)',
                      aspectRatio: '16/9'
                  } : {}}
                  onClick={() => { if(isDesignMode) setSelectedElementId(null); }}
                >
                  <div className="flex-1 p-12 flex gap-12 overflow-hidden pointer-events-none">
                     <div className="w-7/12 flex flex-col pointer-events-auto h-full overflow-y-auto pr-4">
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-8 leading-tight shrink-0">{currentSlide.title}</h2>
                        <ul className="space-y-4 mb-8 shrink-0">
                           {currentSlide.bulletPoints.map((point, i) => (<li key={i} className="flex gap-4 text-xl text-slate-700 leading-relaxed"><div className="w-3 h-3 rounded-full bg-red-500 mt-2.5 shrink-0" />{point}</li>))}
                        </ul>
                        {currentSlide.practicalExample && (
                             <div className="mt-auto bg-slate-800 rounded-xl p-5 text-white shadow-lg border-l-4 border-yellow-400 shrink-0">
                                <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-5 h-5 text-yellow-400" /><span className="text-xs font-bold uppercase tracking-widest text-slate-400">Let's Try It Together</span></div>
                                <div className="flex gap-4 items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-lg mb-2 leading-tight">{currentSlide.practicalExample.problem}</div>
                                        <div className="text-sm text-slate-300 space-y-1 mb-3 pl-4 border-l border-slate-600">{currentSlide.practicalExample.solutionSteps.map((step, idx) => (<p key={idx}>{step}</p>))}</div>
                                        {!currentSlide.practicalExample.base64Image && (
                                            <button onClick={() => handleGenerateImage('example')} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors w-fit">{generatingImageTarget === 'example' ? <span className="animate-spin">⌛</span> : <ImageIcon className="w-3 h-3"/>} Generate Diagram</button>
                                        )}
                                    </div>
                                    {currentSlide.practicalExample.base64Image && (
                                        <div className="w-64 h-64 shrink-0 rounded-lg overflow-hidden border border-slate-600 bg-slate-900 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwZjE3MmEiLz48cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzFhMjAzMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')]">
                                            <img src={`data:image/png;base64,${currentSlide.practicalExample.base64Image}`} className="w-full h-full object-contain" alt="Diagram" />
                                        </div>
                                    )}
                                </div>
                             </div>
                        )}
                     </div>
                     <div className="w-5/12 flex flex-col pointer-events-auto h-full gap-4">
                        <div className="bg-slate-100 rounded-2xl flex-1 overflow-hidden relative border border-slate-200 shadow-inner flex items-center justify-center min-h-0">
                           {currentSlide.base64Image ? (
                             <img src={`data:image/png;base64,${currentSlide.base64Image}`} alt="Slide Visual" className="w-full h-full object-contain p-4" />
                           ) : (
                             <div className="text-center p-6"><ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-500 mb-6 text-sm">{currentSlide.imageDescription}</p><Button onClick={() => handleGenerateImage('main')} isLoading={generatingImageTarget === 'main'} variant="secondary" className="shadow-xl"><Wand2 className="w-4 h-4 mr-2" /> Generate AI Image</Button></div>
                           )}
                        </div>
                        <div className={`shrink-0 bg-white rounded-xl border border-slate-300 shadow-sm p-3 relative ${isFullscreen && !currentSlide.imageCaption ? 'hidden' : ''}`}>
                           {isFullscreen ? (
                               <div className="text-center text-2xl font-medium text-slate-800 py-4 font-serif">
                                   {currentSlide.imageCaption}
                               </div>
                           ) : (
                               <textarea 
                                   className="w-full bg-transparent outline-none text-slate-700 text-lg text-center resize-none placeholder:text-slate-300 placeholder:italic"
                                   rows={2}
                                   placeholder="Write a caption for this image..."
                                   value={currentSlide.imageCaption || ''}
                                   onChange={(e) => {
                                       if (onUpdateLesson) {
                                           const updatedSlides = [...lessonPlan.slides];
                                           updatedSlides[currentSlideIdx] = { ...updatedSlides[currentSlideIdx], imageCaption: e.target.value };
                                           onUpdateLesson({ ...lessonPlan, slides: updatedSlides });
                                       }
                                   }}
                               />
                           )}
                       </div>
                     </div>
                  </div>
                  {/* Draggable Elements Layer */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {(designElements[currentSlideIdx] || []).map(el => (
                          <div 
                            key={el.id} 
                            className={`absolute pointer-events-auto group ${selectedElementId === el.id && isDesignMode ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${isDesignMode && !isFullscreen ? (editingElementId === el.id ? 'cursor-text' : 'cursor-grab active:cursor-grabbing') : ''}`} 
                            style={{ 
                                left: `${el.x}%`, 
                                top: `${el.y}%`, 
                                transform: `scale(${el.scale})`, 
                                minWidth: '50px', 
                                minHeight: '50px' 
                            }} 
                            onMouseDown={(e) => isDesignMode && !isFullscreen && handleMouseDown(e, el.id)}
                          >
                              {el.type === 'text' && (
                                  <div 
                                    id={`element-content-${el.id}`}
                                    className={`text-2xl font-bold text-slate-800 p-2 border-2 ${isDesignMode && !isFullscreen ? 'border-dashed border-slate-300 hover:border-blue-400 bg-white/50' : 'border-transparent'}`} 
                                    contentEditable={isDesignMode && !isFullscreen && editingElementId === el.id} 
                                    suppressContentEditableWarning 
                                    onBlur={(e) => { updateElementContent(el.id, e.currentTarget.innerText); saveElementContent(); setEditingElementId(null); }} 
                                    onDoubleClick={(e) => { 
                                        if (isDesignMode && !isFullscreen) {
                                            setEditingElementId(el.id);
                                            e.stopPropagation();
                                        }
                                    }} 
                                    style={{ outline: 'none' }}
                                  >
                                    {el.content}
                                  </div>
                              )}
                              {el.type === 'sticker' && <div className="text-6xl drop-shadow-md">{el.content}</div>}
                              {el.type === 'image' && <img src={el.content} className="max-w-[200px] rounded-lg shadow-lg border-4 border-white" alt="User upload" draggable={false} />}
                              {el.type === 'chart' && (
                                  <div className="w-64 h-40 bg-white border-2 border-slate-800 rounded-lg shadow-lg flex items-center justify-center relative">
                                      {el.content === 'venn' ? (<div className="relative w-full h-full opacity-50"><div className="absolute left-4 top-4 w-32 h-32 rounded-full border-4 border-blue-500 bg-blue-100/50"></div><div className="absolute right-4 top-4 w-32 h-32 rounded-full border-4 border-red-500 bg-red-100/50"></div></div>) : (<div className="w-full h-full flex"><div className="w-1/2 border-r-2 border-slate-800"></div><div className="absolute top-8 w-full border-t-2 border-slate-800"></div></div>)}
                                  </div>
                              )}
                              {el.type === 'link' && (
                                  isDesignMode && !isFullscreen ? (
                                      <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 font-bold flex items-center gap-2" onDoubleClick={() => setUrlDialog({ isOpen: true, type: 'link', elementId: el.id, initialValue: el.content })}><LinkIcon className="w-4 h-4" /> {el.content.length > 20 ? el.content.slice(0, 20) + '...' : el.content}<div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] px-1 rounded">LINK</div></div>
                                  ) : (
                                      <a href={el.content} target="_blank" rel="noopener noreferrer" className="bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-blue-600 font-bold hover:underline flex items-center gap-2 pointer-events-auto"><ExternalLink className="w-4 h-4" /> Open Link</a>
                                  )
                              )}
                              {el.type === 'video' && (
                                  isDesignMode && !isFullscreen ? (
                                      <div className="w-80 h-48 bg-slate-900 rounded-lg flex items-center justify-center text-white border-4 border-slate-700 relative" onDoubleClick={() => setUrlDialog({ isOpen: true, type: 'video', elementId: el.id, initialValue: el.content })}>{el.content ? <PlayCircle className="w-12 h-12 text-red-500" /> : <div className="text-center text-xs text-slate-400">Double click to<br/>add YouTube URL</div>}<div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-1 rounded">VIDEO</div></div>
                                  ) : (
                                      <div className="w-80 h-48 bg-black rounded-xl shadow-2xl overflow-hidden pointer-events-auto">
                                          {el.content && (el.content.includes('youtube') || el.content.includes('youtu.be')) ? (
                                              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${el.content.split('v=')[1]?.split('&')[0] || el.content.split('/').pop()}?controls=1`} title="Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                          ) : (
                                              <a href={el.content} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center text-white hover:bg-white/10 transition-colors"><PlayCircle className="w-12 h-12 mb-2" /><span className="text-xs">Click to Watch</span></a>
                                          )}
                                      </div>
                                  )
                              )}
                              {selectedElementId === el.id && isDesignMode && !isFullscreen && (
                                  <div 
                                    className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-900 p-1 rounded-lg z-50"
                                    onMouseDown={(e) => e.stopPropagation()}
                                  >
                                      {(el.type === 'link' || el.type === 'video') && (<button onClick={(e) => { e.stopPropagation(); setUrlDialog({ isOpen: true, type: el.type, elementId: el.id, initialValue: el.content }); }} className="p-1 hover:bg-slate-700 rounded text-white"><Edit2 className="w-3 h-3"/></button>)}
                                      <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="p-1 hover:bg-red-900 rounded text-red-400"><Trash className="w-3 h-3"/></button>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
                </div>

                {/* Floating Navigation Controls (Visible in Fullscreen) */}
                {isFullscreen && (
                   <div className="absolute bottom-8 right-8 flex items-center gap-4 bg-black/50 backdrop-blur-sm p-2 rounded-full border border-white/20 z-50">
                      <Button onClick={handlePrev} disabled={currentSlideIdx === 0} variant="ghost" className="text-white hover:bg-white/10 rounded-full"><ChevronLeft className="w-6 h-6" /></Button>
                      <span className="text-white font-bold text-sm px-2">{currentSlideIdx + 1} / {lessonPlan.slides.length}</span>
                      <Button onClick={handleNext} disabled={currentSlideIdx === lessonPlan.slides.length - 1} variant="ghost" className="text-white hover:bg-white/10 rounded-full"><ChevronRight className="w-6 h-6" /></Button>
                   </div>
                )}

             </div>
             
             {/* Normal Navigation Footer (Hidden in Fullscreen) */}
             {!isFullscreen && (
                <div className="h-20 bg-white border-t border-slate-200 flex items-center justify-center shrink-0 z-30 relative">
                    <div className="flex items-center gap-4">
                        <Button onClick={handlePrev} disabled={currentSlideIdx === 0} variant="ghost" className="text-slate-500"><ChevronLeft className="w-5 h-5 mr-2" /> Previous</Button>
                        <div className="flex gap-2">{lessonPlan.slides.map((_, idx) => (<button key={idx} onClick={() => setCurrentSlideIdx(idx)} className={`w-3 h-3 rounded-full transition-all ${idx === currentSlideIdx ? 'bg-red-600 scale-125' : 'bg-slate-300 hover:bg-slate-400'}`}/>))}</div>
                        <Button onClick={handleNext} disabled={currentSlideIdx === lessonPlan.slides.length - 1} variant="primary">Next Slide <ChevronRight className="w-5 h-5 ml-2" /></Button>
                    </div>
                </div>
             )}
          </div>
        )}

        {/* --- RIGHT SIDEBAR FOR NOTES & INTERACTION (EDIT MODE) --- */}
        {!isFullscreen && activeTab === 'slides' && (
            <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-lg z-20 overflow-y-auto">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600"/> Teacher Hub</h3>
                    <p className="text-xs text-slate-500 mt-1">Presentation aids & notes</p>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 shadow-sm">
                        <h4 className="text-xs font-bold text-yellow-800 uppercase mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Teacher Notes</h4>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{currentSlide.teacherNotes}</p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 shadow-sm">
                        <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2"><Users className="w-4 h-4"/> Class Interaction</h4>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{currentSlide.suggestedActivity}</p>
                    </div>
                </div>
            </div>
        )}

        {/* --- WORKSHEET TAB --- */}
        {activeTab === 'worksheet' && !isFullscreen && (
          <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex justify-center">
             <div className="w-full max-w-[800px] bg-white shadow-xl min-h-[1000px] p-12 relative group">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => setShowAnswerKey(!showAnswerKey)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded text-xs font-bold border border-slate-300 flex items-center gap-1">
                     {showAnswerKey ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>} 
                     {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
                  </button>
                  <button onClick={handlePrint} className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold hover:bg-slate-800 flex items-center gap-1">
                     <Printer className="w-3 h-3"/> Print
                  </button>
                </div>
                
                {(!lessonPlan.worksheetMarkdown) ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <FileText className="w-16 h-16 mb-4 opacity-50" />
                    <p>No worksheet generated for this lesson.</p>
                  </div>
                ) : (
                  <>
                    <div className="border-b-2 border-black pb-4 mb-8">
                       <h1 className="text-3xl font-bold text-center uppercase mb-2 text-black">{lessonPlan.topic}</h1>
                       <div className="flex justify-between text-sm text-black font-bold">
                         <span>{lessonPlan.gradeLevel} • {lessonPlan.subject}</span>
                         {showAnswerKey && <span className="border-2 border-black px-2 bg-red-100">ANSWER KEY</span>}
                       </div>
                    </div>
                    {showAnswerKey && !lessonPlan.answerSheetMarkdown ? (
                       <div className="p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded text-center">No Answer Key generated for this lesson.</div>
                    ) : (
                       <div id="worksheet-preview-content" className="prose-lg max-w-none text-black">
                         <SimpleMarkdown content={showAnswerKey ? lessonPlan.answerSheetMarkdown! : lessonPlan.worksheetMarkdown} />
                       </div>
                    )}
                  </>
                )}
             </div>
          </div>
        )}

        {/* --- ACTIVITIES TAB --- */}
        {activeTab === 'activities' && !isFullscreen && (
          <div className="flex-1 p-8 overflow-y-auto">
             <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
                   <Lightbulb className="w-8 h-8 text-blue-600 mt-1" />
                   <div><h2 className="text-2xl font-bold text-blue-900 mb-2">Classroom Activities</h2><p className="text-blue-800">Engaging hands-on activities to reinforce the lesson concepts.</p></div>
                </div>
                {lessonPlan.activities.map((activity, i) => (
                   <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex justify-between items-start mb-4">
                         <h3 className="text-xl font-bold text-slate-900">{activity.title}</h3>
                         <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.duration}</span>
                      </div>
                      <p className="text-slate-600 mb-6 leading-relaxed">{activity.description}</p>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                         <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Materials Needed</h4>
                         <div className="flex flex-wrap gap-2">{activity.materials.map((item, j) => (<span key={j} className="bg-white border border-slate-200 px-3 py-1.5 rounded text-sm text-slate-700 font-medium">{item}</span>))}</div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* --- QUIZ TAB --- */}
        {activeTab === 'quiz' && !isFullscreen && (
          <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
             <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-3xl font-bold text-slate-900">Class Quiz</h2>
                   <div className="flex gap-2">
                      <Button onClick={() => { setQuizAnswers({}); setShowQuizResult(false); }} variant="outline"><RefreshCcw className="w-4 h-4 mr-2" /> Reset</Button>
                      <Button onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < lessonPlan.quiz.length}><Check className="w-4 h-4 mr-2" /> Check Answers</Button>
                   </div>
                </div>
                <div className="space-y-6">
                   {lessonPlan.quiz.map((q, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                         <div className="flex gap-4">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold shrink-0">{idx + 1}</span>
                            <div className="flex-1">
                               <p className="text-lg font-medium text-slate-900 mb-4">{q.question}</p>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {q.options.map((option, optIdx) => (
                                     <button key={optIdx} onClick={() => setQuizAnswers(prev => ({ ...prev, [idx]: option }))} className={`p-3 rounded-lg text-left text-sm transition-all border-2 ${quizAnswers[idx] === option ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-sm' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'}`}>
                                        <span className="mr-2 opacity-50 uppercase">{String.fromCharCode(65 + optIdx)}.</span>{option}
                                     </button>
                                  ))}
                               </div>
                            </div>
                         </div>
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
                      </div>
                   ))}
                </div>
             </div>
<<<<<<< HEAD
          )}

          {activeTab === 'quiz' && (
             <div className="w-full h-full max-w-3xl flex flex-col items-center justify-center animate-fadeIn relative p-4">
                {!showQuizResults ? (
                  <div className="w-full bg-white rounded-[2rem] lg:rounded-[3rem] p-8 lg:p-12 shadow-2xl border-4 border-slate-100 flex flex-col relative overflow-hidden max-h-full">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100">
                      <div 
                        className="h-full bg-red-600 transition-all duration-500" 
                        style={{ width: `${((quizIdx + 1) / lessonPlan.quiz.length) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 lg:mb-10">
                      <span className="px-3 py-1.5 lg:px-4 lg:py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Question {quizIdx + 1} of {lessonPlan.quiz.length}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score: {quizScore}</span>
                    </div>

                    <h3 className="text-xl lg:text-3xl font-black text-slate-900 mb-8 lg:mb-12 leading-tight overflow-y-auto no-scrollbar">
                      {lessonPlan.quiz[quizIdx].question}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 overflow-y-auto no-scrollbar">
                      {lessonPlan.quiz[quizIdx].options.map((opt, i) => {
                        const isCorrect = opt === lessonPlan.quiz[quizIdx].correctAnswer;
                        const isSelected = opt === selectedAns;
                        let btnStyle = "bg-slate-50 text-slate-700 border-2 border-slate-100 hover:border-red-500 hover:bg-red-50";
                        
                        if (isAnswering) {
                          if (isCorrect) btnStyle = "bg-green-100 text-green-700 border-green-500 shadow-md scale-[1.02]";
                          else if (isSelected) btnStyle = "bg-red-100 text-red-700 border-red-500 opacity-60";
                          else btnStyle = "bg-white text-slate-300 border-slate-50 opacity-40";
                        }

                        return (
                          <button 
                            key={i} 
                            onClick={() => handleSelectAnswer(opt)}
                            disabled={isAnswering}
                            className={`p-4 lg:p-6 rounded-2xl lg:rounded-3xl text-sm lg:text-lg font-black text-left transition-all flex items-center gap-3 lg:gap-4 ${btnStyle}`}
                          >
                            <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shrink-0 font-mono text-xs lg:text-base ${isSelected ? 'bg-current text-white' : 'bg-white shadow-inner'}`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="flex-1 leading-tight">{opt}</span>
                            {isAnswering && isCorrect && <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />}
                            {isAnswering && isSelected && !isCorrect && <ErrorIcon className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-8 lg:mt-12 flex justify-end shrink-0">
                       {isAnswering && (
                         <button 
                           onClick={handleNextQuiz}
                           className="px-6 py-3 lg:px-10 lg:py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 animate-slideUp shadow-xl text-xs lg:text-base"
                         >
                           {quizIdx < lessonPlan.quiz.length - 1 ? 'Next' : 'Finish'}
                           <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                         </button>
                       )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-xl bg-white rounded-[2rem] lg:rounded-[3rem] p-10 lg:p-16 shadow-2xl text-center border-4 border-slate-100 animate-fadeIn">
                     <div className="w-16 h-16 lg:w-24 lg:h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8 animate-bounce-subtle">
                        <Trophy className="w-8 h-8 lg:w-12 lg:h-12" />
                     </div>
                     <h3 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">Quiz Complete!</h3>
                     <p className="text-lg lg:text-xl text-slate-500 mb-8 lg:mb-10">You got <span className="text-red-600 font-black">{quizScore} / {lessonPlan.quiz.length}</span> correct.</p>
                     
                     <div className="space-y-3 lg:space-y-4">
                        <button 
                          onClick={resetQuiz}
                          className="w-full py-4 lg:py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                          <RefreshCw className="w-5 h-5" /> Restart Quiz
                        </button>
                        <button 
                          onClick={() => setActiveTab('slides')}
                          className="w-full py-4 lg:py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                          Back to Slides
                        </button>
                     </div>
                  </div>
                )}
             </div>
          )}
        </div>

        {/* NOTES SIDEBAR - Overlay updates for better visibility */}
        {showNotes && (
          <div className={`${isFullscreen ? 'fixed inset-y-0 right-0 w-80 sm:w-96 bg-white/98 backdrop-blur-3xl border-l-4 border-red-600 shadow-[-20px_0_60px_rgba(0,0,0,0.5)]' : 'w-80 bg-white border-l shadow-[-10px_0_15px_rgba(0,0,0,0.05)]'} p-8 overflow-y-auto z-[100] animate-slideLeft no-scrollbar shrink-0 h-full`}>
             <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-red-500"/> Teacher Guide</h3>
                <button onClick={() => setShowNotes(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400"/></button>
             </div>
             <div className="space-y-10">
                <div>
                   <h4 className="text-[11px] font-black uppercase text-red-600 tracking-[0.1em] mb-3 flex items-center gap-2">
                     <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                     Teacher Script
                   </h4>
                   <div className="bg-red-50 p-6 rounded-2xl border border-red-100 font-bold text-base text-slate-800 italic break-words leading-relaxed shadow-inner">"{currentSlide.teacherNotes}"</div>
                </div>
                <div>
                   <h4 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.1em] mb-3">Slide Activity</h4>
                   <p className="text-base font-bold bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-900 break-words shadow-inner">{currentSlide.suggestedActivity}</p>
                </div>
                <div>
                   <h4 className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.1em] mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Personal Notes</h4>
                   <textarea className="w-full p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-base font-medium text-emerald-900 outline-none focus:ring-4 focus:ring-emerald-500/10 resize-none min-h-[200px] shadow-inner" placeholder="Type your own notes here..." value={currentSlide.personalNotes || ''} onChange={(e) => handleUpdatePersonalNotes(e.target.value)} />
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className={`p-4 bg-white border-t flex justify-between items-center px-6 sm:px-10 shrink-0 z-30 ${isFullscreen ? 'sticky bottom-0 left-0 right-0 border-none bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.1)]' : ''}`}>
         <button onClick={() => setShowNotes(!showNotes)} className={`px-4 sm:px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-md ${showNotes ? 'bg-red-600 text-white border-red-600' : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-red-600 hover:text-red-600'}`}>
            {showNotes ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>} 
            {showNotes ? 'Hide Teacher Guide' : 'Show Teacher Guide'}
         </button>
         <div className="hidden sm:flex gap-2">
            {lessonPlan.slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlideIdx(i)} className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all border ${currentSlideIdx === i ? 'bg-red-600 border-red-600 scale-150 shadow-md' : 'bg-slate-200 border-slate-200 hover:bg-slate-300'}`}></button>
            ))}
         </div>
         <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 shadow-inner">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{currentSlideIdx + 1} / {lessonPlan.slides.length}</span>
         </div>
      </div>
    </div>
  );
};
=======
          </div>
        )}

      </div>
    </div>
  );
};
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
