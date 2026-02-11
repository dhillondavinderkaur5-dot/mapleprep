import React, { useState } from 'react';
import { GRADES, PROVINCES, SUBJECTS, SUBJECT_TEMPLATES } from '../constants';
import { GenerationParams, GradeLevel, Province, Subject, PresentationTheme, LessonStructure } from '../types';
import { Button } from './Button';
import { BookOpen, MapPin, GraduationCap, Sparkles, LayoutTemplate, School, ChevronDown, ChevronUp, Layers, Palette, Leaf, Type, Monitor, Hammer, Presentation, Layout, ArrowLeft } from 'lucide-react';

interface PresentationFormProps {
  onSubmit: (params: GenerationParams) => void;
  onCancel?: () => void;
  isLoading: boolean;
}

export const PresentationForm: React.FC<PresentationFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState<GradeLevel>(GradeLevel.G3);
  const [province, setProvince] = useState<Province>(Province.ON);
  const [subject, setSubject] = useState<Subject>(Subject.Math);
  const [slideCount, setSlideCount] = useState<number>(8);
  const [theme, setTheme] = useState<PresentationTheme>('classic');
  const [structure, setStructure] = useState<LessonStructure>('standard');
  const [isContextOpen, setIsContextOpen] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSubmit({ topic, grade, province, subject, slideCount, theme, structure });
    }
  };

  const templates = SUBJECT_TEMPLATES[subject] || [];

  const themes: { id: PresentationTheme; name: string; description: string; icon: React.ReactNode; color: string }[] = [
    { id: 'classic', name: 'Classic Maple', description: 'Clean, professional.', icon: <LayoutTemplate className="w-5 h-5"/>, color: 'bg-white border-slate-200' },
    { id: 'chalkboard', name: 'Chalkboard', description: 'Dark mode style.', icon: <Monitor className="w-5 h-5"/>, color: 'bg-slate-800 text-white border-slate-700' },
    { id: 'playful', name: 'Playful', description: 'Fun fonts & colors.', icon: <Sparkles className="w-5 h-5"/>, color: 'bg-yellow-50 border-yellow-200' },
    { id: 'nature', name: 'Natural Leaf', description: 'Organic & calm.', icon: <Leaf className="w-5 h-5"/>, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  ];

  const structures: { id: LessonStructure; name: string; description: string; icon: React.ReactNode }[] = [
    { id: 'standard', name: 'Standard Mix', description: 'Balanced info & activities.', icon: <Layout className="w-5 h-5"/> },
    { id: 'lecture', name: 'Lecture Focus', description: 'Deep dive content & definitions.', icon: <Presentation className="w-5 h-5"/> },
    { id: 'workshop', name: 'Workshop', description: 'Minimal text, heavy practice.', icon: <Hammer className="w-5 h-5"/> },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {onCancel && (
        <button 
          onClick={onCancel} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Plan Your Lesson
          </h2>
          <p className="text-red-100">Aligning with Canadian curriculum standards automatically.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="space-y-4">
            <label className="block text-xl font-bold text-slate-900">
              What do you want to teach?
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Grade 2 – life cycles – 30 min lesson"
                className="w-full text-lg p-5 pl-14 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none shadow-sm placeholder:text-slate-300"
                required
              />
              <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500 w-6 h-6 pointer-events-none" />
            </div>
            <p className="text-sm text-slate-500 pl-2">
              Tip: You can type things like "Grade 5 fractions quiz" or "Social Studies map activity"
            </p>

            {templates.length > 0 && (
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4" />
                  Or try a quick start topic:
                </label>
                
                <div className="flex flex-wrap gap-2">
                  {templates.slice(0, 5).map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => setTopic(template)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-2 ${
                        topic === template
                        ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500'
                        : 'border-slate-200 hover:border-red-300 hover:bg-white hover:text-red-600 text-slate-600 bg-slate-50'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
             <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 mb-4">
                    <Palette className="w-4 h-4" /> Visual Style
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {themes.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        className={`relative p-3 rounded-xl border-2 text-left transition-all h-full flex flex-col ${theme === t.id ? 'ring-2 ring-red-500 ring-offset-1 border-red-500' : 'hover:border-slate-300'} ${t.color}`}
                    >
                        <div className="mb-2">{t.icon}</div>
                        <div className="font-bold text-sm mb-0.5">{t.name}</div>
                        <div className="text-[10px] opacity-70 leading-tight">{t.description}</div>
                        {theme === t.id && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-0.5">
                            <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                    </button>
                    ))}
                </div>
             </div>

             <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 mb-4">
                    <Layout className="w-4 h-4" /> Lesson Structure
                </h3>
                <div className="space-y-3">
                    {structures.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => setStructure(s.id)}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${structure === s.id ? 'ring-2 ring-blue-500 ring-offset-1 border-blue-500 bg-blue-50' : 'hover:border-slate-300 bg-white border-slate-200'}`}
                    >
                        <div className={`p-2 rounded-lg ${structure === s.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                            {s.icon}
                        </div>
                        <div className="flex-1">
                            <div className={`font-bold text-sm ${structure === s.id ? 'text-blue-900' : 'text-slate-800'}`}>{s.name}</div>
                            <div className={`text-[10px] leading-tight ${structure === s.id ? 'text-blue-700' : 'text-slate-500'}`}>{s.description}</div>
                        </div>
                        {structure === s.id && (
                            <div className="bg-blue-500 text-white rounded-full p-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                    </button>
                    ))}
                </div>
             </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
             <div 
               className="flex items-center justify-between mb-4 cursor-pointer group" 
               onClick={() => setIsContextOpen(!isContextOpen)}
             >
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 group-hover:text-slate-700">
                  <School className="w-4 h-4" />
                  Refine Context
                </h3>
                {isContextOpen ? <ChevronUp className="w-4 h-4 text-slate-400"/> : <ChevronDown className="w-4 h-4 text-slate-400"/>}
             </div>
             
             {isContextOpen && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 animate-fadeIn">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Province</label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value as Province)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none cursor-pointer hover:border-red-300 text-sm"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Grade Level</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as GradeLevel)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none cursor-pointer hover:border-red-300 text-sm"
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as Subject)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none cursor-pointer hover:border-red-300 text-sm"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400"/> Slide Count
                    </label>
                    <input 
                      type="number" 
                      min="3" 
                      max="20" 
                      value={slideCount}
                      onChange={(e) => setSlideCount(Math.min(20, Math.max(3, parseInt(e.target.value) || 8)))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
                    />
                  </div>
               </div>
             )}
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full text-lg py-4 font-bold shadow-lg shadow-red-600/20 active:scale-[0.99] transition-transform" 
              isLoading={isLoading}
            >
              Generate Lesson Kit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};