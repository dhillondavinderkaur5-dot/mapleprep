
import React, { useState, useEffect } from 'react';
import { User, Lock, School as SchoolIcon, Mail, CheckCircle, ArrowLeft, Loader2, ShieldAlert, ShieldCheck, Database, AlertTriangle, Info, Settings, GraduationCap, Building2, Shield, KeyRound, CreditCard, Calendar as CalendarIcon, Hash } from 'lucide-react';
import { UserType, PlanId } from '../types';
import { loginUser, registerUser, createUserProfile, resetPassword, checkInvitation, claimInvitation } from '../services/auth';
import { auth } from '../services/firebase';
import { Button } from './Button';

type AuthMode = 'signin' | 'signup' | 'forgot-password';

interface LoginPageProps {
  onLogin: (userType: UserType, name: string, email: string) => void;
  onSchoolSignup: (name: string, email: string) => void;
  registeredTeachers: any[];
  onNavigateToPricing: () => void;
  initialMode?: AuthMode;
  selectedPlan?: PlanId | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLogin, 
  onSchoolSignup, 
  registeredTeachers, 
  onNavigateToPricing,
  initialMode = 'signin',
  selectedPlan
}) => {
  const [selectedType, setSelectedType] = useState<UserType>('teacher');
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return {
      isValid: minLength && hasNumber && hasSpecial,
      minLength,
      hasNumber,
      hasSpecial
    };
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) setIdentifier(emailParam);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const email = identifier.trim().toLowerCase();
    (window as any).lastUsedEmail = email; // Store for Stripe helper

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        
        const validation = validatePassword(password);
        if (!validation.isValid) {
          throw new Error("Password must be at least 8 characters and include at least one number and one special character.");
        }

        const user = await registerUser(email, password);
        await createUserProfile(user, fullName, selectedType);
        setIsSuccess(true);
        onLogin(selectedType, fullName, email);
      } else if (mode === 'signin') {
        await loginUser(email, password);
        setIsSuccess(true);
        onLogin(selectedType, 'Teacher', email);
      } else {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToLogin = () => {
    setResetSent(false);
    setMode('signin');
  };

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center animate-fadeIn">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-8">
            <Mail className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Check Your Inbox</h2>
          <p className="text-slate-500 mb-8">Password reset link sent to <strong>{identifier}</strong></p>
          <Button onClick={handleReturnToLogin} className="w-full">Return to Sign In</Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center animate-fadeIn">
          <div className="w-24 h-24 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-8 animate-bounce-subtle">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Account Verified</h2>
          <p className="text-slate-500 mb-8">Preparing your secure checkout session...</p>
          <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex flex-col md:flex-row bg-slate-50 animate-fadeIn">
      <div className="md:w-1/2 bg-slate-900 text-white p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-4" onClick={() => window.location.reload()}>
            <div className="bg-red-600 p-2 rounded-lg shadow-lg cursor-pointer"><SchoolIcon className="w-8 h-8 text-white" /></div>
            <span className="text-3xl font-extrabold tracking-tight text-white cursor-pointer">Maple<span className="text-red-600">Prep</span></span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest mb-8">
             <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> 🇨🇦 Secure Canadian Gateway
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            {mode === 'signup' ? 'Start Your 24-Hour Trial.' : 'Canadian Classroom Planning, Optimized.'}
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-10">
            {mode === 'signup' ? `Confirm your details to proceed to the Stripe secure payment page.` : 'Log in to your school dashboard or start a free trial for immediate curriculum alignment.'}
          </p>
        </div>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className={`max-w-md w-full bg-white md:shadow-2xl border border-slate-100 rounded-[2rem] p-10 transition-all ${mode === 'signup' ? 'max-h-[90vh] overflow-y-auto no-scrollbar' : ''}`}>
          
          {mode !== 'forgot-password' && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 shadow-inner">
               {(['teacher', 'school', 'admin'] as UserType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedType === type 
                        ? 'bg-white text-slate-900 shadow-md' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type === 'teacher' && <GraduationCap className="w-4 h-4" />}
                    {type === 'school' && <Building2 className="w-4 h-4" />}
                    {type === 'admin' && <Shield className="w-4 h-4" />}
                    {type}
                  </button>
               ))}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              {mode === 'forgot-password' ? 'Enter your email for a reset link' : mode === 'signup' ? 'Step 1: Account Creation' : `Step 2: Access the ${selectedType} Dashboard`}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-3 animate-shake">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-all font-medium" placeholder="Sarah Jenkins" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required value={identifier} onChange={e => setIdentifier(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-all font-medium" placeholder="name@school.ca" />
              </div>
            </div>
            
            {mode !== 'forgot-password' && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-all font-medium" placeholder="••••••••" />
                </div>
                {mode === 'signup' && password.length > 0 && (
                  <div className="mt-2 space-y-1 ml-1">
                    <div className={`text-[9px] font-bold flex items-center gap-1.5 ${password.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>
                      <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-green-600' : 'bg-slate-300'}`} />
                      At least 8 characters
                    </div>
                    <div className={`text-[9px] font-bold flex items-center gap-1.5 ${/\d/.test(password) ? 'text-green-600' : 'text-slate-400'}`}>
                      <div className={`w-1 h-1 rounded-full ${/\d/.test(password) ? 'bg-green-600' : 'bg-slate-300'}`} />
                      At least one number
                    </div>
                    <div className={`text-[9px] font-bold flex items-center gap-1.5 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-slate-400'}`}>
                      <div className={`w-1 h-1 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'bg-green-600' : 'bg-slate-300'}`} />
                      At least one special character
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 transition-all font-medium" placeholder="••••••••" />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest mt-4 transition-all flex items-center justify-center gap-3 shadow-lg ${
                selectedType === 'admin' ? 'bg-slate-900 hover:bg-slate-800' : 
                selectedType === 'school' ? 'bg-blue-600 hover:bg-blue-700' : 
                'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Working...</>
              ) : (
                mode === 'forgot-password' ? 'Send Reset Link' : 
                mode === 'signup' ? 'Register & Start Trial' : `Sign In`
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4 text-center text-xs font-bold text-slate-400 pb-4">
            {mode === 'signin' && (
              <>
                <button onClick={() => setMode('forgot-password')} className="text-slate-400 hover:text-red-600 transition-colors">
                  Forgot Password?
                </button>
                <div>
                  New to MaplePrep?
                  <button onClick={onNavigateToPricing} className="ml-2 font-black text-red-600 hover:underline">
                    Start Free Trial
                  </button>
                </div>
              </>
            )}
            {mode === 'signup' && (
              <div>
                Already have an account?
                <button onClick={() => setMode('signin')} className="ml-2 font-black text-red-600 hover:underline">
                  Sign In instead
                </button>
              </div>
            )}
            {mode === 'forgot-password' && (
              <button onClick={() => setMode('signin')} className="font-black text-slate-400 hover:text-slate-900 flex items-center justify-center gap-2">
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
