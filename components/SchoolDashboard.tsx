
import React, { useState, useEffect } from 'react';
import { TeacherProfile, SubscriptionDetails, Announcement, AnnouncementAudience, UserProfile } from '../types';
import { Users, CheckCircle, BarChart3, Shield, Mail, Trash2, Search, Plus, X, GraduationCap, BookOpen, CreditCard, Calendar, Download, AlertTriangle, FileText, Clock, Image as ImageIcon, Lock, Bell, MessageSquare, Send, User, Filter, CheckCircle2, Square, LifeBuoy, UserCheck, Loader2, Key, Check, UserPlus, Users2, Cloud, TrendingUp, History, ArrowRight, MapPin, ShieldCheck, Copy, ExternalLink, Info } from 'lucide-react';
import { Button } from './Button';
import { HelpCenter } from './HelpCenter';
import { generateWelcomeEmail } from '../services/geminiService';
import { isFirebaseReady } from '../services/firebase';
import { createStaffInvitation, resetPassword } from '../services/auth';

interface SchoolDashboardProps {
  schoolName: string;
  schoolId: string;
  teachers: TeacherProfile[];
  onAddTeacher: (teacher: TeacherProfile) => void;
  onUpdateTeacherStatus: (id: string, status: 'active' | 'pending') => void;
  onDeleteTeacher: (id: string) => void;
  subscription?: SubscriptionDetails;
  onUpdateSubscription?: (updates: Partial<SubscriptionDetails>) => void;
  onOpenBillingPortal?: () => Promise<void>;
}

export const SchoolDashboard: React.FC<SchoolDashboardProps> = ({ 
  schoolName, 
  schoolId,
  teachers,
  onAddTeacher,
  onUpdateTeacherStatus,
  onDeleteTeacher,
  subscription,
  onUpdateSubscription,
  onOpenBillingPortal
}) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'billing' | 'announcements'>('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAddingInProgress, setIsAddingInProgress] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [lastAddedTeacher, setLastAddedTeacher] = useState<{name: string, email: string, pass: string, emailPreview: string} | null>(null);

  const handleResetPassword = async () => {
    // We use a hardcoded email for the admin profile in this component, 
    // but in a real app it would come from the auth context.
    const email = 'admin@' + (schoolName || 'school').toLowerCase().replace(/\s/g, '') + '.ca';
    setIsResettingPassword(true);
    try {
      await resetPassword(email);
      alert(`A password reset link has been sent to ${email}. Please check your inbox.`);
    } catch (err) {
      console.error("Reset error:", err);
      alert("Failed to send reset email. Please try again later.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const [copySuccess, setCopySuccess] = useState(false);
  
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    role: 'teaching' as 'teaching' | 'non-teaching'
  });

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingInProgress(true);
    try {
      // 1. Generate temp password and email content
      const tempPass = Math.random().toString(36).slice(-8).toUpperCase();
      const emailContent = await generateWelcomeEmail(newTeacher.name, schoolName, newTeacher.email, tempPass);
      
      // 2. Persist invitation in database for immediate access
      await createStaffInvitation(newTeacher.email, tempPass, newTeacher.name, newTeacher.role, schoolName, schoolId);

      // 3. Local state update
      const teacher: TeacherProfile = {
        id: Date.now().toString(),
        name: newTeacher.name,
        email: newTeacher.email,
        role: newTeacher.role,
        status: 'pending', // Set to pending until they log in for the first time
        joinedDate: new Date().toISOString().split('T')[0],
        lessonsCreated: 0
      };
      onAddTeacher(teacher);
      
      setLastAddedTeacher({ 
        name: newTeacher.name, 
        email: newTeacher.email, 
        pass: tempPass, 
        emailPreview: emailContent 
      });
      setNewTeacher({ name: '', email: '', role: 'teaching' });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Add staff error:", error);
      alert("Error adding staff.");
    } finally {
      setIsAddingInProgress(false);
    }
  };

  const handleSendViaEmailApp = () => {
    if (!lastAddedTeacher) return;
    const subject = encodeURIComponent(`Invitation: Join ${schoolName} on MaplePrep`);
    const body = encodeURIComponent(lastAddedTeacher.emailPreview);
    window.location.href = `mailto:${lastAddedTeacher.email}?subject=${subject}&body=${body}`;
  };

  const handleCopyInvite = () => {
    if (!lastAddedTeacher) return;
    navigator.clipboard.writeText(lastAddedTeacher.emailPreview);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const filteredStaff = (teachers || []).filter(t => 
    (t.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (t.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn relative">
      {/* Success Feedback Modal */}
      {lastAddedTeacher && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
           <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl text-center border border-slate-200 animate-slideUp">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Check className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Staff Member Invited!</h2>
              <p className="text-slate-500 mb-8 font-medium">To complete the setup, send the invitation below to <strong>{lastAddedTeacher.name}</strong>. Their account is ready for immediate login.</p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 mb-8 text-left max-h-[200px] overflow-y-auto no-scrollbar relative">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Invite Email Preview</p>
                 <div className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-medium">
                    {lastAddedTeacher.emailPreview}
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <Button onClick={handleSendViaEmailApp} className="w-full py-5 font-black text-lg flex items-center justify-center gap-3">
                    <Mail className="w-5 h-5" /> Send via Email App
                 </Button>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleCopyInvite}
                      className="py-4 border-2 border-slate-100 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      {copySuccess ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      {copySuccess ? 'Copied!' : 'Copy Text'}
                    </button>
                    <button 
                      onClick={() => setLastAddedTeacher(null)}
                      className="py-4 border-2 border-slate-100 rounded-xl font-bold text-sm text-slate-400 hover:text-slate-900 transition-all"
                    >
                      Close
                    </button>
                 </div>
              </div>
              
              <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                 <Info className="w-3 h-3" /> Sending via your own email ensures delivery.
              </p>
           </div>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{schoolName} Admin</h1>
            <p className="text-slate-500">School-wide resource and staff management.</p>
          </div>
          <div className="mt-1 flex flex-col gap-1.5">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase border border-green-200 shadow-sm">
               <MapPin className="w-3 h-3" /> Toronto Server 🇨🇦
             </div>
             {isFirebaseReady && (
               <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase border border-blue-200 shadow-sm">
                 <ShieldCheck className="w-3 h-3" /> FIPPA/PHIPA Compliant
               </div>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleResetPassword} 
            disabled={isResettingPassword}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Key className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:block">{isResettingPassword ? 'Sending...' : 'Reset Password'}</span>
          </button>

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-3xl font-black text-slate-900">{teachers.reduce((sum, t) => sum + (t.lessonsCreated || 0), 0)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-full -mr-8 -mt-8 opacity-50"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ImageIcon className="w-3 h-3 text-red-500" /> Images Left</h3>
              <p className="text-3xl font-black text-slate-900">
                {subscription ? (subscription.imageLimit - subscription.imagesUsedThisMonth) : '---'}
              </p>
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
                                 <div className="text-sm font-bold text-slate-700">{t.lessonsCreated || 0}</div>
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
                         </div>
                         <h3 className="text-lg font-bold text-slate-900 mb-2">{a.title}</h3>
                         <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{a.content}</p>
                      </div>
                      <div className="flex md:flex-col justify-end gap-2">
                         <button onClick={() => handleDeleteAnnouncement(a.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                   </div>
                </div>
              ))}
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
                       
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Cycle</p>
                                   <p className="text-xl font-bold">Monthly</p>
                                </div>
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Calendar className="w-5 h-5"/></div>
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
                          </div>
                          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image Allowance</p>
                                   <p className="text-xl font-bold">{subscription ? `${subscription.imageLimit - subscription.imagesUsedThisMonth} Left` : '---'}</p>
                                </div>
                                <div className="p-2 bg-red-500/20 text-red-400 rounded-lg"><ImageIcon className="w-5 h-5"/></div>
                             </div>
                             {subscription && (
                               <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                 <div 
                                   className="bg-red-500 h-full rounded-full" 
                                   style={{ width: `${Math.min(100, (subscription.imagesUsedThisMonth / subscription.imageLimit) * 100)}%` }}
                                 ></div>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Help Center Component */}
      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} user={adminProfile} />
      
      {/* Invite Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-900/60 backdrop-blur-md animate-fadeIn">
           <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative border border-slate-200 my-8">
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
                       <Button type="submit" className="w-full py-5 text-lg font-black shadow-xl" isLoading={isAddingInProgress}>Generate Invitation</Button>
                     </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Announcement Modal */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-900/60 backdrop-blur-md animate-fadeIn">
           <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative border border-slate-200 my-8">
                 <button onClick={() => setIsAnnouncementModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                 <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-1">New Announcement</h2>
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
                     <div className="pt-4">
                       <Button type="submit" className="w-full py-5 text-lg font-black shadow-xl"><Send className="w-5 h-5 mr-2" /> Post Announcement</Button>
                     </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
