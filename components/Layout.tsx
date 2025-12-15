import React, { useState } from 'react';
import { View, User } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  FileBarChart, 
  BrainCircuit, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  GraduationCap,
  Moon,
  Sun
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onChangeView: (view: View) => void;
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView, 
  user, 
  onLogout,
  theme,
  toggleTheme 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If no user is logged in and view is not Welcome/Auth, don't render sidebar layout
  if (!user && (currentView === View.Welcome || currentView === View.Login || currentView === View.Signup)) {
    return <>{children}</>;
  }

  const navItems = [
    { view: View.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { view: View.IPredict, label: 'iPredict', icon: BrainCircuit },
    { view: View.Directory, label: 'Student Directory', icon: Users },
    { view: View.Reports, label: 'Reports', icon: FileBarChart },
    { view: View.Settings, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 dark:bg-slate-900 border-r border-slate-800 text-white shadow-xl fixed h-full z-10 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">IntelliGrade</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.view
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="px-4">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-800/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header & Overlay */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-4 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white w-5 h-5" />
             </div>
             <span className="font-bold text-lg text-slate-800 dark:text-white">IntelliGrade</span>
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
             >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-slate-900 dark:bg-slate-950 bg-opacity-95 md:hidden flex flex-col pt-20 px-6 space-y-4">
             {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  onChangeView(item.view);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium ${
                  currentView === item.view
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </button>
            ))}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-4 py-4 text-lg text-red-400 hover:bg-slate-800 rounded-xl"
            >
              <LogOut className="w-6 h-6" />
              Logout
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;