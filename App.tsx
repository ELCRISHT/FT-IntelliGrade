import React, { useState, useEffect } from 'react';
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (user: User) => {
    setUser(user);
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
        return <Dashboard students={students} setStudents={setStudents} theme={theme} />;
      case View.IPredict:
        return <IPredict />;
      case View.Directory:
        return <StudentDirectory students={students} setStudents={setStudents} />;
      case View.Reports:
        return <Reports students={students} theme={theme} />;
      case View.Settings:
        return <Settings user={user} />;
      default:
        return <Dashboard students={students} setStudents={setStudents} theme={theme} />;
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