
import React, { useState, useRef } from 'react';
import { Student, User } from '../types';
import { COLLEGES, COLLEGE_CODES, TOOLS } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  // Added ChevronDown to fix missing name errors
  ChevronDown,
  ArrowLeft,
  BookOpen,
  PenTool,
  Calculator,
  Target,
  BrainCircuit,
  ExternalLink,
  GraduationCap,
  BarChart as BarChartIcon,
  Download,
  Upload,
  FileText,
  X,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lock,
  Layers,
  Wrench
} from 'lucide-react';

interface StudentDirectoryProps {
   students: Student[];
   user: User | null;
   onImportStudents: (students: Student[]) => Promise<void>;
   isImporting: boolean;
}

const StudentDirectory: React.FC<StudentDirectoryProps> = ({ students, user, onImportStudents, isImporting }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedTool, setSelectedTool] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [importReport, setImportReport] = useState<{ successes: number; errors: string[] } | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const itemsPerPage = 10;
  const isFaculty = user?.role === 'faculty';

  // --- Filtering Logic ---
  const filteredStudents = students.filter(student => {
    // 1. Search Term (ID, College, or Tool)
    const matchesSearch = student.Student_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.College.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.Primary_AI_Tool.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. College Filter (Restricted for Faculty)
    const matchesCollege = isFaculty ? true : (selectedCollege === 'All' || student.College === selectedCollege);

    // 3. Year Level Filter
    const matchesYear = selectedYear === 'All' || student.Year_Level.toString() === selectedYear;

    // 4. Primary Tool Filter
    const matchesTool = selectedTool === 'All' || student.Primary_AI_Tool === selectedTool;

    return matchesSearch && matchesCollege && matchesYear && matchesTool;
  });

  // --- Sorting Logic ---
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue: any;
    let bValue: any;

    if (sortConfig.key === 'avgDep') {
       aValue = (a.Reading_Dependency_Score + a.Writing_Dependency_Score + a.Numeracy_Dependency_Score) / 3;
       bValue = (b.Reading_Dependency_Score + b.Writing_Dependency_Score + b.Numeracy_Dependency_Score) / 3;
    } else {
       aValue = a[sortConfig.key as keyof Student];
       bValue = b[sortConfig.key as keyof Student];
    }

    if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = sortedStudents.slice(startIndex, startIndex + itemsPerPage);

  // Sorting Handler
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (name: string) => {
    if (!sortConfig || sortConfig.key !== name) {
        return <ArrowUpDown className="w-4 h-4 text-slate-400 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? 
        <ArrowUp className="w-4 h-4 text-blue-600" /> : 
        <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const handleExportAllCSV = () => {
      if (students.length === 0) return;
    const header = Object.keys(students[0]).join(',');
    const rows = students.map(obj => Object.values(obj).join(',')).join('\n');
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `intelligrade_dataset_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAllPDF = () => {
     if (students.length === 0) return;
      const doc = new jsPDF('l');
      doc.setFontSize(14);
      doc.text(`IntelliGrade - Student Dataset`, 14, 15);
      const tableData = students.map(s => [
          s.Student_ID, s.College, s.Year_Level, 
          s.Reading_Dependency_Score, s.Writing_Dependency_Score, s.Numeracy_Dependency_Score, 
          s.Motivation_Score, s.AI_Tools_Count, s.Primary_AI_Tool
      ]);
      autoTable(doc, {
          startY: 25,
          head: [['ID', 'College', 'Yr', 'Read', 'Write', 'Num', 'Motiv', 'Tools', 'Primary']],
          body: tableData,
          styles: { fontSize: 8 },
          theme: 'grid'
      });
      doc.save(`intelligrade_dataset_${new Date().toISOString().split('T')[0]}.pdf`);
  };

   const handleImportClick = () => {
      if (isFaculty) return;
      if (fileInputRef.current) fileInputRef.current.click();
   };

   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isFaculty) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) return;
      const firstLine = lines[0];
      const delimiter = [',', ';', '\t', '|'].reduce((a, b) => (firstLine.split(a).length > firstLine.split(b).length ? a : b));
      const clean = (s: string) => s ? s.trim().replace(/^"|"$/g, '') : '';
      const headers = firstLine.split(delimiter).map(clean);
      const newStudents: Student[] = [];
      const errors: string[] = [];
      
         for(let i=1; i<lines.length; i++) {
        const values = lines[i].split(delimiter).map(clean);
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }
        const studentObj: any = {};
        headers.forEach((header, index) => {
          const val = values[index];
          if (header.includes('Student_ID')) studentObj.Student_ID = val;
          else if (header.includes('College')) studentObj.College = val;
          else if (header.includes('Year')) studentObj.Year_Level = Number(val);
          else if (header.includes('Reading')) studentObj.Reading_Dependency_Score = Number(val);
          else if (header.includes('Writing')) studentObj.Writing_Dependency_Score = Number(val);
          else if (header.includes('Numeracy')) studentObj.Numeracy_Dependency_Score = Number(val);
          else if (header.includes('Motivation')) studentObj.Motivation_Score = Number(val);
          else if (header.includes('Count')) studentObj.AI_Tools_Count = Number(val);
          else if (header.includes('Primary')) studentObj.Primary_AI_Tool = val;
        });

        if (isFaculty && studentObj.College !== user?.college) {
           errors.push(`Row ${i + 1}: Restricted to ${user?.college}`);
        } else if (studentObj.Student_ID) {
           newStudents.push(studentObj as Student);
        }
      }
         const run = async () => {
            if (newStudents.length > 0) {
               try {
                  await onImportStudents(newStudents);
               } catch (error) {
                  console.error('Import failed', error);
                  errors.push('Import failed. Check console for details.');
               }
            }
            setImportReport({ successes: newStudents.length, errors });
         };
         void run();
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getDependencyLevel = (score: number) => {
     if (score >= 5.5) return <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-medium">High</span>;
     if (score >= 3.5) return <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-xs font-medium">Moderate</span>;
     return <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-medium">Low</span>;
  };

  if (selectedStudent) {
    return (
      <div className="animate-fade-in space-y-6">
         <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
           <ArrowLeft className="w-4 h-4" /> Back to Directory
         </button>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-2xl font-bold text-slate-600 dark:text-slate-300">
                  {selectedStudent.Student_ID.charAt(0)}
               </div>
               <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student {selectedStudent.Student_ID}</h1>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mt-1">
                     <GraduationCap className="w-4 h-4" />
                     <span>{selectedStudent.College} • Year {selectedStudent.Year_Level}</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                     <BrainCircuit className="w-5 h-5 text-indigo-600" /> AI Usage Profile
                  </h3>
                  <div className="space-y-4">
                     <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-1">Primary Tool</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedStudent.Primary_AI_Tool}</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="lg:col-span-2">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-full">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                     <BarChartIcon className="w-5 h-5 text-blue-600" /> Dependency Breakdown
                  </h3>
                  <div className="space-y-8">
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="font-medium text-slate-700 dark:text-slate-300">Reading</span>
                           <span className="font-bold text-slate-900 dark:text-white">{selectedStudent.Reading_Dependency_Score} / 7.0</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                           <div className="h-full bg-blue-500 rounded-full" style={{width: `${(selectedStudent.Reading_Dependency_Score/7)*100}%`}}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="font-medium text-slate-700 dark:text-slate-300">Writing</span>
                           <span className="font-bold text-slate-900 dark:text-white">{selectedStudent.Writing_Dependency_Score} / 7.0</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                           <div className="h-full bg-blue-500 rounded-full" style={{width: `${(selectedStudent.Writing_Dependency_Score/7)*100}%`}}></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Directory</h1>
           <p className="text-slate-500 dark:text-slate-400">
             {isFaculty ? `Managing records for ${user?.college}.` : 'Manage and analyze individual student records.'}
           </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
           <div className="flex gap-2">
              <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <button onClick={handleImportClick} disabled={isFaculty || isImporting} className="px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-60">
                 <Upload className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} /> Import CSV
              </button>
              <div className="relative group">
                 <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Data
                 </button>
                 <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-800 py-1 hidden group-hover:block z-20">
                    <button onClick={handleExportAllCSV} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white">CSV</button>
                    <button onClick={handleExportAllPDF} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white">PDF</button>
                 </div>
              </div>
           </div>
           
           <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search ID/Tool..." 
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-48"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
           </div>
        </div>
      </div>

      {/* --- Advanced Filtering Toolbar --- */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
           <Filter className="w-4 h-4" /> Filter By:
        </div>
        
        {/* College Filter */}
        <div className="relative min-w-[180px]">
           <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
           {isFaculty ? (
             <div className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
               <Lock className="w-3 h-3" /> {COLLEGE_CODES[user?.college || ''] || user?.college}
             </div>
           ) : (
             <select
                value={selectedCollege}
                onChange={(e) => { setSelectedCollege(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
             >
                <option value="All">All Colleges</option>
                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
           )}
           {!isFaculty && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />}
        </div>

        {/* Year Filter */}
        <div className="relative min-w-[140px]">
           <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
           <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              className="appearance-none w-full pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
           >
              <option value="All">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
           </select>
           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
        </div>

        {/* Primary Tool Filter */}
        <div className="relative min-w-[160px]">
           <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
           <select
              value={selectedTool}
              onChange={(e) => { setSelectedTool(e.target.value); setCurrentPage(1); }}
              className="appearance-none w-full pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
           >
              <option value="All">All Tools</option>
              {TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
           </select>
           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
        </div>

        {/* Clear Filters */}
        {(searchTerm || selectedCollege !== 'All' || selectedYear !== 'All' || selectedTool !== 'All') && (
          <button 
            onClick={() => {
               setSearchTerm('');
               setSelectedCollege('All');
               setSelectedYear('All');
               setSelectedTool('All');
               setCurrentPage(1);
            }}
            className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 ml-auto"
          >
            <X className="w-3 h-3" /> Clear Filters
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 cursor-pointer" onClick={() => requestSort('Student_ID')}><div className="flex items-center gap-2">ID {getSortIcon('Student_ID')}</div></th>
                <th className="px-6 py-4 cursor-pointer" onClick={() => requestSort('College')}><div className="flex items-center gap-2">College {getSortIcon('College')}</div></th>
                <th className="px-6 py-4 text-center cursor-pointer" onClick={() => requestSort('Year_Level')}><div className="flex items-center justify-center gap-2">Year {getSortIcon('Year_Level')}</div></th>
                <th className="px-6 py-4 cursor-pointer" onClick={() => requestSort('Primary_AI_Tool')}><div className="flex items-center gap-2">Tool {getSortIcon('Primary_AI_Tool')}</div></th>
                <th className="px-6 py-4 text-center cursor-pointer" onClick={() => requestSort('avgDep')}><div className="flex items-center justify-center gap-2">Avg Dep. {getSortIcon('avgDep')}</div></th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => {
                  const avgDep = (student.Reading_Dependency_Score + student.Writing_Dependency_Score + student.Numeracy_Dependency_Score) / 3;
                  return (
                  <tr key={student.Student_ID} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group" onClick={() => setSelectedStudent(student)}>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white group-hover:text-blue-600">{student.Student_ID}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{COLLEGE_CODES[student.College] || student.College}</td>
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300 font-bold">{student.Year_Level}</td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 uppercase tracking-tight">
                          {student.Primary_AI_Tool}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex flex-col items-center">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{avgDep.toFixed(1)}</span>
                          {getDependencyLevel(avgDep)}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-xs font-bold flex items-center justify-center gap-1 mx-auto bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                        <FileText className="w-3 h-3" /> DETAILS
                      </button>
                    </td>
                  </tr>
                )})
              ) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No students match current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
           <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredStudents.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} entries
           </span>
           <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDirectory;
