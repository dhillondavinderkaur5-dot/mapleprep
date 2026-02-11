import React, { useState } from 'react';
import { User, Building2, Lock, ArrowRight, School as SchoolIcon, Mail, X, CheckCircle, ArrowLeft, ShieldCheck, Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import { PROVINCES } from '../constants';
import { Province, TeacherProfile, UserType, SubscriptionDetails } from '../types';
import { loginUser, registerUser, createUserProfile, getUserProfile } from '../services/auth';
import { auth } from '../services/firebase';

type AuthMode = 'signin' | 'signup';

interface LoginPageProps {
  onLogin: (userType: UserType, name: string, email: string) => void;
  onSchoolSignup: (name: string, email: string) => void;
  registeredTeachers: TeacherProfile[];
  onNavigateToPricing: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSchoolSignup, registeredTeachers, onNavigateToPricing }) => {
  const [selectedType, setSelectedType] = useState<UserType>('teacher');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');

  const validatePassword = (pass: string) => {
    return pass.length >= 8 && /\d/.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // ADMIN HARDCODED VALIDATION
    if (selectedType === 'admin') {
      if (mode === 'signup') {
        setError("Administrator accounts cannot be created via public signup.");
        setIsLoading(false);
        return;
      }
      
      // Strict hardcoded check for platform owner
      if (identifier.trim().toLowerCase() === 'dhillondavinderkaur5@gmail.com' && password === 'KalaBakra@1721') {
        console.log("[MaplePrep] Admin Bypass Active");
        setIsSuccess(true);
        setIsLoading(false);
        // Triggers the 'isDemo' local bypass in App.tsx to ensure session persistence 
        // even if the user isn't in Firebase Auth yet.
        onLogin('admin', 'Davinder Kaur Dhillon', identifier.trim());
        return;
      } else {
        setError("Invalid administrator credentials.");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (mode === 'signup') {
        if (!identifier || !password) throw new Error("Email and password are required.");
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        if (!validatePassword(password)) throw new Error("Password must be 8+ characters and include a number.");
        
        if (auth) {
          const user = await registerUser(identifier, password);
          const name = selectedType === 'school' ? schoolName : teacherName;
          await createUserProfile(user, name, selectedType);
          setIsSuccess(true);
          // App.tsx listener will handle redirection
        } else {
          setIsSuccess(true);
          onLogin(selectedType, selectedType === 'school' ? schoolName : teacherName, identifier);
        }
      } else {
        // SIGN IN
        if (auth) {
          await loginUser(identifier, password);
          setIsSuccess(true);
          // App.tsx auth listener handles redirecting real users automatically
        } else {
          setIsSuccess(true);
          onLogin(selectedType, selectedType === 'school' ? 'School Admin' : 'Teacher', identifier);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = "Authentication failed. Please check your credentials.";
      if (err.code === 'auth/invalid-credential') message = "Invalid email or password.";
      if (err.code === 'auth/email-already-in-use') message = "Email already registered.";
      setError(err.message || message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center animate-fadeIn">
          <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-8 animate-bounce-subtle">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">{mode === 'signup' ? 'Account Created!' : 'Success!'}</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">Preparing your workspace...</p>
          <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex flex-col md:flex-row bg-slate-50 animate-fadeIn">
      <div className="md:w-1/2 bg-slate-900 text-white p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-600 p-2 rounded-lg shadow-lg"><SchoolIcon className="w-8 h-8 text-white" /></div>
            <span className="text-3xl font-extrabold tracking-tight">Maple<span className="text-red-600">Prep</span></span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Empower your Canadian classroom.</h1>
          <p className="text-lg text-slate-400 leading-relaxed">Join educators saving 10+ hours a week with AI-powered curriculum planning.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white md:shadow-2xl border border-slate-100 rounded-[2rem] p-10">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-10">
            {(['teacher', 'school', 'admin'] as UserType[]).map(type => (
              <button 
                key={type} 
                type="button"
                onClick={() => { setSelectedType(type); setError(null); }} 
                className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${selectedType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">
            {selectedType === 'admin' ? 'System Admin' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400 font-bold mb-6">
            {selectedType === 'school' ? 'Managing accounts for your entire staff' : selectedType === 'teacher' ? 'Individual lesson planning & presentation tools' : 'Platform management portal'}
          </p>
          
          {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-xl flex gap-3 items-center animate-shake"><ShieldAlert className="w-5 h-5 shrink-0" /><p>{error}</p></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">{selectedType === 'school' ? 'School Name' : 'Full Name'}</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required value={selectedType === 'school' ? schoolName : teacherName} onChange={e => selectedType === 'school' ? setSchoolName(e.target.value) : setTeacherName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-medium" placeholder={selectedType === 'school' ? "Maple Grove PS" : "Sarah Jenkins"} />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required value={identifier} onChange={e => setIdentifier(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-medium" placeholder="name@school.ca" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-medium" placeholder="••••••••" />
              </div>
            </div>
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Confirm Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-medium" placeholder="••••••••" />
                </div>
              </div>
            )}
            <button type="submit" disabled={isLoading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Working...</> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 text-center text-xs font-bold text-slate-400">
            {mode === 'signin' ? "New to MaplePrep?" : "Already a member?"}
            <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }} className="ml-2 font-black text-red-600 hover:underline">
              {mode === 'signin' ? 'Start Free Trial' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};