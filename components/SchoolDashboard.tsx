
import React, { useState } from 'react';
import { TeacherProfile, SubscriptionDetails } from '../types';
import { Users, CheckCircle, BarChart3, Shield, Mail, Trash2, Search, Plus, X, GraduationCap, BookOpen, CreditCard, Calendar, Download, AlertTriangle, FileText, Clock } from 'lucide-react';
import { Button } from './Button';

interface SchoolDashboardProps {
  schoolName: string;
  teachers: TeacherProfile[];
  onAddTeacher: (teacher: TeacherProfile) => void;
  onUpdateTeacherStatus: (id: string, status: 'active' | 'pending') => void;
  onDeleteTeacher: (id: string) => void;
  subscription?: SubscriptionDetails;
  onUpdateSubscription?: (updates: Partial<SubscriptionDetails>) => void;
}

export const SchoolDashboard: React.FC<SchoolDashboardProps> = ({ 
  schoolName, 
  teachers,
  onAddTeacher,
  onUpdateTeacherStatus,
  onDeleteTeacher,
  subscription,
  onUpdateSubscription
}) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'billing'>('staff');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add Teacher Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
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
