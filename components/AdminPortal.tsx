
import React, { useState, useEffect } from 'react';
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
  LogOut
} from 'lucide-react';
import { Button } from './Button';

interface AdminPortalProps {
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'usage' | 'feedback'>('dashboard');
  const [feedback, setFeedback] = useState<SystemFeedback[]>([]);
  
  const stats: PlatformStats = {
    totalRevenue: 124500,
    mrr: 15400,
    activeSchools: 42,
    activeTeachers: 1240,
    totalLessonsGenerated: 18450,
    aiImagesGenerated: 6200
  };

  const transactions = [
    { id: 'TX-9021', school: 'Maple Grove Elementary', plan: 'School', amount: '$139.00', date: '2025-05-12', status: 'Succeeded' },
    { id: 'TX-9022', school: 'Pinecrest Academy', plan: 'School', amount: '$139.00', date: '2025-05-11', status: 'Succeeded' },
    { id: 'TX-9023', school: 'Sarah Jenkins (Pro)', plan: 'Individual Pro', amount: '$59.00', date: '2025-05-11', status: 'Succeeded' },
    { id: 'TX-9024', school: 'Ontario District 4', plan: 'School (Annual)', amount: '$1390.00', date: '2025-05-10', status: 'Succeeded' },
    { id: 'TX-9025', school: 'Victoria Secondary', plan: 'School', amount: '$139.00', date: '2025-05-10', status: 'Refunded' },
  ];

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
            onClick={() => setActiveTab('usage')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'usage' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Zap className="w-5 h-5" /> AI Usage
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
                {activeTab === 'usage' && 'AI Platform Usage'}
                {activeTab === 'feedback' && 'Support Hub'}
              </h1>
              <p className="text-slate-500 font-medium">Monitoring platform health and teacher success.</p>
           </div>
           <div className="flex gap-3">
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:bg-slate-50 transition-all"><RefreshCcw className="w-5 h-5"/></button>
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
                             <div className="flex justify-between mb-1"><span className="text-sm font-bold">Subject: Mathematics</span><span className="text-xs font-black text-slate-400">31%</span></div>
                             <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-blue-500 h-full w-[31%] rounded-full"></div></div>
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
                          {transactions.map(tx => (
                             <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-5 text-sm font-mono text-slate-500">{tx.id}</td>
                                <td className="px-8 py-5 text-sm font-bold text-slate-900">{tx.school}</td>
                                <td className="px-8 py-5 text-sm text-slate-600">{tx.plan}</td>
                                <td className="px-8 py-5 text-sm font-black text-slate-900">{tx.amount}</td>
                                <td className="px-8 py-5 text-sm text-slate-500">{tx.date}</td>
                                <td className="px-8 py-5 text-sm">
                                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${tx.status === 'Succeeded' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      {tx.status}
                                   </span>
                                </td>
                             </tr>
                          ))}
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
                       <div className="flex justify-between mb-2"><span className="text-sm opacity-60">Global Current Monthly Usage</span><span className="text-sm font-bold">{stats.aiImagesGenerated.toLocaleString()} / 25,000</span></div>
                       <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden"><div className="bg-red-500 h-full w-[24.8%] rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="bg-slate-800 p-4 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Today</p>
                          <p className="text-xl font-bold">142</p>
                       </div>
                       <div className="bg-slate-800 p-4 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Avg/User</p>
                          <p className="text-xl font-bold">8.4</p>
                       </div>
                       <div className="bg-slate-800 p-4 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Failed</p>
                          <p className="text-xl font-bold text-red-400">0.2%</p>
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
