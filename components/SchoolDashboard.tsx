<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { TeacherProfile, SubscriptionDetails, Announcement, AnnouncementAudience, UserProfile } from '../types';
import { Users, CheckCircle, BarChart3, Shield, Mail, Trash2, Search, Plus, X, GraduationCap, BookOpen, CreditCard, Calendar, Download, AlertTriangle, FileText, Clock, Image as ImageIcon, Lock, Bell, MessageSquare, Send, User, Filter, CheckSquare, Square, LifeBuoy, UserCheck, Loader2, Key, Check, UserPlus, Users2, Cloud, TrendingUp, History, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { HelpCenter } from './HelpCenter';
import { generateWelcomeEmail } from '../services/geminiService';
import { isFirebaseReady } from '../services/firebase';
=======

import React, { useState } from 'react';
import { TeacherProfile, SubscriptionDetails } from '../types';
import { Users, CheckCircle, BarChart3, Shield, Mail, Trash2, Search, Plus, X, GraduationCap, BookOpen, CreditCard, Calendar, Download, AlertTriangle, FileText, Clock } from 'lucide-react';
import { Button } from './Button';
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03

interface SchoolDashboardProps {
  schoolName: string;
  teachers: TeacherProfile[];
  onAddTeacher: (teacher: TeacherProfile) => void;
  onUpdateTeacherStatus: (id: string, status: 'active' | 'pending') => void;
  onDeleteTeacher: (id: string) => void;
  subscription?: SubscriptionDetails;
  onUpdateSubscription?: (updates: Partial<SubscriptionDetails>) => void;
<<<<<<< HEAD
  onOpenBillingPortal?: () => Promise<void>;
=======
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
}

export const SchoolDashboard: React.FC<SchoolDashboardProps> = ({ 
  schoolName, 
  teachers,
  onAddTeacher,
  onUpdateTeacherStatus,
  onDeleteTeacher,
  subscription,
<<<<<<< HEAD
  onUpdateSubscription,
  onOpenBillingPortal
}) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'billing' | 'announcements'>('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isAddingInProgress, setIsAddingInProgress] = useState(false);
  const [lastAddedTeacher, setLastAddedTeacher] = useState<{name: string, email: string, pass: string, emailPreview: string} | null>(null);
  
  const adminProfile: UserProfile = {
    id: 'school-admin-' + (schoolName || 'unknown'),
    name: (schoolName || 'School') + ' Admin',
    email: 'admin@' + (schoolName || 'school').toLowerCase().replace(/\s/g, '') + '.ca',
    type: 'school'
  };

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('mapleprep_announcements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mapleprep_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetAudience: 'all' as AnnouncementAudience,
    targetTeacherIds: [] as string[]
  });

=======
  onUpdateSubscription
}) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'billing'>('staff');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add Teacher Modal State
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
<<<<<<< HEAD
    role: 'teaching' as 'teaching' | 'non-teaching'
  });

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingInProgress(true);
    try {
      const tempPass = Math.random().toString(36).slice(-8);
      const emailContent = await generateWelcomeEmail(newTeacher.name, schoolName, newTeacher.email, tempPass);
      const teacher: TeacherProfile = {
        id: Date.now().toString(),
        name: newTeacher.name,
        email: newTeacher.email,
        role: newTeacher.role,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        lessonsCreated: 0
      };
      onAddTeacher(teacher);
      setLastAddedTeacher({ name: newTeacher.name, email: newTeacher.email, pass: tempPass, emailPreview: emailContent });
      setNewTeacher({ name: '', email: '', role: 'teaching' });
      setIsAddModalOpen(false);
    } catch (error) {
      alert("Error adding staff.");
    } finally {
      setIsAddingInProgress(false);
    }
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for selected audience
    if (newAnnouncement.targetAudience === 'selected' && newAnnouncement.targetTeacherIds.length === 0) {
      alert("Please select at least one staff member.");
      return;
    }

    const announcement: Announcement = {
      id: crypto.randomUUID(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      date: new Date().toISOString(),
      priority: newAnnouncement.priority,
      author: schoolName + " Admin",
      targetAudience: newAnnouncement.targetAudience,
      targetTeacherIds: newAnnouncement.targetAudience === 'selected' ? newAnnouncement.targetTeacherIds : undefined
    };
    setAnnouncements([announcement, ...announcements]);
    setIsAnnouncementModalOpen(false);
    setNewAnnouncement({ title: '', content: '', priority: 'medium', targetAudience: 'all', targetTeacherIds: [] });
  };

  const toggleTeacherSelection = (id: string) => {
    setNewAnnouncement(prev => {
      const isSelected = prev.targetTeacherIds.includes(id);
      if (isSelected) {
        return { ...prev, targetTeacherIds: prev.targetTeacherIds.filter(tId => tId !== id) };
      } else {
        return { ...prev, targetTeacherIds: [...prev.targetTeacherIds, id] };
      }
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm("Delete this announcement?")) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const filteredStaff = teachers.filter(t => 
    (t.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (t.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn relative">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{schoolName} Admin</h1>
            <p className="text-slate-500">School-wide resource and staff management.</p>
          </div>
          <div className="mt-1 flex items-center gap-2">
             {isFirebaseReady ? (
               <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase border border-green-200 shadow-sm">
                 <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                 Cloud Active
               </div>
             ) : (
               <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase border border-amber-200 shadow-sm">
                 <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                 Local Mode
               </div>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setIsHelpOpen(true)} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors">
            <LifeBuoy className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:block">Admin Help</span>
          </button>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['staff', 'announcements', 'billing'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize flex items-center gap-2 ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
              >
                {tab === 'staff' && <Users className="w-4 h-4" />}
                {tab === 'announcements' && <Bell className="w-4 h-4" />}
                {tab === 'billing' && <CreditCard className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'staff' && (
        <div className="animate-fadeIn space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Staff</h3>
              <p className="text-3xl font-black text-slate-900">{teachers.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Teachers</h3>
              <p className="text-3xl font-black text-slate-900">{teachers.filter(t => t.status === 'active').length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Lessons Created</h3>
              <p className="text-3xl font-black text-slate-900">{teachers.reduce((sum, t) => sum + t.lessonsCreated, 0)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
             <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input type="text" placeholder="Search staff..." className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}><Plus className="w-4 h-4 mr-2"/> Add Staff Member</Button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr><th className="px-6 py-4">Name & Contact</th><th className="px-6 py-4">Staff Category</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Usage</th><th className="px-6 py-4 text-right">Actions</th></tr>
                   </thead>
                   <tbody className="divide-y">
                      {filteredStaff.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{t.name}</div>
                              <div className="text-xs text-slate-400">{t.email}</div>
                           </td>
                           <td className="px-6 py-4">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${t.role === 'teaching' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                                 {t.role === 'teaching' ? <GraduationCap className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                 {t.role === 'teaching' ? 'Teaching Staff' : 'Non-Teaching'}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'active' ? 'bg-green-600' : 'bg-amber-600'}`}></div>
                                 {t.status}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                 <div className="text-sm font-bold text-slate-700">{t.lessonsCreated}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Lessons</div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                 <button onClick={() => onDeleteTeacher(t.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                      {filteredStaff.length === 0 && (
                        <tr>
                           <td colSpan={5} className="py-20 text-center text-slate-400 italic">No staff members match your search.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="animate-fadeIn space-y-6">
           <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
              <div>
                 <h2 className="text-xl font-bold text-slate-900">School Announcements</h2>
                 <p className="text-sm text-slate-500">Post updates that will appear on every teacher's dashboard.</p>
              </div>
              <Button onClick={() => setIsAnnouncementModalOpen(true)}><Plus className="w-4 h-4 mr-2"/> Post Update</Button>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {announcements.map(a => (
                <div key={a.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group">
                   <div className={`w-2 shrink-0 ${a.priority === 'high' ? 'bg-red-500' : a.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                   <div className="p-6 flex-1 flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${a.priority === 'high' ? 'bg-red-50 text-red-700' : a.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                               {a.priority} Priority
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                               <Calendar className="w-3 h-3" /> {new Date(a.date).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                               <Users className="w-3 h-3" /> {a.targetAudience === 'all' ? 'All Staff' : a.targetAudience === 'teaching' ? 'Teaching Staff' : a.targetAudience === 'non-teaching' ? 'Non-Teaching Only' : 'Selected Staff'}
                            </span>
                         </div>
                         <h3 className="text-lg font-bold text-slate-900 mb-2">{a.title}</h3>
                         <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{a.content}</p>
                         {a.targetAudience === 'selected' && a.targetTeacherIds && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 self-center">Recipients:</span>
                               {a.targetTeacherIds.map(id => {
                                  const t = teachers.find(teach => teach.id === id);
                                  return t ? <span key={id} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">{t.name}</span> : null;
                               })}
                            </div>
                         )}
                      </div>
                      <div className="flex md:flex-col justify-end gap-2">
                         <button onClick={() => handleDeleteAnnouncement(a.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                   </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="py-24 bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                   <Bell className="w-16 h-16 mb-4 opacity-20" />
                   <p className="font-bold uppercase tracking-widest">No active announcements.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="animate-fadeIn space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                 <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                       <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 text-xs font-black uppercase tracking-widest mb-6">
                          <Shield className="w-4 h-4 text-blue-400" /> Active School Plan
                       </div>
                       <h2 className="text-4xl font-black mb-2">{schoolName}</h2>
                       <p className="text-slate-400 text-lg mb-8">Professional educator tools for your entire district.</p>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Cycle</p>
                                   <p className="text-xl font-bold">Monthly</p>
                                </div>
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Calendar className="w-5 h-5"/></div>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="opacity-60 font-medium">Next payment on</span>
                                <span className="font-bold text-blue-400">June 15, 2025</span>
                             </div>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Cost</p>
                                   <p className="text-xl font-bold">$139.00</p>
                                </div>
                                <div className="p-2 bg-green-500/20 text-green-400 rounded-lg"><CreditCard className="w-5 h-5"/></div>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="opacity-60 font-medium">Payment Method</span>
                                <span className="font-bold flex items-center gap-1.5"><div className="w-6 h-4 bg-white/10 rounded flex items-center justify-center text-[8px] font-black">VISA</div> •••• 4242</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-col sm:flex-row gap-4">
                          <button 
                            onClick={onOpenBillingPortal}
                            className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-xl"
                          >
                             <Key className="w-5 h-5" /> Manage Billing Portal
                          </button>
                          <button className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/10 flex items-center justify-center gap-3">
                             View Plan Features
                          </button>
                       </div>
                    </div>
                    <Cloud className="absolute -bottom-20 -right-20 w-80 h-80 text-white/5" />
                 </div>

                 <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                       <h2 className="text-xl font-black">Invoice History</h2>
                       <button className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">Download All</button>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <tr><th className="px-8 py-4">Invoice #</th><th className="px-8 py-4">Date</th><th className="px-8 py-4">Amount</th><th className="px-8 py-4">Status</th><th className="px-8 py-4 text-right">PDF</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {[1, 2, 3].map(i => (
                               <tr key={i} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-8 py-5 text-sm font-mono text-slate-500">INV-2025-00{i}</td>
                                  <td className="px-8 py-5 text-sm text-slate-600">May {15 - i}, 2025</td>
                                  <td className="px-8 py-5 text-sm font-black text-slate-900">$139.00</td>
                                  <td className="px-8 py-5 text-sm">
                                     <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-tight">Paid</span>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                     <button className="p-2 text-slate-400 hover:text-blue-600"><Download className="w-4 h-4"/></button>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="p-2.5 bg-red-100 text-red-600 rounded-xl"><ImageIcon className="w-6 h-6" /></div>
                       <h3 className="text-lg font-black">Image Generation</h3>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Monthly Usage</p>
                          <p className="text-sm font-black">412 <span className="text-slate-400">/ 1,000</span></p>
                       </div>
                       <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600 w-[41.2%] rounded-full shadow-sm"></div>
                       </div>
                       <p className="text-xs text-slate-500 leading-relaxed italic">Your staff have generated 412 curriculum-aligned visuals this month across all active project files.</p>
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><Users2 className="w-6 h-6" /></div>
                       <h3 className="text-lg font-black">Seat Licenses</h3>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teachers Enrolled</p>
                          <p className="text-sm font-black">{teachers.length} <span className="text-slate-400">/ 50</span></p>
                       </div>
                       <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 w-[24%] rounded-full shadow-sm"></div>
                       </div>
                       <div className="pt-2">
                          <button onClick={() => setActiveTab('staff')} className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest flex items-center gap-2">
                             Add more seats <ArrowRight className="w-3 h-3" />
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl">
                    <h3 className="text-xl font-black mb-4">Dedicated Support</h3>
                    <p className="text-blue-100 text-sm leading-relaxed mb-6">As a School Plan member, you have a dedicated account manager to assist with onboarding and integration.</p>
                    <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                       Contact Manager
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Help Center Component */}
      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} user={adminProfile} />
      
      {/* Invite Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
           <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative border border-slate-200">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              <div className="mb-6">
                 <h2 className="text-2xl font-black text-slate-900 mb-1">Invite Staff</h2>
                 <p className="text-sm text-slate-500">Invitation emails will include temporary credentials.</p>
              </div>
              <form onSubmit={handleAddTeacherSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff Member Name</label>
                     <input type="text" required placeholder="e.g. Sarah Jenkins" className="w-full border-2 border-slate-100 rounded-xl p-4 font-bold focus:border-red-500 outline-none transition-all" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email Address</label>
                     <input type="email" required placeholder="name@school.ca" className="w-full border-2 border-slate-100 rounded-xl p-4 font-bold focus:border-red-500 outline-none transition-all" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teacher Type</label>
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                         type="button" 
                         onClick={() => setNewTeacher({...newTeacher, role: 'teaching'})}
                         className={`py-4 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2 ${newTeacher.role === 'teaching' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-100 text-slate-500'}`}
                       >
                         <GraduationCap className="w-4 h-4" /> Teaching
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setNewTeacher({...newTeacher, role: 'non-teaching'})}
                         className={`py-4 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2 ${newTeacher.role === 'non-teaching' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-100 text-slate-500'}`}
                       >
                         <UserCheck className="w-4 h-4" /> Non-Teaching
                       </button>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" className="w-full py-5 text-lg font-black shadow-xl" isLoading={isAddingInProgress}>Send invitation</Button>
                  </div>
              </form>
           </div>
        </div>
      )}

      {/* Announcement Modal */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
           <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative border border-slate-200">
              <button onClick={() => setIsAnnouncementModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              <div className="mb-6">
                 <h2 className="text-2xl font-black text-slate-900 mb-1">New Announcement</h2>
                 <p className="text-sm text-slate-500">This will be broadcast to the selected staff dashboards.</p>
              </div>
              <form onSubmit={handleAddAnnouncement} className="space-y-5">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                     <input type="text" required placeholder="e.g. Field Trip Reminder" className="w-full border-2 border-slate-100 rounded-xl p-4 font-bold focus:border-red-500 outline-none transition-all" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                     <textarea required rows={4} placeholder="Write your message here..." className="w-full border-2 border-slate-100 rounded-xl p-4 font-medium focus:border-red-500 outline-none transition-all resize-none" value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                        <select className="w-full border-2 border-slate-100 rounded-xl p-4 font-bold text-sm bg-slate-50" value={newAnnouncement.priority} onChange={e => setNewAnnouncement({...newAnnouncement, priority: e.target.value as any})}>
                           <option value="low">Low</option>
                           <option value="medium">Medium</option>
                           <option value="high">High</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Audience</label>
                        <select className="w-full border-2 border-slate-100 rounded-xl p-4 font-bold text-sm bg-slate-50" value={newAnnouncement.targetAudience} onChange={e => setNewAnnouncement({...newAnnouncement, targetAudience: e.target.value as any})}>
                           <option value="all">All Staff</option>
                           <option value="teaching">Teaching Only</option>
                           <option value="non-teaching">Non-Teaching Only</option>
                           <option value="selected">Selected Staff</option>
                        </select>
                     </div>
                  </div>

                  {/* Individual Teacher Selection */}
                  {newAnnouncement.targetAudience === 'selected' && (
                    <div className="space-y-1.5 animate-fadeIn">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                          Select Recipients
                          <span className="text-red-600 normal-case">{newAnnouncement.targetTeacherIds.length} selected</span>
                       </label>
                       <div className="border-2 border-slate-100 rounded-xl bg-slate-50 p-3 max-h-48 overflow-y-auto space-y-2">
                          {teachers.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-4">No staff members available to select.</p>
                          ) : (
                            teachers.map(teacher => (
                              <button
                                key={teacher.id}
                                type="button"
                                onClick={() => toggleTeacherSelection(teacher.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${newAnnouncement.targetTeacherIds.includes(teacher.id) ? 'bg-white border-red-500 shadow-sm' : 'bg-transparent border-transparent hover:border-slate-200'}`}
                              >
                                <div className="text-left">
                                   <p className={`text-sm font-bold ${newAnnouncement.targetTeacherIds.includes(teacher.id) ? 'text-red-700' : 'text-slate-700'}`}>{teacher.name}</p>
                                   <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{teacher.role}</p>
                                </div>
                                {newAnnouncement.targetTeacherIds.includes(teacher.id) ? (
                                  <div className="bg-red-500 text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>
                                ) : (
                                  <div className="w-4 h-4 rounded border border-slate-300"></div>
                                )}
                              </button>
                            ))
                          )}
                       </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button type="submit" className="w-full py-5 text-lg font-black shadow-xl"><Send className="w-5 h-5 mr-2" /> Post Announcement</Button>
                  </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
=======
    subject: '',
    grade: ''
  });

  // Helper for date formatting (e.g. "Dec 13, 2025")
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    // Use UTC to prevent day shifting due to timezone differences on YYYY-MM-DD strings
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this teacher record? This action cannot be undone.")) {
      onDeleteTeacher(id);
    }
  };

  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher: TeacherProfile = {
      id: Date.now().toString(),
      name: newTeacher.name,
      email: newTeacher.email,
      subject: newTeacher.subject,
      grade: newTeacher.grade,
      status: 'pending',
      joinedDate: new Date().toISOString().split('T')[0],
      lessonsCreated: 0
    };
    
    onAddTeacher(teacher);
    setIsAddModalOpen(false);
    setNewTeacher({ name: '', email: '', subject: '', grade: '' });
    
    alert(`Invitation sent to ${newTeacher.email}. They can now sign up.`);
  };

  const handleCancelSubscription = () => {
    if (confirm("Are you sure you want to cancel your school's subscription? This will downgrade all teacher accounts at the end of the billing cycle.")) {
      if (onUpdateSubscription) {
          const endDate = subscription?.nextBillingDate || new Date().toISOString().split('T')[0];
          onUpdateSubscription({
              status: 'cancelled',
              nextBillingDate: endDate // Keep the billing date as the expiry date
          });
          alert(`Subscription cancelled. Access will remain active until ${formatDate(endDate)}.`);
      } else {
          alert("Subscription cancellation scheduled for end of billing period.");
      }
    }
  };

  const activeTeachers = teachers.filter(t => t.status === 'active').length;
  const pendingTeachers = teachers.filter(t => t.status === 'pending').length;
  const totalLessons = teachers.reduce((acc, t) => acc + t.lessonsCreated, 0);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isTrial = subscription?.status === 'trial';
  const isCancelled = subscription?.status === 'cancelled';
  
  // Calculate days remaining
  const getTrialDaysLeft = () => {
    if (!subscription?.trialEndDate) return 0;
    const end = new Date(subscription.trialEndDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn relative">
      
      {/* Trial Banner */}
      {isTrial && !isCancelled && (
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white p-4 rounded-xl shadow-lg mb-8 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg"><Clock className="w-6 h-6"/></div>
              <div>
                 <h3 className="font-bold text-lg">Trial Mode Active</h3>
                 <p className="text-yellow-100 text-sm">You have <strong>{getTrialDaysLeft()} days remaining</strong> in your free trial. Full access enabled.</p>
              </div>
           </div>
           <div className="text-right text-xs bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              Auto-charge on<br/><span className="font-bold text-white text-sm">{formatDate(subscription?.nextBillingDate)}</span>
           </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 rounded-xl shadow-lg mb-8 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg"><AlertTriangle className="w-6 h-6"/></div>
              <div>
                 <h3 className="font-bold text-lg">Subscription Cancelled</h3>
                 <p className="text-slate-300 text-sm">Your access will remain active until the end of the billing period.</p>
              </div>
           </div>
           <div className="text-right text-xs bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              Expires on<br/><span className="font-bold text-white text-sm">{formatDate(subscription?.nextBillingDate)}</span>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{schoolName} Dashboard</h1>
          <p className="text-slate-500">Manage your staff and view school-wide usage statistics.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg self-start">
          <button 
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'staff' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Users className="w-4 h-4" /> Staff Management
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'billing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <CreditCard className="w-4 h-4" /> Billing & Subscription
          </button>
        </div>
      </div>

      {activeTab === 'staff' ? (
        <div className="animate-fadeIn">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex items-center justify-between mb-4">
                 <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Users className="w-6 h-6"/></div>
                 <span className="text-2xl font-bold text-slate-900">{activeTeachers}</span>
               </div>
               <h3 className="text-sm font-medium text-slate-500">Active Teachers</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex items-center justify-between mb-4">
                 <div className="bg-amber-100 p-3 rounded-lg text-amber-600"><Shield className="w-6 h-6"/></div>
                 <span className="text-2xl font-bold text-slate-900">{pendingTeachers}</span>
               </div>
               <h3 className="text-sm font-medium text-slate-500">Pending Approval</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex items-center justify-between mb-4">
                 <div className="bg-green-100 p-3 rounded-lg text-green-600"><BarChart3 className="w-6 h-6"/></div>
                 <span className="text-2xl font-bold text-slate-900">{totalLessons}</span>
               </div>
               <h3 className="text-sm font-medium text-slate-500">Total Lessons Created</h3>
            </div>
          </div>

          {/* Teacher Management Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-500" />
                Staff Directory
              </h2>
              <div className="flex gap-3 w-full sm:w-auto">
                 <div className="relative flex-1 sm:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                   <input 
                     type="text" 
                     placeholder="Search teachers..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                   />
                 </div>
                 <button 
                   onClick={() => setIsAddModalOpen(true)}
                   className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                 >
                   <Plus className="w-4 h-4" /> Add Teacher
                 </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role / Grade</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Usage</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{teacher.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3"/> {teacher.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 font-medium">{teacher.subject || 'General'}</div>
                        <div className="text-xs text-slate-500">{teacher.grade || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {teacher.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Shield className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {teacher.lessonsCreated} Lessons
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(teacher.joinedDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {teacher.status === 'pending' && (
                             <button 
                               type="button"
                               onClick={() => onUpdateTeacherStatus(teacher.id, 'active')}
                               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-green-600 border border-slate-200 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm"
                               title="Approve Teacher"
                             >
                               <CheckCircle className="w-3 h-3 pointer-events-none" /> Approve
                             </button>
                           )}
                           <button 
                             type="button"
                             onClick={(e) => handleDelete(teacher.id, e)}
                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                             title="Delete Teacher Record"
                           >
                             <Trash2 className="w-3 h-3 pointer-events-none" /> Delete
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-blue-800 text-sm flex gap-4">
            <Shield className="w-6 h-6 shrink-0" />
            <div>
              <h4 className="font-bold mb-1">Privacy Notice</h4>
              <p>School administrators cannot view or edit the specific content of lessons created by teachers to maintain intellectual property and privacy standards. You can only view usage metrics and manage account access.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn space-y-8">
           {/* Current Plan Card */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">Current Plan</h2>
                  <h3 className="text-3xl font-bold text-slate-900">MaplePrep Elite</h3>
                  <p className="text-slate-500 mt-2 max-w-xl">Unlimited access for all registered staff. Includes premium AI features, worksheet generation, and priority support.</p>
                </div>
                <div className="text-right">
                  {isCancelled ? (
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold mb-3">
                        <AlertTriangle className="w-3 h-3" /> Cancelled
                     </div>
                  ) : isTrial ? (
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold mb-3">
                        <Clock className="w-3 h-3" /> Free Trial Active
                     </div>
                  ) : (
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mb-3">
                        <CheckCircle className="w-3 h-3" /> Active Subscription
                     </div>
                  )}
                  <div className="text-3xl font-bold text-slate-900">${subscription?.amount || 89}<span className="text-lg text-slate-400 font-normal">/{subscription?.interval || 'month'}</span></div>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
               <div className="p-6">
                 <div className="flex items-center gap-3 mb-2 text-slate-500">
                   <Calendar className="w-5 h-5" />
                   <span className="text-sm font-bold uppercase">{isCancelled ? 'Expires On' : 'Next Billing Date'}</span>
                 </div>
                 <p className="text-lg font-medium text-slate-900">{formatDate(subscription?.nextBillingDate)}</p>
                 {!isCancelled && <p className="text-xs text-slate-400 mt-1">Auto-renews monthly</p>}
               </div>
               
               <div className="p-6">
                 <div className="flex items-center gap-3 mb-2 text-slate-500">
                   <Shield className="w-5 h-5" />
                   <span className="text-sm font-bold uppercase">Start Date</span>
                 </div>
                 <p className="text-lg font-medium text-slate-900">{formatDate(subscription?.startDate)}</p>
                 <p className="text-xs text-slate-400 mt-1">{isCancelled ? 'Subscription ending' : 'Subscription active'}</p>
               </div>
               
               <div className="p-6">
                 <div className="flex items-center gap-3 mb-2 text-slate-500">
                   <CreditCard className="w-5 h-5" />
                   <span className="text-sm font-bold uppercase">Payment Method</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{subscription?.paymentMethod?.brand || 'VISA'}</div>
                    <p className="text-lg font-medium text-slate-900">•••• {subscription?.paymentMethod?.last4 || '4242'}</p>
                 </div>
                 <button className="text-xs text-red-600 font-bold hover:underline mt-1">Update Card</button>
               </div>
             </div>
           </div>

           {/* Invoice History */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200">
               <h3 className="text-lg font-bold text-slate-900">Billing History</h3>
             </div>
             <table className="w-full text-left text-sm text-slate-600">
               <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-xs">
                 <tr>
                   <th className="px-6 py-4">Date</th>
                   <th className="px-6 py-4">Description</th>
                   <th className="px-6 py-4">Amount</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 text-right">Invoice</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {isTrial && (
                    <tr>
                       <td className="px-6 py-4">{formatDate(subscription?.startDate)}</td>
                       <td className="px-6 py-4 font-medium text-slate-900">Trial Period Authorization</td>
                       <td className="px-6 py-4">$0.00</td>
                       <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Trial</span></td>
                       <td className="px-6 py-4 text-right">-</td>
                    </tr>
                 )}
                 <tr>
                   <td className="px-6 py-4">Aug 15, 2023</td>
                   <td className="px-6 py-4 font-medium text-slate-900">Annual Subscription - School Board Enterprise</td>
                   <td className="px-6 py-4">$2,499.00</td>
                   <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Paid</span></td>
                   <td className="px-6 py-4 text-right">
                     <button className="text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1 w-full font-medium">
                       <Download className="w-4 h-4" /> PDF
                     </button>
                   </td>
                 </tr>
               </tbody>
             </table>
           </div>

           {/* Cancel Zone */}
           {!isCancelled && (
             <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-red-800 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Cancel Subscription
                  </h3>
                  <p className="text-red-700 text-sm mt-1">
                    Once cancelled, your subscription will remain active until the end of your current billing cycle. 
                    After that, all associated teacher accounts will be downgraded to the free tier.
                  </p>
                </div>
                <Button onClick={handleCancelSubscription} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 whitespace-nowrap">
                  Cancel Plan
                </Button>
             </div>
           )}
        </div>
      )}

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-600" />
                Add New Teacher
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddTeacherSubmit} className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-sm mb-4">
                <p><strong>Note:</strong> Adding a teacher here pre-approves their account. They must sign up using the email address you provide below.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="e.g. Jane Doe"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="e.g. jane.doe@school.ca"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                      placeholder="e.g. Math"
                      value={newTeacher.subject}
                      onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Grade</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <select 
                      className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                      value={newTeacher.grade}
                      onChange={(e) => setNewTeacher({...newTeacher, grade: e.target.value})}
                    >
                      <option value="">Select...</option>
                      <option value="Kindergarten">Kindergarten</option>
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1 bg-red-600 hover:bg-red-700">Send Invitation</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
