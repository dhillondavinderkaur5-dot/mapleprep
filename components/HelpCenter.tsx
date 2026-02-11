
import React, { useState } from 'react';
import { X, Send, LifeBuoy, AlertCircle, MessageSquare, Bug, CreditCard, Sparkles, CheckCircle } from 'lucide-react';
import { FeedbackType, SystemFeedback, UserProfile } from '../types';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose, user }) => {
  const [type, setType] = useState<FeedbackType>('support');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFeedback: SystemFeedback = {
      id: crypto.randomUUID(),
      userName: user.name,
      userEmail: user.email,
      type: type,
      priority: priority,
      subject: subject,
      content: message,
      status: 'open',
      date: new Date().toISOString()
    };

    // Save to local storage for Admin to see
    const existing = JSON.parse(localStorage.getItem('mapleprep_feedback') || '[]');
    localStorage.setItem('mapleprep_feedback', JSON.stringify([newFeedback, ...existing]));

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setMessage('');
      setSubject('');
    }, 2500);
  };

  const categories: { id: FeedbackType; label: string; icon: React.ReactNode }[] = [
    { id: 'support', label: 'Technical Support', icon: <LifeBuoy className="w-4 h-4" /> },
    { id: 'bug', label: 'Report a Bug', icon: <Bug className="w-4 h-4" /> },
    { id: 'feature', label: 'Feature Request', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing Issue', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'praise', label: 'General Feedback', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-2xl font-black mb-1">Help & Support</h2>
              <p className="text-slate-400 text-sm font-medium italic">How can we assist you today, {user.name.split(' ')[0]}?</p>
           </div>
           <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
           </button>
           <LifeBuoy className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
        </div>

        {isSubmitted ? (
          <div className="p-20 text-center animate-fadeIn">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">Ticket Submitted!</h3>
             <p className="text-slate-500">Our team will review your request and get back to you at <strong>{user.email}</strong> shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Issue Category</label>
                  <div className="space-y-2">
                     {categories.map(cat => (
                        <button 
                           key={cat.id}
                           type="button"
                           onClick={() => setType(cat.id)}
                           className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${type === cat.id ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                        >
                           {cat.icon}
                           {cat.label}
                        </button>
                     ))}
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Urgency</label>
                     <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        {(['low', 'medium', 'high'] as const).map(p => (
                           <button 
                              key={p}
                              type="button"
                              onClick={() => setPriority(p)}
                              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${priority === p ? (p === 'high' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-900 text-white') : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
                           >
                              {p}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Brief Subject</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Worksheet rendering error"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-3">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Description</label>
               <textarea 
                  required
                  rows={4}
                  placeholder="Please provide as much detail as possible..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-500 focus:bg-white outline-none transition-all resize-none text-slate-700 leading-relaxed"
               />
            </div>

            <div className="pt-4 flex gap-3">
               <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
               >
                  Discard
               </button>
               <button 
                  type="submit"
                  className="flex-[2] py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-xl shadow-red-200 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
               >
                  <Send className="w-5 h-5" /> Submit Request
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
