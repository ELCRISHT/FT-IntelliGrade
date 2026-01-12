
import React, { useMemo, useState } from 'react';
import { View } from '../types';
import { COLLEGES, COLLEGE_CODES } from '../constants';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../services/firebase';
import { registerProfile } from '../services/api';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sun, 
  Moon, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  Phone,
  // Added RefreshCw import
  RefreshCw
} from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'signup';
  onAuthenticated: () => void;
  onNavigate: (view: View) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onAuthenticated, onNavigate, theme, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  }, [password]);

  const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['bg-slate-200 dark:bg-slate-800', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][passwordStrength];

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const friendlyError = (error: unknown): string => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/invalid-email':
          return 'Check your email and password then try again.';
        case 'auth/user-disabled':
          return 'This account is disabled. Contact your administrator.';
        case 'auth/user-not-found':
          return 'We could not find an account with that email.';
        case 'auth/wrong-password':
          return 'Incorrect password. Try again or reset your password.';
        case 'auth/email-already-in-use':
          return 'This email is already registered.';
        case 'auth/weak-password':
          return 'Use a stronger password (8+ characters, with numbers and symbols).';
        default:
          return error.message ?? 'Authentication failed. Please try again.';
      }
    }
    return 'Something went wrong. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!auth) {
      setError('Firebase authentication is not configured. Contact your administrator.');
      return;
    }

    if (isForgotPassword) {
      if (!email) {
        setError('Enter the email associated with your account.');
        return;
      }
      setIsLoading(true);
      try {
        await sendPasswordResetEmail(auth, email.trim());
        setResetSent(true);
      } catch (err) {
        setError(friendlyError(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === 'signup') {
      if (!firstName || !lastName || !selectedCollege || !contactNumber) {
        setError('Please fill in all required fields.');
        return;
      }
      if (!passwordsMatch) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

        const derivedRole: 'admin' | 'faculty' = email.toLowerCase().includes('admin') ? 'admin' : 'faculty';
        if (credential.user) {
          await updateProfile(credential.user, {
            displayName: `${firstName} ${lastName}`.trim(),
          });
        }

        await registerProfile({
          firstName,
          lastName,
          middleInitial: middleInitial || undefined,
          college: derivedRole === 'faculty' ? selectedCollege : undefined,
          contactNumber: contactNumber || undefined,
          role: derivedRole,
        });
      }

      onAuthenticated();
    } catch (err) {
      console.error('Authentication error', err);
      setError(friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetSent(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300 relative">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
      >
        {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
      </button>

      <div className={`max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 ${mode === 'signup' ? 'md:max-w-2xl' : 'max-w-md'}`}>
        <div className="px-8 pt-8 pb-6 bg-slate-900 dark:bg-slate-950 text-center border-b border-slate-800">
           <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
             <GraduationCap className="text-white w-7 h-7" />
           </div>
           <h2 className="text-2xl font-bold text-white mb-1">
             {isForgotPassword ? 'Reset Password' : (mode === 'login' ? 'Welcome Back' : 'Create Account')}
           </h2>
           <p className="text-slate-400 text-sm">
             {isForgotPassword 
               ? 'Enter your email to receive a reset link' 
               : (mode === 'login' ? 'Sign in to access the IntelliGrade dashboard' : 'Join as a Faculty Member or Administrator')}
           </p>
        </div>

        {resetSent ? (
          <div className="p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Email Sent!</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Check your inbox at <strong>{email}</strong> for instructions.
            </p>
            <button 
              onClick={handleBackToLogin}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-3 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {isForgotPassword ? (
              <>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="name@university.edu.ph"
                    />
                  </div>
                </div>
                <button 
                  type="submit" disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button type="button" onClick={handleBackToLogin} className="w-full text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </>
            ) : (
              <>
                {mode === 'signup' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                        <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Juan" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">M.I.</label>
                        <input type="text" maxLength={2} value={middleInitial} onChange={(e) => setMiddleInitial(e.target.value)} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="D." />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                        <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Dela Cruz" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input type="tel" required value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="09123456789" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">College</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <select 
                            required value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                          >
                            <option value="">Select College</option>
                            {COLLEGES.map(c => <option key={c} value={c}>{c} ({COLLEGE_CODES[c]})</option>)}
                          </select>
                          <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rotate-90 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="name@university.edu.ph"
                    />
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${mode === 'signup' ? 'md:grid-cols-2' : ''} gap-4`}>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                      {mode === 'login' && <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Forgot?</button>}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full pl-10 pr-4 py-3 border ${!passwordsMatch ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'} bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl outline-none transition-all`} placeholder="••••••••" />
                      </div>
                      {!passwordsMatch && <p className="text-[10px] text-red-500 font-bold mt-1">Passwords do not match</p>}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:transform-none"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>{mode === 'login' ? 'Sign In' : 'Create Your Account'} <ArrowRight className="w-5 h-5" /></>}
                </button>
              </>
            )}
          </form>
        )}

        <div className="px-8 pb-8 text-center bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 pt-4">
           <p className="text-sm text-slate-600 dark:text-slate-400">
             {mode === 'login' ? "Need an account? " : "Already registered? "}
             <button onClick={() => { onNavigate(mode === 'login' ? View.Signup : View.Login); setIsForgotPassword(false); setResetSent(false); setError(''); }} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
               {mode === 'login' ? 'Sign up now' : 'Log in instead'}
             </button>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
