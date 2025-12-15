import React, { useState } from 'react';
import { View, User } from '../types';
import { GraduationCap, Mail, Lock, User as UserIcon, ArrowRight, Sun, Moon } from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'signup';
  onLogin: (user: User) => void;
  onNavigate: (view: View) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onLogin, onNavigate, theme, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockUser: User = {
        email: email,
        name: name || 'Academic User',
        role: 'faculty' // Default role for demo
      };
      setIsLoading(false);
      onLogin(mockUser);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300 relative">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
      >
        {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
      </button>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-8 pt-8 pb-6 bg-slate-900 dark:bg-slate-950 text-center border-b border-slate-800">
           <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
             <GraduationCap className="text-white w-7 h-7" />
           </div>
           <h2 className="text-2xl font-bold text-white mb-1">
             {mode === 'login' ? 'Welcome Back' : 'Create Account'}
           </h2>
           <p className="text-slate-400 text-sm">
             {mode === 'login' ? 'Sign in to access the IntelliGrade dashboard' : 'Join the AI Dependency research platform'}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
           {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
           )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@university.edu.ph"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                   {mode === 'login' ? 'Sign In' : 'Create Account'}
                   <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
        </form>

        <div className="px-8 pb-8 text-center bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 pt-4">
           <p className="text-sm text-slate-600 dark:text-slate-400">
             {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
             <button 
               onClick={() => onNavigate(mode === 'login' ? View.Signup : View.Login)}
               className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
             >
               {mode === 'login' ? 'Sign up' : 'Log in'}
             </button>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;