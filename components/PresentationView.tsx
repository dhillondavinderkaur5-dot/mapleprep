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
} from 'lucide-react';

interface PresentationViewProps {
  lessonPlan: LessonPlan;
  onReset: () => void;
  onUpdateLesson?: (plan: LessonPlan) => void;
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
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
                      </div>
                   ))}
                </div>
             </div>
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