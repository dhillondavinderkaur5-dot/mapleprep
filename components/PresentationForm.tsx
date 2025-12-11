
import React, { useState } from 'react';
import { GRADES, PROVINCES, SUBJECTS, SUBJECT_TEMPLATES } from '../constants';
import { GenerationParams, GradeLevel, Province, Subject } from '../types';
import { Button } from './Button';
import { BookOpen, MapPin, GraduationCap, Sparkles, LayoutTemplate, School, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface PresentationFormProps {
  onSubmit: (params: GenerationParams) => void;
  isLoading: boolean;
}

export const PresentationForm: React.FC<PresentationFormProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState<GradeLevel>(GradeLevel.G3);
  const [province, setProvince] = useState<Province>(Province.ON);
  const [subject, setSubject] = useState<Subject>(Subject.Math);
  const [slideCount, setSlideCount] = useState<number>(8);
  const [isContextOpen, setIsContextOpen] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit({ topic, grade, province, subject, slideCount });
    }
  };

  const templates = SUBJECT_TEMPLATES[subject] || [];

  return (
    <div className="max-w-4xl mx-auto">
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

            {/* Template Selector based on Subject */}
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
