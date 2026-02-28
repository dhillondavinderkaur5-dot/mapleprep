
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PresentationForm } from './components/PresentationForm';
import { PresentationView } from './components/PresentationView';
import { FeaturesPage, ResourcesPage, PrivacyPage, TermsPage } from './components/StaticPages';
import { PricingPage } from './components/PricingPage';
import { LoginPage } from './components/LoginPage';
import { SchoolDashboard } from './components/SchoolDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminPortal } from './components/AdminPortal';
import { AIChatAssistant } from './components/AIChatAssistant';
import { generateLessonPlan } from './services/geminiService';
import { GenerationParams, LessonPlan, TeacherProfile, UserProfile, UserType, PlanId, SubscriptionDetails } from './types';
import { LogOut, ChevronDown, User as UserIcon, Building2, ArrowRight, Loader2, Shield, AlertCircle, ShieldCheck, CreditCard, RefreshCw, Check, Info, HelpCircle } from 'lucide-react';
import { auth } from './services/firebase';
import * as authModule from 'firebase/auth';
const { onAuthStateChanged } = authModule as any;
import { getUserProfile, logoutUser, createUserProfile, getSchoolStaff, deleteStaffInvitation } from './services/auth';
import { getUserLessons, saveUserLesson, deleteUserLesson } from './services/repository';
import { createCheckoutSession, getActiveSubscription } from './services/paymentService';

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
      <text x="256" y="295" textAnchor="middle" fill="white" fontSize="80" fontWeight="900" fontFamily="'Arial Narrow', sans-serif" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))' }}>Prep</text>
    </g>
  </svg>
);

type View = 'landing' | 'login' | 'signup' | 'features' | 'resources' | 'pricing' | 'school-dashboard' | 'teacher-dashboard' | 'admin-portal' | 'lesson-creator' | 'lesson-view' | 'privacy' | 'terms';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStripeRedirecting, setIsStripeRedirecting] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [showStuckHint, setShowStuckHint] = useState(false);
  
  const [savedLessons, setSavedLessons] = useState<LessonPlan[]>([]);
  const [registeredTeachers, setRegisteredTeachers] = useState<TeacherProfile[]>([]);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  
  // Synchronous check for Stripe return to prevent race conditions with Auth observer
  const stripeReturnStatus = useRef<string | null>(new URLSearchParams(window.location.search).get('payment_status'));
  
  const [urlPaymentStatus] = useState<string | null>(stripeReturnStatus.current);

  // Use a more persistent way to track if we are in a Stripe flow
  const [isProcessingStripe] = useState(() => {
    return !!stripeReturnStatus.current || !!localStorage.getItem('selectedPlan');
  });

  const hasTriggeredRedirect = useRef(false);

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
    setShowProfileDropdown(false);
    setError(null);
    setStripeError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goHome = useCallback(() => {
    if (!user) {
      navigateTo('landing');
      return;
    }
    
    // Check if user has an active subscription (or is admin/school)
    const hasAccess = user.type !== 'teacher' || (user.subscription && (user.subscription.status === 'active' || user.subscription.status === 'trialing'));
    
    if (!hasAccess) {
      navigateTo('pricing');
      return;
    }

    if (user.type === 'admin') navigateTo('admin-portal');
    else if (user.type === 'school') navigateTo('school-dashboard');
    else navigateTo('teacher-dashboard');
  }, [user, navigateTo]);

  // Handle returning from Stripe (Canceled or Success)
  useEffect(() => {
    if (urlPaymentStatus === 'canceled' || urlPaymentStatus === 'success') {
      console.log(`[Stripe] 🔄 Handling return with status: ${urlPaymentStatus}`);
      
      // Clear the plan from storage immediately to stop the redirect loop
      localStorage.removeItem('selectedPlan');
      hasTriggeredRedirect.current = true;
      
      // Clean up URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (urlPaymentStatus === 'canceled') {
        navigateTo('pricing');
      }
    }
  }, [urlPaymentStatus, navigateTo]);

  // Auth Sync & Stripe Redirect Logic
  useEffect(() => {
    if (!auth) {
      setAuthChecking(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        try {
          // 1. STRIPE REDIRECT CHECK
          const storedPlan = localStorage.getItem('selectedPlan') as PlanId | null;
          
          if (storedPlan && !hasTriggeredRedirect.current) {
            hasTriggeredRedirect.current = true;
            setIsStripeRedirecting(true);
            setIsLoading(true);
            
            // Set a hint timer
            setTimeout(() => setShowStuckHint(true), 12000);

            try {
              let profile = await getUserProfile(firebaseUser.uid);
              if (!profile) {
                await createUserProfile(firebaseUser, firebaseUser.displayName || 'Teacher', 'teacher');
              }
              localStorage.removeItem('selectedPlan'); // Clear it so we don't loop on refresh
              await createCheckoutSession(firebaseUser.uid, storedPlan, 'month');
            } catch (err: any) {
              if (err.message === "GATEWAY_TIMEOUT") {
                setStripeError("The Stripe Extension is taking too long to respond. Please ensure the 'Run Payments with Stripe' extension is configured in your Firebase Console.");
              } else {
                setStripeError(err.message || "Failed to start checkout.");
              }
              setIsStripeRedirecting(false);
              setIsLoading(false);
              hasTriggeredRedirect.current = false;
            }
            return;
          }

          if (isStripeRedirecting && !stripeError) {
            setAuthChecking(false);
            return;
          }

          const profile = await getUserProfile(firebaseUser.uid);
          const stripeSub = await getActiveSubscription(firebaseUser.uid);

          const ADMIN_EMAILS = ['dhillondavinderkaur5@gmail.com'];
          const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase());

          let userData: UserProfile = profile || {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || (isAdmin ? 'Admin' : 'Teacher'),
            email: firebaseUser.email || '',
            type: isAdmin ? 'admin' : 'teacher'
          };
          
          // Force admin type if email matches, regardless of database profile
          if (isAdmin) {
            userData = { ...userData, type: 'admin' };
          }
          
          if (userData.type === 'school') {
            const staff = await getSchoolStaff(userData.id);
            setRegisteredTeachers(staff);
          }
          
          if (stripeSub) {
            const currentUsage = profile?.subscription?.imagesUsedThisMonth || 0;
            userData.subscription = {
                status: stripeSub.status,
                planId: stripeSub.items?.[0]?.plan?.nickname?.toLowerCase() || 'pro',
                interval: stripeSub.items?.[0]?.plan?.interval || 'month',
                amount: (stripeSub.items?.[0]?.plan?.amount || 0) / 100,
                startDate: stripeSub.created ? new Date(stripeSub.created.seconds * 1000).toISOString() : '',
                nextBillingDate: stripeSub.current_period_end ? new Date(stripeSub.current_period_end.seconds * 1000).toISOString() : '',
                imagesUsedThisMonth: currentUsage,
                imageLimit: stripeSub.status === 'active' || stripeSub.status === 'trialing' ? 200 : 50
            };
          }
          
          setUser(userData);
          
          // CRITICAL: If we are in a Stripe flow (either redirecting or returning), 
          // DO NOT auto-redirect to dashboard for TEACHERS.
          // ADMINS always bypass this and go to their portal.
          const isStripeFlow = isProcessingStripe || !!urlPaymentStatus || isStripeRedirecting || !!stripeReturnStatus.current;
          
          if (['landing', 'login', 'signup'].includes(currentView)) {
            if (userData.type === 'admin') {
              navigateTo('admin-portal');
            } else if (!isStripeFlow) {
              if (userData.type === 'school') navigateTo('school-dashboard');
              else navigateTo('teacher-dashboard');
            }
          }
        } catch (err) {
          console.error("Auth profile sync failed:", err);
        }
      } else {
        if (user) setUser(null);
        if (['teacher-dashboard', 'school-dashboard', 'admin-portal', 'lesson-creator', 'lesson-view'].includes(currentView)) {
          navigateTo('landing');
        }
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, [currentView, navigateTo, isStripeRedirecting, stripeError, urlPaymentStatus]);

  useEffect(() => {
    if (user?.id) {
      getUserLessons(user.id).then(setSavedLessons).catch(e => console.error(e));
    }
  }, [user?.id]);

  const handleSaveLesson = async (lesson: LessonPlan) => {
    if (!user) return;
    try {
      await saveUserLesson(user.id, lesson);
      setSavedLessons(prev => [lesson, ...prev.filter(l => l.id !== lesson.id)]);
    } catch (err) { console.error(err); }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!user) return;
    try {
      await deleteUserLesson(user.id, id);
      setSavedLessons(prev => prev.filter(l => l.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!user || user.type !== 'school') return;
    try {
      // Find the teacher to get their email
      const teacher = registeredTeachers.find(t => t.id === id);
      if (teacher) {
        await deleteStaffInvitation(teacher.email);
        setRegisteredTeachers(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch (e) {}
    setUser(null);
    setRegisteredTeachers([]);
    setShowProfileDropdown(false);
    localStorage.removeItem('selectedPlan');
    hasTriggeredRedirect.current = false;
    navigateTo('landing');
  };

  const renderMainContent = () => {
    if (stripeError) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fadeIn px-4">
           <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-red-50 flex flex-col items-center gap-6 max-w-lg text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                 <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">Activation Encountered a Delay</h2>
              <div className="p-6 bg-slate-50 rounded-2xl text-slate-600 text-sm font-medium border border-slate-100 leading-relaxed text-left space-y-4">
                 <div className="flex gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="font-bold">{stripeError}</p>
                 </div>
                 <p className="text-xs text-slate-400">Please check your browser console (F12) for more detailed error logs from the Stripe extension.</p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                 <button onClick={() => window.location.reload()} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-red-700 transition-all">
                    <RefreshCw className="w-4 h-4" /> Try Again
                 </button>
                 <button onClick={handleLogout} className="w-full py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors">Cancel & Return to Home</button>
              </div>
           </div>
        </div>
      );
    }

    if (isStripeRedirecting) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fadeIn px-4">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-8 w-full max-w-md text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
               <Check className="w-12 h-12 stroke-[3px]" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Account Verified</h2>
              <p className="text-slate-400 font-medium text-lg px-4 leading-relaxed">Securing your checkout session... Please do not refresh.</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
               <div className="relative w-10 h-10">
                 <div className="absolute inset-0 border-[4px] border-slate-100 rounded-full"></div>
                 <div className="absolute inset-0 border-[4px] border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
               </div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Stripe Secure Encryption</p>
            </div>

            {showStuckHint && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl animate-fadeIn">
                <p className="text-xs font-bold text-amber-700 flex items-center justify-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4" /> Taking longer than expected?
                </p>
                <p className="text-[10px] text-amber-600 mb-3">Ensure your Stripe Extension is correctly configured to listen to the <code>checkout_sessions</code> collection.</p>
                <button onClick={() => { localStorage.removeItem('selectedPlan'); window.location.reload(); }} className="text-[10px] font-black uppercase text-amber-800 hover:underline">Clear & Try Again</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (!user) {
      switch (currentView) {
        case 'features': return <FeaturesPage />;
        case 'resources': return <ResourcesPage />;
        case 'privacy': return <PrivacyPage />;
        case 'terms': return <TermsPage />;
        case 'pricing': return <PricingPage onGetStarted={(planId) => { localStorage.setItem('selectedPlan', planId); navigateTo('signup'); }} />;
        case 'signup':
        case 'login': return <LoginPage onLogin={() => {}} onSchoolSignup={() => {}} registeredTeachers={registeredTeachers} onNavigateToPricing={() => navigateTo('pricing')} initialMode={currentView === 'signup' ? 'signup' : 'signin'} selectedPlan={localStorage.getItem('selectedPlan') as PlanId} />;
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

    const hasSubscription = user.subscription && (user.subscription.status === 'active' || user.subscription.status === 'trialing');
    const isTeacher = user.type === 'teacher';
    const teacherDashboard = <TeacherDashboard userProfile={user} savedLessons={savedLessons} onCreateClick={() => navigateTo('lesson-creator')} onLessonClick={(lesson) => { setLessonPlan(lesson); navigateTo('lesson-view'); }} onDeleteLesson={handleDeleteLesson} onSaveLesson={handleSaveLesson} />;

    // Guard: Teachers without subscription can only see pricing/static pages
    if (isTeacher && !hasSubscription && !['pricing', 'features', 'resources'].includes(currentView)) {
      return <PricingPage onGetStarted={(planId) => { localStorage.setItem('selectedPlan', planId); navigateTo('signup'); }} />;
    }

    switch (currentView) {
      case 'features': return <FeaturesPage />;
      case 'resources': return <ResourcesPage />;
      case 'privacy': return <PrivacyPage />;
      case 'terms': return <TermsPage />;
      case 'pricing': return <PricingPage onGetStarted={(planId) => { localStorage.setItem('selectedPlan', planId); navigateTo('signup'); }} />;
      case 'admin-portal': return user.type === 'admin' ? <AdminPortal onLogout={handleLogout} /> : teacherDashboard;
      case 'school-dashboard': return user.type === 'school' ? <SchoolDashboard 
        schoolName={user.name} 
        schoolId={user.id} 
        teachers={registeredTeachers} 
        onAddTeacher={(t) => setRegisteredTeachers(p => [t, ...p])} 
        onUpdateTeacherStatus={() => {}} 
        onDeleteTeacher={handleDeleteTeacher} 
        subscription={user.subscription}
      /> : teacherDashboard;
      case 'lesson-creator': return <div className="max-w-4xl mx-auto px-4 py-8"><PresentationForm onSubmit={handleGenerate} onCancel={goHome} isLoading={isLoading} /></div>;
      case 'lesson-view': return lessonPlan ? <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-64px)]"><PresentationView 
        userId={user.id} 
        lessonPlan={lessonPlan} 
        onReset={goHome} 
        onUpdateLesson={setLessonPlan} 
        onSaveLesson={handleSaveLesson} 
        onImageGenerated={() => {
          if (user.subscription) {
            setUser({
              ...user,
              subscription: {
                ...user.subscription,
                imagesUsedThisMonth: (user.subscription.imagesUsedThisMonth || 0) + 1
              }
            });
          }
        }}
      /></div> : teacherDashboard;
      default: return teacherDashboard;
    }
  };

  const handleGenerate = async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generateLessonPlan(params);
      plan.id = 'lesson-' + Date.now(); 
      setLessonPlan(plan);
      navigateTo('lesson-view');
    } catch (err: any) { setError(err.message || "Failed to generate lesson."); }
    finally { setIsLoading(false); }
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
          <div className="flex items-center gap-2 cursor-pointer group" onClick={goHome}>
            <div className="bg-red-600 p-1.5 rounded-lg text-white shadow-md shadow-red-200 group-hover:scale-110 transition-transform"><MapleLeafIcon className="w-5 h-5" /></div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">Maple<span className="text-red-600">Prep</span></span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {!user && (
              <>
                <button onClick={() => navigateTo('features')} className="text-sm font-medium hover:text-red-600 text-slate-600">Features</button>
                <button onClick={() => navigateTo('resources')} className="text-sm font-medium hover:text-red-600 text-slate-600">Resources</button>
                <button onClick={() => navigateTo('pricing')} className="text-sm font-medium hover:text-red-600 text-slate-600">Pricing</button>
                <button onClick={() => navigateTo('login')} className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">Sign In</button>
              </>
            )}
            {user && (
               <div className="relative">
                 <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-700">
                      {user.type === 'teacher' ? <UserIcon className="w-4 h-4"/> : <Building2 className="w-4 h-4"/>}
                    </div>
                    {user.name}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                 </button>
                 {showProfileDropdown && (
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fadeIn">
                      {(user.type !== 'teacher' || (user.subscription && (user.subscription.status === 'active' || user.subscription.status === 'trialing'))) && (
                        <button onClick={goHome} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">Dashboard</button>
                      )}
                      {user.type === 'teacher' && !(user.subscription && (user.subscription.status === 'active' || user.subscription.status === 'trialing')) && (
                        <button onClick={() => { navigateTo('pricing'); setShowProfileDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 flex items-center gap-2">Upgrade to Pro</button>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 flex items-center gap-2 border-t border-slate-50"><LogOut className="w-4 h-4" /> Sign Out</button>
                   </div>
                 )}
               </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {isLoading && !isStripeRedirecting && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
             <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 animate-slideUp">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                <p className="font-black text-slate-900 uppercase tracking-widest text-xs">Securing Canadian Server...</p>
             </div>
          </div>
        )}
        {error && (
          <div className="max-w-4xl mx-auto mt-6 px-4">
             <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-shake shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
             </div>
          </div>
        )}
        <div className="w-full">{renderMainContent()}</div>
      </main>
      
      {['landing', 'features', 'resources', 'pricing', 'login', 'signup', 'privacy', 'terms'].includes(currentView) && (
        <footer className="bg-white border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer group" onClick={goHome}>
                <div className="bg-red-600 p-1.5 rounded-lg text-white shadow-md shadow-red-200 group-hover:scale-110 transition-transform"><MapleLeafIcon className="w-5 h-5" /></div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">Maple<span className="text-red-600">Prep</span></span>
              </div>
              <div className="flex flex-wrap justify-center gap-8">
                <button onClick={() => navigateTo('features')} className="text-sm font-medium text-slate-500 hover:text-red-600">Features</button>
                <button onClick={() => navigateTo('resources')} className="text-sm font-medium text-slate-500 hover:text-red-600">Resources</button>
                <button onClick={() => navigateTo('pricing')} className="text-sm font-medium text-slate-500 hover:text-red-600">Pricing</button>
                <button onClick={() => navigateTo('privacy')} className="text-sm font-medium text-slate-500 hover:text-red-600">Privacy Policy</button>
                <button onClick={() => navigateTo('terms')} className="text-sm font-medium text-slate-500 hover:text-red-600">Terms of Service</button>
              </div>
              <div className="text-slate-400 text-xs font-medium">
                © 2026 MaplePrep Canadian Education. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      )}

      {user && <AIChatAssistant teacherName={user.name} context={currentView === 'lesson-view' ? JSON.stringify(lessonPlan) : undefined} />}
    </div>
  );
};

export default App;
