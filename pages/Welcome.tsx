import React, { useState } from 'react';
import { View } from '../types';
import { 
  GraduationCap, 
  Menu, 
  X, 
  BarChart2, 
  BrainCircuit, 
  ShieldCheck,
  ChevronRight,
  BookOpen,
  LayoutDashboard,
  Users,
  FileText,
  LogIn,
  Sun,
  Moon
} from 'lucide-react';

interface WelcomeProps {
  onNavigate: (view: View) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onNavigate, theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              {/* Logo removed as requested */}
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {['Overview', 'Tutorial', 'About Us', 'Contact Us'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item}
                </button>
              ))}
              
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-4 ml-4">
                <button 
                  onClick={() => onNavigate(View.Login)}
                  className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Log in
                </button>
                <button 
                  onClick={() => onNavigate(View.Signup)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Sign up
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-lg absolute w-full">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {['Overview', 'Tutorial', 'About Us', 'Contact Us'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                  className="block w-full text-left px-3 py-3 text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md"
                >
                  {item}
                </button>
              ))}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 flex flex-col gap-3">
                <button 
                  onClick={() => onNavigate(View.Login)}
                  className="w-full px-4 py-3 text-center text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-lg font-medium"
                >
                  Log in
                </button>
                <button 
                  onClick={() => onNavigate(View.Signup)}
                  className="w-full px-4 py-3 text-center text-white bg-blue-600 rounded-lg font-medium shadow-sm"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero / Overview */}
      <section id="overview" className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Forecasting Academic Performance with <span className="text-blue-600 dark:text-blue-400">AI Dependency</span> Patterns
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            IntelliGrade connects students' AI tool usage patterns with their academic outcomes using Logistic Regression model.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate(View.Signup)}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Get Started <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scrollToSection('tutorial')}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Tutorial / Features */}
      <section id="tutorial" className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How IntelliGrade Works</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">A systematic approach to analyzing AI dependency patterns.</p>
          </div>
          
          {/* Theory Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Data Collection</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We aggregate dependency scores across Reading, Writing, and Numeracy domains from student inputs.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Model Prediction</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Our Logistic Regression algorithm analyzes patterns to classify students into performance aspects.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Insights</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Educators receive reports for at-risk students to provide timely intervention.
              </p>
            </div>
          </div>

          {/* User Manual / Demo Section */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="text-center mb-12">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                  <BookOpen className="w-4 h-4" /> User Guide
               </div>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Step-by-Step System Manual</h3>
               <p className="mt-2 text-slate-600 dark:text-slate-400">Follow this guide to navigate the IntelliGrade platform effectively.</p>
            </div>

            <div className="space-y-8 relative">
              {/* Vertical Line for Desktop */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700 transform -translate-x-1/2"></div>

              {/* Step 1 */}
              <div className="relative flex flex-col md:flex-row gap-8 items-center">
                 <div className="w-full md:w-1/2 flex justify-center md:justify-end pr-0 md:pr-12">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full max-w-sm hover:border-blue-300 dark:hover:border-blue-500 transition-colors group">
                       <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <LogIn className="w-6 h-6" />
                       </div>
                       <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">1. Authentication</h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400">
                          Securely log in using your institutional credentials. New faculty members should use the <strong>Sign Up</strong> form to request access.
                       </p>
                    </div>
                 </div>
                 <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex w-8 h-8 bg-blue-600 rounded-full items-center justify-center text-white text-xs font-bold ring-4 ring-slate-50 dark:ring-slate-900 z-10">1</div>
                 <div className="w-full md:w-1/2 pl-0 md:pl-12 text-center md:text-left text-slate-400 dark:text-slate-500 text-sm font-medium">
                    Start by creating your account
                 </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col md:flex-row-reverse gap-8 items-center">
                 <div className="w-full md:w-1/2 flex justify-center md:justify-start pl-0 md:pl-12">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full max-w-sm hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors group">
                       <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <LayoutDashboard className="w-6 h-6" />
                       </div>
                       <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">2. Analyze the Dashboard</h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400">
                          Identify the <strong>At-Risk</strong> student count and monitor <strong>Average Dependency Scores</strong> across colleges to spot trends early.
                       </p>
                    </div>
                 </div>
                 <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex w-8 h-8 bg-indigo-600 rounded-full items-center justify-center text-white text-xs font-bold ring-4 ring-slate-50 dark:ring-slate-900 z-10">2</div>
                 <div className="w-full md:w-1/2 pr-0 md:pr-12 text-center md:text-right text-slate-400 dark:text-slate-500 text-sm font-medium">
                    Get a high-level overview
                 </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col md:flex-row gap-8 items-center">
                 <div className="w-full md:w-1/2 flex justify-center md:justify-end pr-0 md:pr-12">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full max-w-sm hover:border-purple-300 dark:hover:border-purple-500 transition-colors group">
                       <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <BrainCircuit className="w-6 h-6" />
                       </div>
                       <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">3. Run iPredict Model</h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400">
                          Navigate to <strong>iPredict</strong>. Input a specific student's dependency scores (1-7) and motivation level. The AI will forecast their performance tier instantly.
                       </p>
                    </div>
                 </div>
                 <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex w-8 h-8 bg-purple-600 rounded-full items-center justify-center text-white text-xs font-bold ring-4 ring-slate-50 dark:ring-slate-900 z-10">3</div>
                 <div className="w-full md:w-1/2 pl-0 md:pl-12 text-center md:text-left text-slate-400 dark:text-slate-500 text-sm font-medium">
                    Forecast individual results
                 </div>
              </div>

               {/* Step 4 */}
              <div className="relative flex flex-col md:flex-row-reverse gap-8 items-center">
                 <div className="w-full md:w-1/2 flex justify-center md:justify-start pl-0 md:pl-12">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full max-w-sm hover:border-teal-300 dark:hover:border-teal-500 transition-colors group">
                       <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                          <Users className="w-6 h-6" />
                       </div>
                       <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">4. Manage Directory</h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400">
                          Use the <strong>Student Directory</strong> to filter and export data. Click on any student to view their detailed <strong>Dependency Profile</strong> report.
                       </p>
                    </div>
                 </div>
                 <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex w-8 h-8 bg-teal-600 rounded-full items-center justify-center text-white text-xs font-bold ring-4 ring-slate-50 dark:ring-slate-900 z-10">4</div>
                 <div className="w-full md:w-1/2 pr-0 md:pr-12 text-center md:text-right text-slate-400 dark:text-slate-500 text-sm font-medium">
                    Explore more about data
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about-us" className="py-24 bg-slate-900 dark:bg-slate-950 text-white border-t border-transparent dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <div>
               <h2 className="text-3xl font-bold mb-6">About the Research</h2>
               <p className="text-slate-300 mb-6 leading-relaxed">
                 IntelliGrade is the result of a comprehensive thesis study conducted at Laguna State Polytechnic University.
                 Guided by UN SDG 4 (Quality Education), we aim to solve the lack of monitoring solutions connecting AI tool dependency with academic performance.
               </p>
               <div className="space-y-4">
                 <div className="flex items-start gap-4">
                   <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                   <p className="text-slate-400 text-sm">Based on Cognitive Load Theory, Social Determination Theory & Social Cognitive Theory.</p>
                 </div>
                 <div className="flex items-start gap-4">
                   <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                   <p className="text-slate-400 text-sm">Utilizes data from 381 college students.</p>
                 </div>
                 <div className="flex items-start gap-4">
                   <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                   <p className="text-slate-400 text-sm">Evaluated using ISO 25010 standards.</p>
                 </div>
               </div>
             </div>
             <div className="bg-slate-800 dark:bg-slate-900 p-8 rounded-2xl border border-slate-700 dark:border-slate-800">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">IntelliGrade Team</h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex justify-between border-b border-slate-700 dark:border-slate-800 pb-2">
                    <span>Ariane Karell A. Balan</span>
                    <span className="text-slate-500">Project Manager</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-700 dark:border-slate-800 pb-2">
                    <span>John Reed C. Lajom</span>
                    <span className="text-slate-500">Resource Associate</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Mary Joy M. Valdez</span>
                    <span className="text-slate-500">Full Stack Developer</span>
                  </li>
                </ul>
             </div>
           </div>
        </div>
      </section>

      {/* Contact Us */}
      <section id="contact-us" className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Contact Us</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Have questions about the methodology or the system? Reach out to the research team.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-800">
               <p className="font-semibold text-slate-900 dark:text-white">Email Support</p>
               <p className="text-blue-600 dark:text-blue-400">0322-1518@lspu.edu.ph</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-800">
               <p className="font-semibold text-slate-900 dark:text-white">Location</p>
               <p className="text-slate-600 dark:text-slate-400">LSPU - San Pablo City Campus</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; 2025 IntelliGrade. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Welcome;