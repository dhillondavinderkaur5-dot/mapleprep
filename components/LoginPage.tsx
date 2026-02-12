<<<<<<< HEAD
import React, { useState } from 'react';
import { User, Building2, Lock, ArrowRight, School as SchoolIcon, Mail, X, CheckCircle, ArrowLeft, ShieldCheck, Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import { PROVINCES } from '../constants';
import { Province, TeacherProfile, UserType, SubscriptionDetails } from '../types';
import { loginUser, registerUser, createUserProfile, getUserProfile } from '../services/auth';
import { auth } from '../services/firebase';
=======

import React, { useState, useEffect } from 'react';
import { User, Building2, Lock, ArrowRight, School as SchoolIcon, Mail } from 'lucide-react';
import { PROVINCES } from '../constants';
import { Province, TeacherProfile, UserType } from '../types';
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03

type AuthMode = 'signin' | 'signup';

interface LoginPageProps {
  onLogin: (userType: UserType, name: string, email: string) => void;
  onSchoolSignup: (name: string, email: string) => void;
  registeredTeachers: TeacherProfile[];
<<<<<<< HEAD
  onNavigateToPricing: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSchoolSignup, registeredTeachers, onNavigateToPricing }) => {
  const [selectedType, setSelectedType] = useState<UserType>('teacher');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
=======
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSchoolSignup, registeredTeachers }) => {
  const [selectedType, setSelectedType] = useState<UserType>('teacher');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
<<<<<<< HEAD
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');

  const validatePassword = (pass: string) => {
    return pass.length >= 8 && /\d/.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
=======
  const [rememberMe, setRememberMe] = useState(false);
  
  // School Fields
  const [schoolName, setSchoolName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState<Province>(PROVINCES[0] as Province);

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('mapleprep_saved_email');
    const savedType = localStorage.getItem('mapleprep_saved_type');
    
    if (savedEmail) {
      setIdentifier(savedEmail);
      setRememberMe(true);
    }
    
    if (savedType === 'teacher' || savedType === 'school') {
      setSelectedType(savedType as UserType);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
    e.preventDefault();
    setIsLoading(true);
    setError(null);

<<<<<<< HEAD
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
=======
    // Simulate API check delay
    setTimeout(() => {
      let success = false;
      let loginName = '';
      let loginEmail = '';

      // 1. Teacher Validation
      if (selectedType === 'teacher') {
        // Search if this email exists in the school's approved list
        const teacherAccount = registeredTeachers.find(
          t => t.email.toLowerCase() === identifier.toLowerCase()
        );

        if (!teacherAccount) {
          setError("Access Denied: This email address is not registered with any school. Please ask your School Administrator to add you to the dashboard first.");
          setIsLoading(false);
          return;
        }

        // If validation passes
        loginName = teacherAccount.name;
        loginEmail = teacherAccount.email;
        success = true;
      } 
      
      // 2. School Login / Signup
      else {
        if (mode === 'signup') {
            // TRIGGERS PAYMENT FLOW INSTEAD OF IMMEDIATE LOGIN
            onSchoolSignup(schoolName, identifier);
            setIsLoading(false);
            return;
        }

        // Mock login for existing school
        loginName = 'Springfield Elementary';
        loginEmail = identifier;
        success = true;
      }
      
      if (success) {
        // Handle "Remember Me" persistence
        if (rememberMe) {
          localStorage.setItem('mapleprep_saved_email', identifier);
          localStorage.setItem('mapleprep_saved_type', selectedType);
        } else {
          localStorage.removeItem('mapleprep_saved_email');
          localStorage.removeItem('mapleprep_saved_type');
        }

        onLogin(selectedType, loginName, loginEmail);
      }
      
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* Left Side - Hero / Branding */}
      <div className="md:w-1/2 bg-slate-900 text-white p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-600 p-2 rounded-lg">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.66 0.77C11.66 0.77 12.8 4.2 13.06 6.09C13.27 7.58 14.16 8.32 15.35 7.65L18.4 5.95L17.86 9.65C17.7 10.8 18.4 11.95 19.48 12.31L22.58 13.35L19.12 15.28C17.91 15.95 17.43 17.38 18.04 18.48L19.78 21.63L16.29 20.46C15.07 20.05 13.76 20.66 13.36 21.82L12.8 23.5L11.72 20.32C11.31 19.16 10 18.55 8.79 18.96L5.3 20.13L7.04 16.98C7.65 15.88 7.17 14.45 5.96 13.78L2.5 11.85L5.6 10.81C6.68 10.45 7.38 9.3 7.22 8.15L6.68 4.45L9.73 6.15C10.92 6.82 11.81 6.08 12.03 4.59L12.29 0.77H11.66Z" />
              </svg>
            </div>
            <span className="text-3xl font-extrabold tracking-tight">Maple<span className="text-red-500">Prep</span></span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {selectedType === 'teacher' ? 'Empower your teaching.' : 'Manage your school.'}
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            {selectedType === 'teacher' 
              ? "Join thousands of Canadian educators saving 10+ hours a week with AI-powered lesson planning."
              : "Streamline administration, manage teacher accounts, and oversee subscription usage all in one place."}
          </p>
          
          <div className="flex gap-4">
             <div className="flex -space-x-2">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700"></div>
               ))}
             </div>
             <p className="text-sm text-slate-400 flex items-center">Used by 2,000+ teachers</p>
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white md:shadow-xl md:border md:border-slate-100 rounded-2xl p-8">
          
          {/* Role Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => { setSelectedType('teacher'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${selectedType === 'teacher' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <User className="w-4 h-4" /> Teacher
            </button>
            <button 
              onClick={() => { setSelectedType('school'); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${selectedType === 'school' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Building2 className="w-4 h-4" /> School
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === 'signin' ? 'Welcome Back' : (selectedType === 'school' ? 'Register School' : 'Create Account')}
            </h2>
            <p className="text-slate-500 text-sm">
              {mode === 'signin' ? 'Please enter your details to sign in.' : 'Fill in the form to get started.'}
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg animate-fadeIn">
              <strong>Login Failed</strong>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* School Signup Extra Fields */}
            {selectedType === 'school' && mode === 'signup' && (
              <div className="space-y-4 animate-fadeIn">
                 <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">School Name</label>
                    <div className="relative">
                      <SchoolIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        required 
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                        placeholder="e.g. Maple Grove PS"
                      />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
                        <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="City" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Province</label>
                        <select value={province} onChange={e => setProvince(e.target.value as Province)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                 </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {selectedType === 'school' ? 'Admin Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(null); }}
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="name@example.com"
                />
              </div>
              {selectedType === 'teacher' && mode === 'signup' && (
                 <p className="text-xs text-slate-500 mt-1">Must match the email your school admin invited.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'signin' && (
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer font-medium select-none">
                  Remember me
                </label>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6 ${selectedType === 'teacher' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
             {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
             <button 
               onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
               className={`ml-2 font-bold hover:underline ${selectedType === 'teacher' ? 'text-blue-600' : 'text-red-600'}`}
             >
               {mode === 'signin' ? 'Sign Up' : 'Sign In'}
             </button>
          </div>

>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
