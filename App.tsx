import React, { useState, useEffect, useCallback } from 'react';
import { PresentationForm } from './components/PresentationForm';
import { PresentationView } from './components/PresentationView';
import { FeaturesPage, ResourcesPage } from './components/StaticPages';
import { PricingPage } from './components/PricingPage';
import { LoginPage } from './components/LoginPage';
import { SchoolDashboard } from './components/SchoolDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminPortal } from './components/AdminPortal';
import { AIChatAssistant } from './components/AIChatAssistant';
import { generateLessonPlan } from './services/geminiService';
import { GenerationParams, LessonPlan, TeacherProfile, UserProfile, UserType, SubscriptionDetails, PlanId } from './types';
import { LogOut, ChevronDown, User as UserIcon, Building2, Menu, X, ArrowRight, ShieldCheck, CreditCard, Lock, Calendar, Clock, Image as ImageIcon, Loader2, Shield, AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from './components/Button';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, logoutUser } from './services/auth';
import { getUserLessons, saveUserLesson, deleteUserLesson } from './services/repository';
import { createPortalSession } from './services/paymentService';

// Fallback for crypto.randomUUID
const getUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const MapleLeafIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M11.66 0.77C11.66 0.77 12.8 4.2 13.06 6.09C13.27 7.58 14.16 8.32 15.35 7.65L18.4 5.95L17.86 9.65C17.7 10.8 18.4 11.95 19.48 12.31L22.58 13.35L19.12 15.28C17.91 15.95 17.43 17.38 18.04 18.48L19.78 21.63L16.29 20.46C15.07 20.05 13.76 20.66 13.36 21.82L12.8 23.5L11.72 20.32C11.31 19.16 10 18.55 8.79 18.96L5.3 20.13L7.04 16.98C7.65 15.88 7.17 14.45 5.96 13.78L2.5 11.85L5.6 10.81C6.68 10.45 7.38 9.3 7.22 8.15L6.68 4.45L9.73 6.15C10.92 6.82 11.81 6.08 12.03 4.59L12.29 0.77H11.66Z" />
  </svg>
);

const MOCK_TEACHERS: TeacherProfile[] = [
  { id: '1', name: 'Sarah Jenkins', email: 's.jenkins@tdsb.on.ca', subject: 'Mathematics', grade: 'Grade 4', role: 'teaching', status: 'active', joinedDate: '2023-09-01', lessonsCreated: 42 },
  { id: '2', name: 'Mike Ross', email: 'm.ross@cbe.ab.ca', subject: 'Science', grade: 'Grade 6', role: 'teaching', status: 'active', joinedDate: '2023-09-15', lessonsCreated: 15 },
];

type View = 'landing' | 'login' | 'features' | 'resources' | 'pricing' | 'school-dashboard' | 'teacher-dashboard' | 'admin-portal' | 'lesson-creator' | 'lesson-view';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDemo, setIsDemo] = useState(false); // Flag to protect demo sessions from Firebase clearing them
  const [authChecking, setAuthChecking] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lesson State
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [savedLessons, setSavedLessons] = useState<LessonPlan[]>([]);
  
  const [registeredTeachers, setRegisteredTeachers] = useState<TeacherProfile[]>(() => {
    try {
      const saved = localStorage.getItem('mapleprep_teachers');
      return saved ? JSON.parse(saved) : MOCK_TEACHERS;
    } catch {
      return MOCK_TEACHERS;
    }
  });

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
    setShowProfileDropdown(false);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Safe dashboard redirect logic based on user type
  const goHome = useCallback(() => {
    if (!user) {
      navigateTo('landing');
      return;
    }
    if (user.type === 'admin') navigateTo('admin-portal');
    else if (user.type === 'school') navigateTo('school-dashboard');
    else navigateTo('teacher-dashboard');
  }, [user, navigateTo]);

  // Sync Auth State
  useEffect(() => {
    if (!auth) {
      setAuthChecking(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // CRITICAL: If we are in a Demo session, do not let the 'null' Firebase user clear the state
      if (isDemo && !firebaseUser) {
        setAuthChecking(false);
        return;
      }

      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          const userData: UserProfile = profile || {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Teacher',
            email: firebaseUser.email || '',
            type: 'teacher'
          };
          
          setUser(userData);
          setIsDemo(false);
          
          // Automatic Dashboard Redirection
          if (['landing', 'login'].includes(currentView)) {
            if (userData.type === 'admin') navigateTo('admin-portal');
            else if (userData.type === 'school') navigateTo('school-dashboard');
            else if (userData.type === 'teacher' && !userData.subscription) navigateTo('pricing');
            else navigateTo('teacher-dashboard');
          }
        } catch (err) {
          console.error("Auth profile sync failed:", err);
          setUser({ id: firebaseUser.uid, name: 'Teacher', email: firebaseUser.email || '', type: 'teacher' });
        }
      } else {
        // Only clear if we aren't demoing
        if (!isDemo) {
          setUser(null);
          if (['teacher-dashboard', 'school-dashboard', 'admin-portal', 'lesson-creator', 'lesson-view'].includes(currentView)) {
            navigateTo('landing');
          }
        }
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, [currentView, navigateTo, isDemo]);

  // Load User Lessons
  useEffect(() => {
    const loadData = async () => {
      if (user && auth?.currentUser) {
        try {
          const cloudLessons = await getUserLessons(auth.currentUser.uid);
          setSavedLessons(cloudLessons);
        } catch (e) {
          console.error("Cloud data fetch failed:", e);
        }
      } else if (!user) {
        try {
          const saved = localStorage.getItem('mapleprep_lessons');
          if (saved) setSavedLessons(JSON.parse(saved));
        } catch {}
      }
    };
    loadData();
  }, [user]);

  // Manual Login Handler (Local state update)
  const handleManualLogin = (type: UserType, name: string, email: string) => {
    setIsDemo(true); // Flag this as a demo/manual session
    const userData: UserProfile = {
      id: getUUID(),
      name,
      email,
      type,
      subscription: type === 'teacher' ? {
        status: 'active',
        planId: 'starter',
        interval: 'month',
        amount: 39,
        startDate: new Date().toISOString(),
        nextBillingDate: new Date().toISOString(),
        imagesUsedThisMonth: 0,
        imageLimit: 50
      } : (type === 'school' ? {
        status: 'active',
        planId: 'school',
        interval: 'month',
        amount: 139,
        startDate: new Date().toISOString(),
        nextBillingDate: new Date().toISOString(),
        imagesUsedThisMonth: 0,
        imageLimit: 1000
      } : undefined)
    };
    setUser(userData);
    
    // Immediate explicit navigation to avoid race conditions
    if (type === 'admin') navigateTo('admin-portal');
    else if (type === 'school') navigateTo('school-dashboard');
    else navigateTo('teacher-dashboard');
  };

  const handleGenerate = async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const rawPlan = await generateLessonPlan(params);
      const plan: LessonPlan = { ...rawPlan, id: getUUID(), createdAt: new Date().toISOString() };
      setLessonPlan(plan);
      
      const updated = [plan, ...savedLessons];
      setSavedLessons(updated);
      localStorage.setItem('mapleprep_lessons', JSON.stringify(updated));
      
      if (user && auth?.currentUser) {
        try { await saveUserLesson(auth.currentUser.uid, plan); } catch (e) {}
      }
      navigateTo('lesson-view');
    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "AI was unable to generate your lesson. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsDemo(false);
      if (auth) await logoutUser();
      setUser(null);
      setLessonPlan(null);
      setSavedLessons([]);
      navigateTo('landing');
    } catch (e) {}
  };

  const handleSaveLessonAction = async (plan: LessonPlan) => {
    if (!user) return;
    
    // Update local state immediately for snappy UX
    setSavedLessons(prev => {
      const exists = prev.find(l => l.id === plan.id);
      if (exists) return prev.map(l => l.id === plan.id ? plan : l);
      return [plan, ...prev];
    });

    if (auth?.currentUser && !isDemo) {
      await saveUserLesson(auth.currentUser.uid, plan);
    } else {
      const current = JSON.parse(localStorage.getItem('mapleprep_lessons') || '[]');
      const existsIdx = current.findIndex((l: any) => l.id === plan.id);
      if (existsIdx > -1) current[existsIdx] = plan;
      else current.unshift(plan);
      localStorage.setItem('mapleprep_lessons', JSON.stringify(current));
    }
  };

  const renderMainContent = () => {
    if (!user) {
      switch (currentView) {
        case 'features': return <FeaturesPage />;
        case 'resources': return <ResourcesPage />;
        case 'pricing': return <PricingPage onGetStarted={() => navigateTo('login')} />;
        case 'login': return (
          <LoginPage 
            onLogin={handleManualLogin} 
            onSchoolSignup={(name, email) => handleManualLogin('school', name, email)} 
            registeredTeachers={registeredTeachers} 
            onNavigateToPricing={() => navigateTo('pricing')} 
          />
        );
        default: return (
          <div className="text-center py-20 px-4 animate-fadeIn">
             <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">Classroom prep done in <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">seconds, not hours.</span></h1>
             <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">The #1 AI lesson planner for Canadian elementary teachers. Generate curriculum-aligned slides, worksheets, and quizzes instantly.</p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button onClick={() => navigateTo('pricing')} className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold shadow-xl shadow-red-200 hover:bg-red-700 hover:scale-105 transition-all text-lg flex items-center justify-center gap-2">Get Started <ArrowRight className="w-5 h-5"/></button>
               <button onClick={() => navigateTo('features')} className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all text-lg">View Features</button>
             </div>
          </div>
        );
      }
    }

    const teacherDashboard = (
      <TeacherDashboard 
        userProfile={user} 
        savedLessons={savedLessons} 
        onCreateClick={() => navigateTo('lesson-creator')} 
        onLessonClick={(l) => { 
          if (l.isWorksheet) {
            // Dashboard handles worksheets internally by setting state and tab
          } else {
            setLessonPlan(l); 
            navigateTo('lesson-view'); 
          }
        }} 
        onDeleteLesson={(id) => deleteUserLesson(user.id, id).then(() => setSavedLessons(prev => prev.filter(l => l.id !== id)))} 
        onSaveLesson={handleSaveLessonAction} 
        usageStats={user.subscription ? { used: user.subscription.imagesUsedThisMonth, limit: user.subscription.imageLimit } : undefined} 
      />
    );

    switch (currentView) {
      case 'admin-portal':
        return user.type === 'admin' ? <AdminPortal onLogout={handleLogout} /> : teacherDashboard;
      
      case 'school-dashboard':
        return user.type === 'school' ? (
          <SchoolDashboard 
            schoolName={user.name} 
            teachers={registeredTeachers} 
            onAddTeacher={(t) => setRegisteredTeachers([...registeredTeachers, t])} 
            onUpdateTeacherStatus={(id, s) => setRegisteredTeachers(prev => prev.map(t => t.id === id ? { ...t, status: s } : t))} 
            onDeleteTeacher={(id) => setRegisteredTeachers(prev => prev.filter(t => t.id !== id))} 
            subscription={user.subscription} 
            onOpenBillingPortal={() => createPortalSession(user.id)} 
          />
        ) : teacherDashboard;

      case 'lesson-creator':
        return <div className="max-w-4xl mx-auto px-4 py-8"><PresentationForm onSubmit={handleGenerate} onCancel={goHome} isLoading={isLoading} /></div>;

      case 'lesson-view':
        return lessonPlan ? (
          <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-64px)]">
             <PresentationView lessonPlan={lessonPlan} onReset={goHome} onUpdateLesson={(p) => { setLessonPlan(p); handleSaveLessonAction(p); }} />
          </div>
        ) : teacherDashboard;

      case 'pricing':
        return <PricingPage onGetStarted={() => navigateTo('teacher-dashboard')} />;

      default:
        return teacherDashboard;
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-red-600 mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Classrooms...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={goHome}
            title="Go to Dashboard"
          >
            <div className="bg-red-600 p-1.5 rounded-lg text-white shadow-md shadow-red-200 group-hover:scale-110 transition-transform"><MapleLeafIcon className="w-5 h-5" /></div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">Maple<span className="text-red-600">Prep</span></span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {!user && (
              <>
                <button onClick={() => navigateTo('features')} className={`text-sm font-medium hover:text-red-600 ${currentView === 'features' ? 'text-red-600' : 'text-slate-600'}`}>Features</button>
                <button onClick={() => navigateTo('resources')} className={`text-sm font-medium hover:text-red-600 ${currentView === 'resources' ? 'text-red-600' : 'text-slate-600'}`}>Resources</button>
                <button onClick={() => navigateTo('pricing')} className={`text-sm font-medium hover:text-red-600 ${currentView === 'pricing' ? 'text-red-600' : 'text-slate-600'}`}>Pricing</button>
                <button onClick={() => navigateTo('login')} className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">Sign In</button>
              </>
            )}
            {user && (
               <div className="relative">
                 <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-700">
                      {user.type === 'teacher' ? <UserIcon className="w-4 h-4"/> : user.type === 'admin' ? <Shield className="w-4 h-4"/> : <Building2 className="w-4 h-4"/>}
                    </div>
                    {user.name}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                 </button>
                 {showProfileDropdown && (
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fadeIn">
                      <button onClick={goHome} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">Dashboard</button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 flex items-center gap-2 border-t border-slate-50"><LogOut className="w-4 h-4" /> Sign Out</button>
                   </div>
                 )}
               </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {error && (
          <div className="max-w-4xl mx-auto mt-6 px-4">
             <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-shake shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
                <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-lg"><X className="w-4 h-4"/></button>
             </div>
          </div>
        )}

        <div className="w-full">
           {renderMainContent()}
        </div>
      </main>

      {user && <AIChatAssistant teacherName={user.name} context={currentView === 'lesson-view' ? JSON.stringify(lessonPlan) : undefined} />}
    </div>
  );
};

export default App;