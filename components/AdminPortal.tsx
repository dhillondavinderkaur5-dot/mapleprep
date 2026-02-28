
import React, { useState, useEffect, useRef } from 'react';
import { PlatformStats, SystemFeedback, UserProfile } from '../types';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  MessageSquare, 
  ShieldCheck, 
  Mail, 
  LifeBuoy, 
  Bug, 
  Sparkles, 
  RefreshCcw, 
  CheckCircle, 
  Activity, 
  Settings, 
  Filter, 
  CheckCircle2,
  TrendingUp,
  School,
  BookOpen,
  ArrowUpRight,
  TrendingDown,
  Clock,
  MoreVertical,
  Globe,
  Zap,
  Image as ImageIcon,
  LogOut,
  Download,
  Search,
  ChevronRight,
  Database,
  Loader2
} from 'lucide-react';
import { Button } from './Button';
import { db } from '../services/firebase';
import * as firestoreModule from 'firebase/firestore';

const { collection, getDocs, query, orderBy, limit } = firestoreModule as any;

const MapleLeafIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 512 512" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="leafGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#ff1a1a" />
        <stop offset="70%" stopColor="#cc0000" />
        <stop offset="100%" stopColor="#800000" />
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
        <feOffset dx="2" dy="4" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.5" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      <path d="M256 480 L256 410 L240 410 L256 480 Z" fill="#660000" />
      <path d="M256 410 C256 410 210 390 190 380 C170 370 140 410 140 410 C140 410 150 360 160 340 C170 320 100 320 100 320 C100 320 140 290 180 270 C220 250 130 180 130 180 C130 180 180 190 220 210 C260 230 256 100 256 100 C256 100 252 230 292 210 C332 190 382 180 382 180 C382 180 292 250 332 270 C372 290 412 320 412 320 C412 320 342 320 352 340 C362 360 372 410 372 410 C372 410 342 370 322 380 C302 390 256 410 256 410 Z" fill="url(#leafGradient)" stroke="#660000" strokeWidth="2" />
      <path d="M256 150 L256 380 M256 280 L180 340 M256 280 L332 340 M256 230 L170 240 M256 230 L342 240" stroke="#660000" strokeWidth="1" opacity="0.2" />
      <text x="256" y="295" textAnchor="middle" fill="white" fontSize="80" fontWeight="900" fontFamily="'Arial Narrow', sans-serif">Prep</text>
    </g>
  </svg>
);

interface AdminPortalProps {
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'users' | 'usage' | 'feedback' | 'branding'>('dashboard');
  const [feedback, setFeedback] = useState<SystemFeedback[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [topSubject, setTopSubject] = useState({ name: 'Mathematics', percentage: 31 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadAsJpg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create a blob from SVG with realistic styling
    const svgString = `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="leafGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#ff1a1a" />
            <stop offset="70%" stop-color="#cc0000" />
            <stop offset="100%" stop-color="#800000" />
          </radialGradient>
        </defs>
        <rect width="512" height="512" fill="white" />
        <path d="M256 480 L256 410 L240 410 L256 480 Z" fill="#660000" />
        <path d="M256 410 C256 410 210 390 190 380 C170 370 140 410 140 410 C140 410 150 360 160 340 C170 320 100 320 100 320 C100 320 140 290 180 270 C220 250 130 180 130 180 C130 180 180 190 220 210 C260 230 256 100 256 100 C256 100 252 230 292 210 C332 190 382 180 382 180 C382 180 292 250 332 270 C372 290 412 320 412 320 C412 320 342 320 352 340 C362 360 372 410 372 410 C372 410 342 370 322 380 C302 390 256 410 256 410 Z" fill="url(#leafGradient)" stroke="#660000" stroke-width="2" />
        <path d="M256 150 L256 380 M256 280 L180 340 M256 280 L332 340 M256 230 L170 240 M256 230 L342 240" stroke="#660000" stroke-width="1" opacity="0.2" />
        <text x="256" y="295" text-anchor="middle" fill="white" font-size="80" font-weight="900" font-family="'Arial Narrow', sans-serif">Prep</text>
      </svg>
    `;
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 512, 512);
      const jpgUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = 'mapleprep-logo.jpg';
      link.href = jpgUrl;
      link.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };
  
  const [stats, setStats] = useState<PlatformStats>({
    totalRevenue: 0,
    mrr: 0,
    activeSchools: 0,
    activeTeachers: 0,
    totalLessonsGenerated: 0,
    aiImagesGenerated: 0
  });

  const [realTransactions, setRealTransactions] = useState<any[]>([]);

  const fetchStats = async () => {
    if (!db) return;
    setIsRefreshingStats(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as UserProfile & { lessonsCreated?: number }));
      
      let revenue = 0;
      let mrr = 0;
      let schools = 0;
      let teachers = 0;
      let images = 0;
      let lessons = 0;
      const transactionsList: any[] = [];
      const subjectCounts: Record<string, number> = {};

      users.forEach(u => {
        if (u.type === 'school') schools++;
        if (u.type === 'teacher') teachers++;
        lessons += (u as any).lessonsCreated || 0;
        
        const sub = (u as any).subject;
        if (sub) {
          subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
        }
        
        if (u.subscription) {
          if (u.subscription.status === 'active' || u.subscription.status === 'trialing' || u.subscription.status === 'trial') {
            const amount = u.subscription.amount || 0;
            revenue += amount; 
            if (u.subscription.interval === 'month') {
              mrr += amount;
            } else {
              mrr += amount / 12;
            }
            images += u.subscription.imagesUsedThisMonth || 0;

            // Add to transactions list if they have a plan
            if (u.subscription.planId !== 'starter') {
              transactionsList.push({
                id: `SUB-${u.id.slice(0, 4).toUpperCase()}`,
                school: u.name,
                plan: u.subscription.planId.charAt(0).toUpperCase() + u.subscription.planId.slice(1),
                amount: `$${amount.toFixed(2)}`,
                date: u.subscription.startDate ? new Date(u.subscription.startDate).toLocaleDateString() : 'N/A',
                status: u.subscription.status === 'active' ? 'Succeeded' : 'Trial'
              });
            }
          }
        }
      });

      setStats({
        totalRevenue: revenue,
        mrr: mrr,
        activeSchools: schools,
        activeTeachers: teachers,
        totalLessonsGenerated: lessons,
        aiImagesGenerated: images
      });
      
      setRealTransactions(transactionsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setRegisteredUsers(users as any);

      const subjects = Object.entries(subjectCounts);
      if (subjects.length > 0) {
        subjects.sort((a, b) => b[1] - a[1]);
        const top = subjects[0];
        setTopSubject({
          name: top[0],
          percentage: Math.round((top[1] / users.length) * 100)
        });
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && db && registeredUsers.length === 0) {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(100));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc: any) => doc.data() as UserProfile);
      setRegisteredUsers(users);
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    const loadFeedback = () => {
      const saved = JSON.parse(localStorage.getItem('mapleprep_feedback') || '[]');
      if (saved.length === 0) {
        setFeedback([
          { id: '1', userName: 'Sarah Jenkins', userEmail: 's.jenkins@tdsb.on.ca', type: 'bug', priority: 'high', content: 'Alignment issue on iPad Safari when using the chalkboard theme.', status: 'open', date: '2025-05-10', subject: 'UI Bug' },
          { id: '2', userName: 'Mike Ross', userEmail: 'm.ross@cbe.ab.ca', type: 'feature', priority: 'medium', content: 'Can we add support for the BC New Curriculum expectations explicitly?', status: 'open', date: '2025-05-09', subject: 'Curriculum Request' }
        ]);
      } else {
        setFeedback(saved);
      }
    };
    loadFeedback();
    const interval = setInterval(loadFeedback, 5000);
    return () => clearInterval(interval);
  }, []);

  const resolveFeedback = (id: string) => {
    const updated = feedback.map(f => f.id === id ? { ...f, status: 'resolved' as const } : f);
    setFeedback(updated);
    localStorage.setItem('mapleprep_feedback', JSON.stringify(updated));
  };

  const filteredUsers = registeredUsers.filter(u => 
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center gap-2">
             <div className="bg-red-600 p-1.5 rounded-lg">
               <ShieldCheck className="w-5 h-5 text-white" />
             </div>
             <span className="font-black text-xl tracking-tight uppercase">Maple Admin</span>
           </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <BarChart3 className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('payments')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'payments' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <CreditCard className="w-5 h-5" /> Payments
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Users className="w-5 h-5" /> User Directory
          </button>
          <button 
            onClick={() => setActiveTab('usage')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'usage' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Zap className="w-5 h-5" /> AI Usage
          </button>
          <button 
            onClick={() => setActiveTab('branding')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'branding' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <ImageIcon className="w-5 h-5" /> Branding Assets
          </button>
          <button 
            onClick={() => setActiveTab('feedback')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'feedback' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <MessageSquare className="w-5 h-5" /> Support Hub
            {feedback.filter(f => f.status === 'open').length > 0 && (
              <span className="ml-auto bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">
                {feedback.filter(f => f.status === 'open').length}
              </span>
            )}
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-4">
           <div className="bg-slate-800/50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">System Health</span>
              </div>
              <p className="text-xs text-white font-bold tracking-tight">API Status: Operational</p>
           </div>
           <button 
             onClick={onLogout}
             className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-slate-700 hover:border-red-900/50"
           >
             <LogOut className="w-3.5 h-3.5" /> Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="flex justify-between items-center mb-10">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {activeTab === 'dashboard' && 'System Overview'}
                {activeTab === 'payments' && 'Revenue & Billing'}
                {activeTab === 'users' && 'User Directory'}
                {activeTab === 'usage' && 'AI Platform Usage'}
                {activeTab === 'feedback' && 'Support Hub'}
                {activeTab === 'branding' && 'Branding Assets'}
              </h1>
              <p className="text-slate-500 font-medium">Monitoring platform health and teacher success.</p>
           </div>
           <div className="flex gap-3">
              <button onClick={() => { fetchStats(); if(activeTab === 'users') fetchUsers(); }} disabled={isRefreshingStats} className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-50">
                {isRefreshingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5"/>}
              </button>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:bg-slate-50 transition-all"><Settings className="w-5 h-5"/></button>
           </div>
        </header>

        {activeTab === 'dashboard' && (
           <div className="animate-fadeIn space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                       <div className="bg-green-100 p-3 rounded-2xl text-green-600"><TrendingUp className="w-6 h-6"/></div>
                       <span className="text-xs font-black text-green-600 flex items-center">+12% <ArrowUpRight className="w-3 h-3"/></span>
                    </div>
                    <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Total Revenue</h3>
                    <p className="text-3xl font-black text-slate-900">${stats.totalRevenue.toLocaleString()}</p>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                       <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><School className="w-6 h-6"/></div>
                       <span className="text-xs font-black text-blue-600 flex items-center">+4 <ArrowUpRight className="w-3 h-3"/></span>
                    </div>
                    <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Active Schools</h3>
                    <p className="text-3xl font-black text-slate-900">{stats.activeSchools}</p>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                       <div className="bg-purple-100 p-3 rounded-2xl text-purple-600"><Users className="w-6 h-6"/></div>
                       <span className="text-xs font-black text-purple-600 flex items-center">+82 <ArrowUpRight className="w-3 h-3"/></span>
                    </div>
                    <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Total Teachers</h3>
                    <p className="text-3xl font-black text-slate-900">{stats.activeTeachers.toLocaleString()}</p>
                 </div>
                 <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 text-white border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                       <div className="bg-red-600 p-3 rounded-2xl text-white"><Sparkles className="w-6 h-6"/></div>
                       <div className="h-2 w-12 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-red-500 w-3/4"></div></div>
                    </div>
                    <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">AI Lessons</h3>
                    <p className="text-3xl font-black">{stats.totalLessonsGenerated.toLocaleString()}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-black mb-6">Platform Activity</h2>
                    <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500"><Globe className="w-5 h-5"/></div>
                          <div className="flex-1">
                             <div className="flex justify-between mb-1"><span className="text-sm font-bold">Province: Ontario</span><span className="text-xs font-black text-slate-400">42%</span></div>
                             <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-red-500 h-full w-[42%] rounded-full"></div></div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500"><BookOpen className="w-5 h-5"/></div>
                          <div className="flex-1">
                             <div className="flex justify-between mb-1"><span className="text-sm font-bold">Subject: {topSubject.name}</span><span className="text-xs font-black text-slate-400">{topSubject.percentage}%</span></div>
                             <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-blue-500 h-full rounded-full" style={{ width: `${topSubject.percentage}%` }}></div></div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <Activity className="w-16 h-16 text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold">More analytics arriving soon.</p>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'users' && (
           <div className="animate-fadeIn space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search users by name or email..." 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-red-500/20"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border">
                    <Database className="w-3.5 h-3.5" /> Showing {filteredUsers.length} Users
                 </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                          <tr>
                             <th className="px-8 py-5">User Profile</th>
                             <th className="px-8 py-5">Type</th>
                             <th className="px-8 py-5">Subscription</th>
                             <th className="px-8 py-5">Images Used</th>
                             <th className="px-8 py-5 text-right">Verification</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {isLoadingUsers ? (
                             <tr>
                                <td colSpan={5} className="py-20 text-center">
                                   <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-2" />
                                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Querying Firestore...</span>
                                </td>
                             </tr>
                          ) : filteredUsers.map(u => (
                             <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                                         {u.name.charAt(0)}
                                      </div>
                                      <div>
                                         <div className="text-sm font-black text-slate-900">{u.name}</div>
                                         <div className="text-[10px] text-slate-400 font-bold">{u.email}</div>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-5">
                                   <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase">
                                      {u.type}
                                   </span>
                                </td>
                                <td className="px-8 py-5">
                                   {u.subscription ? (
                                      <div className="space-y-1">
                                         <div className={`text-xs font-black uppercase flex items-center gap-1.5 ${
                                            u.subscription.status === 'active' ? 'text-green-600' : 
                                            u.subscription.status === 'trial' ? 'text-blue-600' : 'text-slate-400'
                                         }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                               u.subscription.status === 'active' ? 'bg-green-600' : 
                                               u.subscription.status === 'trial' ? 'bg-blue-600' : 'bg-slate-400'
                                            }`}></div>
                                            {u.subscription.planId} ({u.subscription.status})
                                         </div>
                                         <p className="text-[10px] text-slate-400">Next billing: {u.subscription.nextBillingDate || 'N/A'}</p>
                                      </div>
                                   ) : (
                                      <span className="text-[10px] font-black text-slate-300 uppercase italic">No Active Plan</span>
                                   )}
                                </td>
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-slate-100 h-1.5 w-20 rounded-full">
                                         <div 
                                           className="bg-red-500 h-full rounded-full" 
                                           style={{ width: `${Math.min(100, ((u.subscription?.imagesUsedThisMonth || 0) / (u.subscription?.imageLimit || 50)) * 100)}%` }}
                                         ></div>
                                      </div>
                                      <span className="text-xs font-black text-slate-900">{u.subscription?.imagesUsedThisMonth || 0}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <button className="p-2 text-slate-300 hover:text-slate-900"><ChevronRight className="w-5 h-5"/></button>
                                </td>
                             </tr>
                          ))}
                          {!isLoadingUsers && filteredUsers.length === 0 && (
                             <tr>
                                <td colSpan={5} className="py-20 text-center text-slate-400 italic">No users found in database.</td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'payments' && (
           <div className="animate-fadeIn space-y-8">
              <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                 <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-black">Recent Transactions</h2>
                    <button className="text-xs font-black text-red-600 hover:underline uppercase tracking-widest">View All in Stripe</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <tr>
                             <th className="px-8 py-4">Transaction ID</th>
                             <th className="px-8 py-4">Entity</th>
                             <th className="px-8 py-4">Plan</th>
                             <th className="px-8 py-4">Amount</th>
                             <th className="px-8 py-4">Date</th>
                             <th className="px-8 py-4">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {realTransactions.map(tx => (
                             <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-5 text-sm font-mono text-slate-500">{tx.id}</td>
                                <td className="px-8 py-5 text-sm font-bold text-slate-900">{tx.school}</td>
                                <td className="px-8 py-5 text-sm text-slate-600">{tx.plan}</td>
                                <td className="px-8 py-5 text-sm font-black text-slate-900">{tx.amount}</td>
                                <td className="px-8 py-5 text-sm text-slate-500">{tx.date}</td>
                                <td className="px-8 py-5 text-sm">
                                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${tx.status === 'Succeeded' ? 'bg-green-100 text-green-700' : tx.status === 'Trial' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                      {tx.status}
                                   </span>
                                </td>
                             </tr>
                          ))}
                          {realTransactions.length === 0 && (
                             <tr>
                                <td colSpan={6} className="py-20 text-center text-slate-400 italic">No real transactions found in database.</td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'usage' && (
           <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                 <div className="flex items-center gap-3 mb-8">
                    <ImageIcon className="w-8 h-8 text-red-500" />
                    <h2 className="text-2xl font-black">AI Image Generations</h2>
                 </div>
                 <div className="space-y-8">
                    <div>
                       <div className="flex justify-between mb-2"><span className="text-sm font-bold opacity-60">Global Current Monthly Usage</span><span className="text-sm font-bold">{stats.aiImagesGenerated.toLocaleString()} / 25,000</span></div>
                       <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden"><div className="bg-red-500 h-full rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]" style={{ width: `${Math.min(100, (stats.aiImagesGenerated / 25000) * 100)}%` }}></div></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="bg-slate-800 p-4 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Today</p>
                          <p className="text-xl font-bold">{Math.floor(stats.aiImagesGenerated / 30)}</p>
                       </div>
                       <div className="bg-slate-800 p-4 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Avg/User</p>
                          <p className="text-xl font-bold">{stats.activeTeachers > 0 ? (stats.aiImagesGenerated / stats.activeTeachers).toFixed(1) : '0'}</p>
                       </div>
                       <div className="bg-slate-800 p-4 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Failed</p>
                          <p className="text-xl font-bold text-green-400">0%</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200">
                 <div className="flex items-center gap-3 mb-8">
                    <Sparkles className="w-8 h-8 text-blue-500" />
                    <h2 className="text-2xl font-black text-slate-900">Lesson Planner API</h2>
                 </div>
                 <p className="text-slate-500 mb-6">Gemini 3 Pro performance metrics and latency monitoring.</p>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                       <span className="text-sm font-bold">Avg Latency</span>
                       <span className="text-sm font-black text-green-600">3.2s</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                       <span className="text-sm font-bold">Success Rate</span>
                       <span className="text-sm font-black text-green-600">99.8%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                       <span className="text-sm font-bold">Token Efficiency</span>
                       <span className="text-sm font-black text-blue-600">High</span>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'branding' && (
           <div className="animate-fadeIn space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm flex flex-col items-center">
                 <div className="mb-10 text-center text-slate-800">
                    <h2 className="text-2xl font-black mb-2">Branding Assets</h2>
                    <p className="text-slate-500 font-medium">Official logos for Stripe, social media, and site branding.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">App Icon (Stripe Square)</p>
                       <div className="aspect-square w-full max-w-[300px] mx-auto bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 flex items-center justify-center p-10">
                          <div className="w-full h-full text-red-600 drop-shadow-2xl">
                             <MapleLeafIcon className="w-full h-full" />
                          </div>
                       </div>
                       <div className="flex flex-col gap-3 items-center">
                          <a href="/logo.svg" download="mapleprep-logo.svg" className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg">
                             <Download className="w-4 h-4" /> Download SVG
                          </a>
                          <button onClick={downloadAsJpg} className="w-full px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-red-500 hover:text-red-600 transition-all">
                             <Download className="w-4 h-4" /> Download JPG (for Stripe)
                          </button>
                          <canvas ref={canvasRef} width="512" height="512" className="hidden" />
                       </div>
                    </div>
                    
                    <div className="space-y-6">
                       <div className="bg-slate-50 p-6 rounded-2xl border">
                          <h4 className="font-bold text-slate-800 mb-2">Stripe Brand Settings</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mb-4">Upload this icon to your Stripe Dashboard under Settings &gt; Branding. This will appear on checkout pages and customer receipts.</p>
                          <ul className="text-[10px] font-black text-slate-400 uppercase space-y-2">
                             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Primary Color: #EF4444</li>
                             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-900 rounded-full" /> Accent Color: #0F172A</li>
                          </ul>
                       </div>
                       
                       <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                          <h4 className="font-bold text-red-900 mb-2">Stripe Verification</h4>
                          <div className="space-y-2">
                             <p className="text-xs text-red-700">Region: Toronto, Ontario</p>
                             <p className="text-[10px] text-red-500 font-bold uppercase">Verified Canada 🇨🇦</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'feedback' && (
           <div className="animate-fadeIn space-y-6">
             <div className="flex items-center justify-between mb-2">
                <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-sm">
                   <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                   <span className="text-xs font-black text-slate-700 tracking-tight uppercase">
                     {feedback.filter(f => f.status === 'open').length} Open Tickets
                   </span>
                </div>
                <button onClick={() => window.location.reload()} className="p-2.5 hover:bg-slate-100 rounded-xl transition-all"><RefreshCcw className="w-5 h-5 text-slate-400"/></button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {feedback.map(f => (
                  <div key={f.id} className={`bg-white p-8 rounded-[2.5rem] shadow-sm border ${f.status === 'resolved' ? 'border-slate-100 grayscale opacity-60 scale-95' : 'border-slate-200'} transition-all hover:shadow-xl relative overflow-hidden flex flex-col group`}>
                     {f.status === 'open' && (
                        <div className={`absolute top-0 right-0 p-2 px-4 rounded-bl-3xl text-[9px] font-black text-white uppercase tracking-[0.1em] ${f.priority === 'high' ? 'bg-red-600 animate-pulse' : 'bg-slate-900'}`}>
                           {f.priority || 'Medium'} Priority
                        </div>
                     )}
                     
                     <div className="flex items-center gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${
                           f.type === 'bug' ? 'bg-red-50 text-red-600' : 
                           f.type === 'feature' ? 'bg-blue-50 text-blue-600' : 
                           f.type === 'support' ? 'bg-purple-50 text-purple-600' : 
                           f.type === 'billing' ? 'bg-slate-50 text-slate-600' : 'bg-slate-50 text-slate-600'
                        }`}>
                           {f.type === 'bug' && <Bug className="w-7 h-7"/>}
                           {f.type === 'feature' && <Sparkles className="w-7 h-7"/>}
                           {f.type === 'support' && <LifeBuoy className="w-7 h-7"/>}
                           {f.type === 'billing' && <CreditCard className="w-7 h-7"/>}
                           {f.type === 'praise' && <MessageSquare className="w-7 h-7"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-base font-black text-slate-900 truncate leading-tight">{f.userName}</p>
                           <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{f.type} • {new Date(f.date).toLocaleDateString()}</p>
                        </div>
                     </div>

                     <div className="mb-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Subject</h4>
                        <p className="text-lg font-bold text-slate-800 leading-tight">{f.subject || 'Platform Inquiry'}</p>
                     </div>

                     <p className="text-sm text-slate-600 leading-relaxed mb-8 flex-1 italic line-clamp-4">"{f.content}"</p>
                     
                     <div className="flex gap-3">
                        {f.status === 'open' ? (
                           <button 
                             onClick={() => resolveFeedback(f.id)} 
                             className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 transform active:scale-95 shadow-lg"
                           >
                             <CheckCircle className="w-4 h-4"/> Resolve
                           </button>
                        ) : (
                           <div className="flex-1 py-4 bg-green-50 text-green-700 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                             <CheckCircle2 className="w-4 h-4"/> Resolved
                           </div>
                        )}
                        <a 
                          href={`mailto:${f.userEmail}?subject=Re: MaplePrep Support - ${f.subject}`} 
                          className="px-5 py-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center text-slate-400 hover:text-slate-600"
                        >
                          <Mail className="w-5 h-5"/>
                        </a>
                     </div>
                  </div>
                ))}
                {feedback.length === 0 && (
                   <div className="col-span-full py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                      <LifeBuoy className="w-16 h-16 mb-6 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-lg">No active tickets found.</p>
                      <p className="text-xs mt-2 font-bold">All systems currently green.</p>
                   </div>
                )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
