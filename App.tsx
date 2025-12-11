
import React, { useState, useEffect } from 'react';
import { PresentationForm } from './components/PresentationForm';
import { PresentationView } from './components/PresentationView';
import { FeaturesPage, ResourcesPage, PricingPage } from './components/StaticPages';
import { LoginPage } from './components/LoginPage';
import { SchoolDashboard } from './components/SchoolDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { generateLessonPlan } from './services/geminiService';
import { GenerationParams, LessonPlan, TeacherProfile, UserProfile, UserType, SubscriptionDetails } from './types';
import { LogOut, ChevronDown, User as UserIcon, Building2, Menu, X, ArrowRight, ShieldCheck, CreditCard, Lock, Calendar, Clock } from 'lucide-react';
import { Button } from './components/Button';

const MapleLeafIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M11.66 0.77C11.66 0.77 12.8 4.2 13.06 6.09C13.27 7.58 14.16 8.32 15.35 7.65L18.4 5.95L17.86 9.65C17.7 10.8 18.4 11.95 19.48 12.31L22.58 13.35L19.12 15.28C17.91 15.95 17.43 17.38 18.04 18.48L19.78 21.63L16.29 20.46C15.07 20.05 13.76 20.66 13.36 21.82L12.8 23.5L11.72 20.32C11.31 19.16 10 18.55 8.79 18.96L5.3 20.13L7.04 16.98C7.65 15.88 7.17 14.45 5.96 13.78L2.5 11.85L5.6 10.81C6.68 10.45 7.38 9.3 7.22 8.15L6.68 4.45L9.73 6.15C10.92 6.82 11.81 6.08 12.03 4.59L12.29 0.77H11.66Z" />
  </svg>
);

const MOCK_TEACHERS: TeacherProfile[] = [
  { id: '1', name: 'Sarah Jenkins', email: 's.jenkins@school.ca', subject: 'Mathematics', grade: 'Grade 4', status: 'active', joinedDate: '2023-09-01', lessonsCreated: 42 },
  { id: '2', name: 'Mike Ross', email: 'm.ross@school.ca', subject: 'Science', grade: 'Grade 6', status: 'active', joinedDate: '2023-09-15', lessonsCreated: 15 },
  { id: '3', name: 'Jessica Pearson', email: 'j.pearson@school.ca', subject: 'Language', grade: 'Grade 8', status: 'pending', joinedDate: '2023-10-20', lessonsCreated: 0 },
];

type View = 'landing' | 'login' | 'features' | 'resources' | 'pricing' | 'school-dashboard' | 'teacher-dashboard' | 'lesson-creator' | 'lesson-view';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Data State
  const [registeredTeachers, setRegisteredTeachers] = useState<TeacherProfile[]>(() => {
    try {
      const saved = localStorage.getItem('mapleprep_teachers');
      return saved ? JSON.parse(saved) : MOCK_TEACHERS;
    } catch {
      return MOCK_TEACHERS;
    }
  });

  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [savedLessons, setSavedLessons] = useState<LessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // School Trial & Signup State
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [pendingSchoolData, setPendingSchoolData] = useState<{name: string, email: string} | null>(null);
  const [directSignupName, setDirectSignupName] = useState('');
  const [directSignupEmail, setDirectSignupEmail] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [trialInterval, setTrialInterval] = useState<'month' | 'year'>('month');

  // Load Lessons from LocalStorage on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mapleprep_lessons');
      if (saved) {
        setSavedLessons(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Sync teachers to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('mapleprep_teachers', JSON.stringify(registeredTeachers));
    } catch (e) {
      console.error("Failed to save teachers to local storage", e);
    }
  }, [registeredTeachers]);

  // Helper to safely save lessons to local storage handling quota limits
  const saveLessonsToStorage = (lessons: LessonPlan[]) => {
    try {
      localStorage.setItem('mapleprep_lessons', JSON.stringify(lessons));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        alert("⚠️ Storage Limit Reached\n\nYour browser's local storage is full because of the images in your lessons. To save new lessons, please delete some old ones from your library.");
      } else {
        console.error("Failed to save lessons", e);
      }
    }
  };

  const saveToHistory = (plan: LessonPlan) => {
    const updated = [plan, ...savedLessons];
    setSavedLessons(updated);
    saveLessonsToStorage(updated);
  };

  const updateLessonPlan = (updatedPlan: LessonPlan) => {
    setLessonPlan(updatedPlan);
    
    // Update in history
    const lessonIndex = savedLessons.findIndex(l => l.id === updatedPlan.id);
    let updatedHistory;
    
    if (lessonIndex >= 0) {
      updatedHistory = [...savedLessons];
      updatedHistory[lessonIndex] = updatedPlan;
    } else {
      updatedHistory = [updatedPlan, ...savedLessons];
    }
    
    setSavedLessons(updatedHistory);
    saveLessonsToStorage(updatedHistory);
  };

  const handleSaveCopy = (plan: LessonPlan) => {
    const copy: LessonPlan = {
      ...plan,
      id: crypto.randomUUID(),
      topic: `${plan.topic} (Copy)`,
      createdAt: new Date().toISOString()
    };
    saveToHistory(copy);
    setLessonPlan(copy);
    alert("Lesson copy saved to your library!");
  };

  const deleteLesson = (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    const updated = savedLessons.filter(l => l.id !== id);
    setSavedLessons(updated);
    saveLessonsToStorage(updated);
  };

  // Teacher Management Functions
  const handleAddTeacher = (teacher: TeacherProfile) => {
    setRegisteredTeachers(prev => [...prev, teacher]);
  };

  const handleUpdateTeacherStatus = (id: string, status: 'active' | 'pending') => {
    setRegisteredTeachers(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleDeleteTeacher = (id: string) => {
    setRegisteredTeachers(prev => {
      const updated = prev.filter(t => t.id !== id);
      return [...updated];
    });
  };

  const handleGenerate = async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const rawPlan = await generateLessonPlan(params);
      
      const plan: LessonPlan = {
        ...rawPlan,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };

      setLessonPlan(plan);
      saveToHistory(plan);
      setCurrentView('lesson-view');

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (type: UserType, name: string, email: string) => {
    setUser({ type, name, email });
    if (type === 'school') {
      setCurrentView('school-dashboard');
    } else {
      setCurrentView('teacher-dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSchoolSignup = (name: string, email: string) => {
    setPendingSchoolData({ name, email });
    setShowTrialModal(true);
  };

  const handlePricingGetStarted = () => {
    // Open modal without pre-filled data, allowing direct signup
    setPendingSchoolData(null);
    setDirectSignupName('');
    setDirectSignupEmail('');
    setShowTrialModal(true);
  };

  const handleStartTrial = () => {
    // Determine user details based on flow (Login Page vs Pricing Page)
    const finalName = pendingSchoolData?.name || directSignupName;
    const finalEmail = pendingSchoolData?.email || directSignupEmail;

    if (!finalName || !finalEmail) {
        alert("Please enter your School Name and Administrator Email to create your account.");
        return;
    }

    setPaymentProcessing(true);
    setTimeout(() => {
        const today = new Date();
        const trialEnd = new Date(today);
        trialEnd.setDate(today.getDate() + 2); // 2 Day Trial
        
        const amount = trialInterval === 'month' ? 89 : 890;

        const subscription: SubscriptionDetails = {
            status: 'trial',
            planId: 'elite',
            amount: amount,
            interval: trialInterval,
            startDate: today.toISOString().split('T')[0],
            nextBillingDate: trialEnd.toISOString().split('T')[0],
            trialEndDate: trialEnd.toISOString().split('T')[0],
            paymentMethod: { brand: 'VISA', last4: '1234' }
        };

        setUser({
            type: 'school',
            name: finalName,
            email: finalEmail,
            subscription: subscription
        });

        setPaymentProcessing(false);
        setShowTrialModal(false);
        setPendingSchoolData(null);
        setDirectSignupName('');
        setDirectSignupEmail('');
        setCurrentView('school-dashboard');
    }, 1500);
  };

  const handleUpdateSubscription = (updates: Partial<SubscriptionDetails>) => {
    if (user && user.subscription) {
        setUser({
            ...user,
            subscription: { ...user.subscription, ...updates }
        });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setShowProfileDropdown(false);
    setCurrentView('landing');
    setLessonPlan(null);
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper for Trial Date Text
  const getTrialEndText = () => {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    return today.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // --- RENDER LOGIC --- //

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-100 selection:text-red-900 flex flex-col">
      
      {/* View Switcher */}
      {currentView === 'login' ? (
        <LoginPage 
          onLogin={handleLogin} 
          onSchoolSignup={handleSchoolSignup}
          registeredTeachers={registeredTeachers}
        />
      ) : (
        <>
          {/* Navbar */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => {
                  if (user) {
                    navigateTo(user.type === 'school' ? 'school-dashboard' : 'teacher-dashboard');
                  } else {
                    navigateTo('landing');
                  }
                }}
              >
                <div className="bg-red-600 p-1.5 rounded-lg text-white shadow-md shadow-red-200">
                  <MapleLeafIcon className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Maple<span className="text-red-600">Prep</span>
                </span>
              </div>

              <div className="hidden md:flex items-center gap-6">
                {!user && (
                  <>
                    <button onClick={() => navigateTo('features')} className={`text-sm font-medium hover:text-red-600 ${currentView === 'features' ? 'text-red-600' : 'text-slate-600'}`}>Features</button>
                    <button onClick={() => navigateTo('resources')} className={`text-sm font-medium hover:text-red-600 ${currentView === 'resources' ? 'text-red-600' : 'text-slate-600'}`}>Resources</button>
                    <button onClick={() => navigateTo('pricing')} className={`text-sm font-medium hover:text-red-600 ${currentView === 'pricing' ? 'text-red-600' : 'text-slate-600'}`}>Pricing</button>
                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                  </>
                )}

                {user ? (
                   <div className="relative">
                     <button 
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900"
                     >
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-700">
                          {user.type === 'teacher' ? <UserIcon className="w-4 h-4"/> : <Building2 className="w-4 h-4"/>}
                        </div>
                        {user.name}
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                     </button>
                     
                     {showProfileDropdown && (
                       <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fadeIn">
                          <button onClick={() => {
                            navigateTo(user.type === 'school' ? 'school-dashboard' : 'teacher-dashboard');
                            setShowProfileDropdown(false);
                          }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2">
                            {user.type === 'school' ? <Building2 className="w-4 h-4"/> : <UserIcon className="w-4 h-4"/>} Dashboard
                          </button>
                          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 flex items-center gap-2 border-t border-slate-50">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                       </div>
                     )}
                   </div>
                ) : (
                   <button 
                     onClick={() => navigateTo('login')}
                     className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
                   >
                     Sign In
                   </button>
                )}
              </div>
              
              <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-4 shadow-xl">
                 {!user && (
                   <>
                     <button onClick={() => navigateTo('features')} className="block w-full text-left text-sm font-medium text-slate-600">Features</button>
                     <button onClick={() => navigateTo('resources')} className="block w-full text-left text-sm font-medium text-slate-600">Resources</button>
                     <button onClick={() => navigateTo('pricing')} className="block w-full text-left text-sm font-medium text-slate-600">Pricing</button>
                   </>
                 )}
                 
                 <div className="border-t border-slate-100 pt-4 mt-2">
                    {!user ? (
                       <button onClick={() => navigateTo('login')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold">Sign In</button>
                    ) : (
                      <div className="space-y-3">
                        <button onClick={() => navigateTo(user.type === 'school' ? 'school-dashboard' : 'teacher-dashboard')} className="w-full text-left text-sm font-bold text-slate-900">Dashboard</button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-red-600 py-2">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </header>

          {/* Main Content Area */}
          <main className="flex-1 w-full">
            {error && (
              <div className="max-w-7xl mx-auto px-4 mt-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-fadeIn">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* View Routing */}
            {currentView === 'landing' && (
              <div className="flex flex-col">
                <div className="text-center py-20 px-4">
                   <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                     Classroom prep done in <br className="hidden md:block"/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">seconds, not hours.</span>
                   </h1>
                   <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
                     The #1 AI lesson planner for Canadian elementary teachers. Generate curriculum-aligned slides, worksheets, and quizzes instantly.
                   </p>
                   <div className="flex flex-col sm:flex-row gap-4 justify-center">
                     <button 
                       onClick={() => {
                         const hasSavedEmail = localStorage.getItem('mapleprep_saved_email');
                         if (hasSavedEmail) {
                           navigateTo('login');
                         } else {
                           navigateTo('pricing');
                         }
                       }} 
                       className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold shadow-xl shadow-red-200 hover:bg-red-700 hover:scale-105 transition-all text-lg flex items-center justify-center gap-2"
                     >
                       Get Started <ArrowRight className="w-5 h-5"/>
                     </button>
                     <button onClick={() => navigateTo('features')} className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all text-lg">
                       View Features
                     </button>
                   </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 w-full">
                  <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden mb-20">
                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold mb-4">"MaplePrep has saved me hours every week!"</h2>
                      <p className="opacity-70">- Sarah J., Grade 4 Teacher, Toronto DSB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'features' && <FeaturesPage />}
            {currentView === 'resources' && <ResourcesPage />}
            {currentView === 'pricing' && <PricingPage onGetStarted={handlePricingGetStarted} />}

            {currentView === 'school-dashboard' && user?.type === 'school' && (
              <SchoolDashboard 
                schoolName={user.name} 
                teachers={registeredTeachers}
                onAddTeacher={handleAddTeacher}
                onUpdateTeacherStatus={handleUpdateTeacherStatus}
                onDeleteTeacher={handleDeleteTeacher}
                subscription={user.subscription}
                onUpdateSubscription={handleUpdateSubscription}
              />
            )}

            {currentView === 'teacher-dashboard' && user?.type === 'teacher' && (
              <TeacherDashboard 
                teacherName={user.name} 
                savedLessons={savedLessons}
                onCreateClick={() => setCurrentView('lesson-creator')}
                onLessonClick={(plan) => { setLessonPlan(plan); setCurrentView('lesson-view'); }}
                onDeleteLesson={deleteLesson}
                onSaveLesson={saveToHistory}
              />
            )}

            {currentView === 'lesson-creator' && (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={() => navigateTo('teacher-dashboard')} className="text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 flex items-center gap-1">
                  &larr; Back to Dashboard
                </button>
                <PresentationForm onSubmit={handleGenerate} isLoading={isLoading} />
              </div>
            )}

            {currentView === 'lesson-view' && lessonPlan && (
              <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-64px)]">
                 <div className="mb-4">
                    <button onClick={() => navigateTo('teacher-dashboard')} className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
                      &larr; Back to Dashboard
                    </button>
                 </div>
                 <PresentationView 
                   lessonPlan={lessonPlan} 
                   onReset={() => navigateTo('teacher-dashboard')} 
                   onUpdateLesson={updateLessonPlan}
                   onSaveCopy={handleSaveCopy}
                 />
              </div>
            )}
          </main>
        </>
      )}

      {/* SHARED TRIAL PAYMENT MODAL - Works on Login or Pricing Page */}
      {showTrialModal && (
          <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                  <button 
                      onClick={() => setShowTrialModal(false)} 
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
                  >
                      <X className="w-6 h-6" />
                  </button>
                  
                  <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 text-yellow-600">
                          <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">Start Your Free Trial</h2>
                      <p className="text-slate-500 text-sm">Enjoy 2 full days of MaplePrep Elite.</p>
                  </div>

                  <div className="p-6 space-y-6">
                      
                      {/* If coming from Pricing Page, ask for account details */}
                      {!pendingSchoolData && (
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-fadeIn">
                              <h3 className="font-bold text-blue-900 text-xs uppercase mb-3 flex items-center gap-2"><UserIcon className="w-3 h-3"/> Create School Account</h3>
                              <div className="space-y-3">
                                  <div>
                                      <input 
                                        type="text" 
                                        className="w-full p-2.5 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="School Name (e.g. Maple Grove)" 
                                        value={directSignupName} 
                                        onChange={e => setDirectSignupName(e.target.value)} 
                                        autoFocus
                                      />
                                  </div>
                                  <div>
                                      <input 
                                        type="email" 
                                        className="w-full p-2.5 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="Administrator Email" 
                                        value={directSignupEmail} 
                                        onChange={e => setDirectSignupEmail(e.target.value)} 
                                      />
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Plan Selector */}
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                         <button 
                           onClick={() => setTrialInterval('month')} 
                           className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${trialInterval === 'month' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
                         >
                           Monthly ($89)
                         </button>
                         <button 
                           onClick={() => setTrialInterval('year')} 
                           className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${trialInterval === 'year' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
                         >
                           Yearly ($890)
                         </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <div>
                              <h3 className="font-bold text-slate-900 text-sm">MaplePrep Elite</h3>
                              <div className="text-xs text-yellow-700 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> 2-Day Free Trial
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="font-bold text-slate-900">${trialInterval === 'month' ? '89.00' : '890.00'}</div>
                              <div className="text-xs text-slate-500">/{trialInterval === 'month' ? 'mo' : 'yr'} after trial</div>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <label className="block text-xs font-bold text-slate-700 uppercase">Payment Method</label>
                          <div className="relative">
                              <CreditCard className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                              <input type="text" className="w-full pl-10 p-3 border rounded-lg" placeholder="Card Number" defaultValue="4242 4242 4242 4242" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              <div className="relative">
                                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                  <input type="text" className="w-full pl-10 p-3 border rounded-lg" placeholder="MM / YY" defaultValue="12 / 25" />
                              </div>
                              <div className="relative">
                                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                  <input type="text" className="w-full pl-10 p-3 border rounded-lg" placeholder="CVC" defaultValue="123" />
                              </div>
                          </div>
                      </div>

                      <div className="text-xs text-slate-500 text-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                          You won't be charged today. Your trial ends on <strong>{getTrialEndText()}</strong>. 
                          You will be automatically charged <strong>${trialInterval === 'month' ? '89.00' : '890.00'}</strong> on that day unless you cancel.
                      </div>

                      <Button 
                          onClick={handleStartTrial} 
                          disabled={paymentProcessing}
                          className="w-full py-4 text-lg bg-yellow-500 hover:bg-yellow-600 text-white shadow-xl shadow-yellow-200 border-none"
                      >
                          {paymentProcessing ? 'Setting up Account...' : 'Start Free Trial'}
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
