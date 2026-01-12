import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { View, User, Student } from './types';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import IPredict from './pages/iPredict';
import StudentDirectory from './pages/StudentDirectory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { auth, isFirebaseConfigured } from './services/firebase';
import { fetchProfile, fetchStudents, importStudents, type PaginatedStudents } from './services/api';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Welcome);
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsMeta, setStudentsMeta] = useState<Omit<PaginatedStudents, 'items'> | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') return saved;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  // Apply Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const displayStudents = useMemo(() => students, [students]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const refreshStudents = useCallback(async () => {
    if (!auth || !auth.currentUser) {
      setStudents([]);
      return;
    }
    setStudentsLoading(true);
    try {
      const data = await fetchStudents();
      setStudents(data.items);
      setStudentsMeta({ total: data.total, page: data.page, limit: data.limit });
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const handleAuthState = useCallback(async () => {
    if (!auth) {
      setUser(null);
      setStudents([]);
      setAuthReady(true);
      return;
    }

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setUser(null);
      setStudents([]);
      setAuthReady(true);
      return;
    }
    try {
      const profile = await fetchProfile();
      setUser(profile);
      setCurrentView(prev => {
        if ([View.Welcome, View.Login, View.Signup].includes(prev)) {
          return View.Dashboard;
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async () => {
      await handleAuthState();
    });
    return () => unsubscribe();
  }, [handleAuthState]);

  useEffect(() => {
    if (user) {
      refreshStudents();
    }
  }, [user, refreshStudents]);

  const handleImportStudents = useCallback(async (payload: Student[]) => {
    if (payload.length === 0) return;
    try {
      await importStudents(payload);
      await refreshStudents();
    } catch (error) {
      console.error('Failed to import students', error);
    }
  }, [refreshStudents]);

  const handleLogout = () => {
    if (!auth) {
      setUser(null);
      setStudents([]);
      setCurrentView(View.Welcome);
      return;
    }

    signOut(auth)
      .catch((error) => {
        console.error('Failed to sign out', error);
      })
      .finally(() => {
        setUser(null);
        setStudents([]);
        setCurrentView(View.Welcome);
      });
  };

  const handleAuthSuccess = () => {
    setCurrentView(View.Dashboard);
  };

  const renderContent = () => {
    switch (currentView) {
      case View.Welcome:
        return <Welcome onNavigate={setCurrentView} theme={theme} toggleTheme={toggleTheme} />;
      case View.Login:
        return <Auth mode="login" onAuthenticated={handleAuthSuccess} onNavigate={setCurrentView} theme={theme} toggleTheme={toggleTheme} />;
      case View.Signup:
        return <Auth mode="signup" onAuthenticated={handleAuthSuccess} onNavigate={setCurrentView} theme={theme} toggleTheme={toggleTheme} />;
      case View.Dashboard:
        return <Dashboard students={displayStudents} theme={theme} user={user} onImportStudents={handleImportStudents} onRefreshStudents={refreshStudents} isRefreshing={studentsLoading} totalStudents={studentsMeta?.total ?? displayStudents.length} />;
      case View.IPredict:
        return <IPredict user={user} />;
      case View.Directory:
        return <StudentDirectory students={displayStudents} user={user} onImportStudents={handleImportStudents} isImporting={studentsLoading} />;
      case View.Reports:
        return <Reports students={displayStudents} theme={theme} user={user} />;
      case View.Settings:
        return <Settings user={user} />;
      default:
        return <Dashboard students={displayStudents} theme={theme} user={user} onImportStudents={handleImportStudents} onRefreshStudents={refreshStudents} isRefreshing={studentsLoading} totalStudents={studentsMeta?.total ?? displayStudents.length} />;
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-center">
        <div className="space-y-3">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Configure Firebase</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add your Firebase web app credentials to the Vite environment file (e.g. <span className="font-semibold">.env.local</span>)
            so authentication features can load.
          </p>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500 dark:text-slate-400 text-sm">Initializing…</div>
      </div>
    );
  }

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView} 
      user={user}
      onLogout={handleLogout}
      theme={theme}
      toggleTheme={toggleTheme}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;