import React, { useState, useEffect, useMemo } from 'react';
import { View, User, Student } from './types';
import { MOCK_STUDENTS } from './constants';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import IPredict from './pages/iPredict';
import StudentDirectory from './pages/StudentDirectory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Welcome);
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  
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

  // STRICT DATA ISOLATION: Gatekeep all student data here
  const displayStudents = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return students;
    // Faculty only sees students from their specific college chosen at signup
    return students.filter(s => s.College === user.college);
  }, [students, user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView(View.Dashboard);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(View.Welcome);
  };

  const renderContent = () => {
    switch (currentView) {
      case View.Welcome:
        return <Welcome onNavigate={setCurrentView} theme={theme} toggleTheme={toggleTheme} />;
      case View.Login:
        return <Auth mode="login" onLogin={handleLogin} onNavigate={setCurrentView} theme={theme} toggleTheme={toggleTheme} />;
      case View.Signup:
        return <Auth mode="signup" onLogin={handleLogin} onNavigate={setCurrentView} theme={theme} toggleTheme={toggleTheme} />;
      case View.Dashboard:
        return <Dashboard students={displayStudents} setStudents={setStudents} theme={theme} user={user} />;
      case View.IPredict:
        return <IPredict user={user} />;
      case View.Directory:
        return <StudentDirectory students={displayStudents} setStudents={setStudents} user={user} />;
      case View.Reports:
        return <Reports students={displayStudents} theme={theme} user={user} />;
      case View.Settings:
        return <Settings user={user} />;
      default:
        return <Dashboard students={displayStudents} setStudents={setStudents} theme={theme} user={user} />;
    }
  };

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