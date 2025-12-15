import React, { useState, useRef } from 'react';
import { Student } from '../types';
import { COLLEGES, COLLEGE_CODES } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
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
  ArrowDown
} from 'lucide-react';

interface StudentDirectoryProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

const StudentDirectory: React.FC<StudentDirectoryProps> = ({ students, setStudents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [importReport, setImportReport] = useState<{ successes: number; errors: string[] } | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const itemsPerPage = 10;

  // Filter Logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.Student_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.College.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.Primary_AI_Tool.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCollege = selectedCollege === 'All' || student.College === selectedCollege;

    return matchesSearch && matchesCollege;
  });

  // Sorting Logic
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

  // Generate page numbers for pagination UI
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

  // --- Export Functions ---
  const convertToCSV = (data: any[]) => {
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    return `${header}\n${rows}`;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAllCSV = () => {
    const csv = convertToCSV(students);
    downloadCSV(csv, `intelligrade_complete_dataset_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportSummaryCSV = () => {
    const total = students.length;
    const atRisk = students.filter(s => ((s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score)/3 > 5.5) && s.Motivation_Score < 4.5).length;
    const summaryData = [{
      Metric: "Total Students", Value: total
    }, {
      Metric: "At Risk Count", Value: atRisk
    }, {
      Metric: "Risk Percentage", Value: `${((atRisk/total)*100).toFixed(2)}%`
    }];
    const csv = convertToCSV(summaryData);
    downloadCSV(csv, `intelligrade_summary_report.csv`);
  };

  const handleExportAllPDF = () => {
      const doc = new jsPDF('l'); // Landscape
      doc.setFontSize(14);
      doc.text("IntelliGrade - Complete Student Dataset", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 20);

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

  const handleExportSummaryPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("IntelliGrade Summary Report", 14, 20);
      
      const total = students.length;
      const atRisk = students.filter(s => ((s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score)/3 > 5.5) && s.Motivation_Score < 4.5).length;

      const summaryData = [
          ["Total Students", total],
          ["At Risk Count", atRisk],
          ["Risk Percentage", `${((atRisk/total)*100).toFixed(2)}%`]
      ];

      autoTable(doc, {
          startY: 30,
          head: [['Metric', 'Value']],
          body: summaryData,
          theme: 'striped'
      });
      
      doc.save(`intelligrade_summary_report.pdf`);
  };

  const handleExportStudentReport = (student: Student) => {
    // Current simple CSV
    const reportData = [{
      ...student,
      Generated_Date: new Date().toLocaleDateString(),
      Risk_Assessment: (student.Motivation_Score < 4.5 && ((student.Reading_Dependency_Score + student.Writing_Dependency_Score + student.Numeracy_Dependency_Score) / 3) > 5.5) ? 'High Risk' : 'Standard'
    }];
    const csv = convertToCSV(reportData);
    downloadCSV(csv, `report_${student.Student_ID}.csv`);
  };

  // --- Import Function ---
  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/);
      // Remove empty lines at the end
      const validLines = lines.filter(l => l.trim().length > 0);

      if (validLines.length < 2) {
        setImportReport({ successes: 0, errors: ["File is empty or missing headers."] });
        return;
      }

      // 1. Detect Delimiter
      const firstLine = validLines[0];
      const possibleDelimiters = [',', ';', '\t', '|'];
      // Simple heuristic: which delimiter appears most in the first line
      const delimiter = possibleDelimiters.reduce((a, b) => 
        (firstLine.split(a).length > firstLine.split(b).length ? a : b)
      );

      // Clean string helper (remove quotes)
      const clean = (s: string) => s ? s.trim().replace(/^"|"$/g, '') : '';

      const headers = firstLine.split(delimiter).map(clean);
      
      const newStudents: Student[] = [];
      const errors: string[] = [];
      
      for(let i=1; i<validLines.length; i++) {
        const line = validLines[i];
        if(!line.trim()) continue;
        
        // Basic split (NOTE: Does not handle escaped delimiters inside quotes properly for full CSV spec, 
        // but handles basic quoted strings if no internal delimiter)
        const values = line.split(delimiter).map(clean);
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch (Expected ${headers.length}, got ${values.length})`);
          continue;
        }

        const studentObj: any = {};
        let rowIsValid = true;
        const rowErrors: string[] = [];

        headers.forEach((header, index) => {
          const val = values[index];
          
          try {
             if (header.includes('Student_ID')) {
                if(!val) throw new Error("Missing ID");
                studentObj.Student_ID = val;
             }
             else if (header.includes('College')) {
                studentObj.College = val || "Unknown";
             }
             else if (header.includes('Year')) {
                const num = Number(val);
                if (isNaN(num)) throw new Error(`Invalid Year '${val}'`);
                studentObj.Year_Level = num;
             }
             else if (header.includes('Reading')) {
                const num = Number(val);
                if (isNaN(num)) throw new Error(`Invalid Reading Score '${val}'`);
                studentObj.Reading_Dependency_Score = num;
             }
             else if (header.includes('Writing')) {
                const num = Number(val);
                if (isNaN(num)) throw new Error(`Invalid Writing Score '${val}'`);
                studentObj.Writing_Dependency_Score = num;
             }
             else if (header.includes('Numeracy')) {
                const num = Number(val);
                if (isNaN(num)) throw new Error(`Invalid Numeracy Score '${val}'`);
                studentObj.Numeracy_Dependency_Score = num;
             }
             else if (header.includes('Motivation')) {
                const num = Number(val);
                if (isNaN(num)) throw new Error(`Invalid Motivation Score '${val}'`);
                studentObj.Motivation_Score = num;
             }
             else if (header.includes('Count')) {
                const num = Number(val);
                if (isNaN(num)) throw new Error(`Invalid Tool Count '${val}'`);
                studentObj.AI_Tools_Count = num;
             }
             else if (header.includes('Primary')) {
                studentObj.Primary_AI_Tool = val || "None";
             }
             else if (header.includes('Purpose')) {
                studentObj.Usage_Purpose = val || "General";
             }
          } catch (err: any) {
             rowIsValid = false;
             rowErrors.push(err.message);
          }
        });

        // Mandatory ID check
        if (!studentObj.Student_ID) {
           rowIsValid = false;
           rowErrors.push("Missing Student_ID");
        }

        if (rowIsValid) {
           newStudents.push(studentObj as Student);
        } else {
           errors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`);
        }
      }

      if (newStudents.length > 0) {
        setStudents(prev => [...prev, ...newStudents]);
      }
      
      setImportReport({ successes: newStudents.length, errors });
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };


  const getDependencyLevel = (score: number) => {
     if (score >= 5.5) return <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-medium">High</span>;
     if (score >= 3.5) return <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-xs font-medium">Moderate</span>;
     return <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-medium">Low</span>;
  };

  // Detailed View
  if (selectedStudent) {
    return (
      <div className="animate-fade-in space-y-6">
         <button 
           onClick={() => setSelectedStudent(null)}
           className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
         >
           <ArrowLeft className="w-4 h-4" /> Back to Directory
         </button>
  
         {/* Header */}
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
            <div className="flex gap-3">
               <button 
                onClick={() => handleExportStudentReport(selectedStudent)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium flex items-center gap-2"
               >
                  <Download className="w-4 h-4" /> Export Report
               </button>
            </div>
         </div>
  
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: AI Profile */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                     <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> AI Usage Profile
                  </h3>
                  
                  <div className="space-y-4">
                     <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wide mb-1">Primary Tool</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedStudent.Primary_AI_Tool}</p>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                           <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase mb-1">Tools Used</p>
                           <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedStudent.AI_Tools_Count}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                           <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase mb-1">Purpose</p>
                           <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{selectedStudent.Usage_Purpose}</p>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                   <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                     <Target className="w-5 h-5 text-red-600 dark:text-red-400" /> Intrinsic Motivation
                  </h3>
                  <div className="flex items-end gap-2 mb-2">
                     <span className="text-4xl font-bold text-slate-900 dark:text-white">{selectedStudent.Motivation_Score}</span>
                     <span className="text-slate-400 mb-1">/ 7.0</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                     <div className="bg-red-500 h-full rounded-full" style={{width: `${(selectedStudent.Motivation_Score/7)*100}%`}}></div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                     {selectedStudent.Motivation_Score < 4.5 
                       ? "Low motivation detected. High risk of cognitive offloading." 
                       : "Healthy motivation levels observed."}
                  </p>
               </div>
            </div>
  
            {/* Right Column: Dependency Scores */}
            <div className="lg:col-span-2">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-full transition-colors">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                     <BarChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Dependency Breakdown
                  </h3>
                  
                  <div className="space-y-8">
                     {/* Reading */}
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-slate-400" />
                              <span className="font-medium text-slate-700 dark:text-slate-300">Reading Dependency</span>
                           </div>
                           <span className="font-bold text-slate-900 dark:text-white">{selectedStudent.Reading_Dependency_Score} / 7.0</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                           <div className={`h-full rounded-full ${selectedStudent.Reading_Dependency_Score > 5 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${(selectedStudent.Reading_Dependency_Score/7)*100}%`}}></div>
                        </div>
                     </div>
  
                     {/* Writing */}
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                              <PenTool className="w-5 h-5 text-slate-400" />
                              <span className="font-medium text-slate-700 dark:text-slate-300">Writing Dependency</span>
                           </div>
                           <span className="font-bold text-slate-900 dark:text-white">{selectedStudent.Writing_Dependency_Score} / 7.0</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                           <div className={`h-full rounded-full ${selectedStudent.Writing_Dependency_Score > 5 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${(selectedStudent.Writing_Dependency_Score/7)*100}%`}}></div>
                        </div>
                     </div>
  
                     {/* Numeracy */}
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                              <Calculator className="w-5 h-5 text-slate-400" />
                              <span className="font-medium text-slate-700 dark:text-slate-300">Numeracy Dependency</span>
                           </div>
                           <span className="font-bold text-slate-900 dark:text-white">{selectedStudent.Numeracy_Dependency_Score} / 7.0</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                           <div className={`h-full rounded-full ${selectedStudent.Numeracy_Dependency_Score > 5 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${(selectedStudent.Numeracy_Dependency_Score/7)*100}%`}}></div>
                        </div>
                     </div>
                  </div>
  
                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                     <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Analysis Interpretation</h4>
                     <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                        Scores above 5.0 indicate significant reliance on AI tools for this domain. 
                        This student shows {Math.max(selectedStudent.Reading_Dependency_Score, selectedStudent.Writing_Dependency_Score, selectedStudent.Numeracy_Dependency_Score) > 5 ? 'high' : 'moderate'} dependency patterns.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    )
  }

  // Directory View
  return (
    <div className="space-y-6 animate-fade-in relative">
      {importReport && (
         <div className={`mb-6 p-4 rounded-xl border ${importReport.errors.length > 0 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'} transition-all duration-300`}>
            <div className="flex justify-between items-start">
               <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     {importReport.errors.length > 0 
                        ? <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" /> 
                        : <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                     }
                     <h3 className={`font-bold ${importReport.errors.length > 0 ? 'text-orange-900 dark:text-orange-200' : 'text-green-900 dark:text-green-200'}`}>
                        Import Status Report
                     </h3>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 ml-7">
                     Successfully processed <span className="font-bold">{importReport.successes}</span> student records.
                  </p>
                  {importReport.errors.length > 0 && (
                     <div className="mt-3 ml-7 bg-white/60 dark:bg-black/30 p-3 rounded-lg border border-orange-200/50 dark:border-orange-800/50 max-h-40 overflow-y-auto">
                        <p className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wide mb-2">Issues Found ({importReport.errors.length})</p>
                        <ul className="list-disc pl-4 space-y-1">
                           {importReport.errors.map((err, idx) => (
                              <li key={idx} className="text-xs text-orange-900 dark:text-orange-200 font-mono leading-tight">{err}</li>
                           ))}
                        </ul>
                     </div>
                  )}
               </div>
               <button onClick={() => setImportReport(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>
         </div>
      )}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Directory</h1>
           <p className="text-slate-500 dark:text-slate-400">Manage and analyze individual student records.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
           {/* Actions Toolbar */}
           <div className="flex gap-2">
              <input 
                 type="file" 
                 accept=".csv" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={handleFileUpload}
              />
              <button 
                 onClick={handleImportClick}
                 className="px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                 <Upload className="w-4 h-4" /> Import CSV
              </button>
              
              <div className="relative group">
                 <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Data
                 </button>
                 {/* Dropdown for Export */}
                 <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 py-1 hidden group-hover:block z-20">
                    <button onClick={handleExportAllCSV} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                       Full Dataset (CSV)
                    </button>
                    <button onClick={handleExportAllPDF} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                       Full Dataset (PDF)
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                    <button onClick={handleExportSummaryCSV} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                       Summary Report (CSV)
                    </button>
                    <button onClick={handleExportSummaryPDF} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                       Summary Report (PDF)
                    </button>
                 </div>
              </div>
           </div>

           <div className="h-8 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block mx-1"></div>
           
           <div className="relative">
                <select
                    value={selectedCollege}
                    onChange={(e) => {
                        setSelectedCollege(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="appearance-none pl-3 pr-10 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200"
                >
                    <option value="All">All Colleges</option>
                    {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>

           <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
                value={searchTerm}
                onChange={(e) => {
                   setSearchTerm(e.target.value);
                   setCurrentPage(1);
                }}
              />
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => requestSort('Student_ID')}
                >
                  <div className="flex items-center gap-2">
                     Student ID
                     {getSortIcon('Student_ID')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => requestSort('College')}
                >
                  <div className="flex items-center gap-2">
                     College
                     {getSortIcon('College')}
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Year</th>
                <th 
                  className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => requestSort('avgDep')}
                >
                  <div className="flex items-center justify-center gap-2">
                     Avg Dep.
                     {getSortIcon('avgDep')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => requestSort('Motivation_Score')}
                >
                  <div className="flex items-center justify-center gap-2">
                     Motivation
                     {getSortIcon('Motivation_Score')}
                  </div>
                </th>
                <th className="px-6 py-4">Primary Tool</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => {
                  const avgDep = (student.Reading_Dependency_Score + student.Writing_Dependency_Score + student.Numeracy_Dependency_Score) / 3;
                  return (
                  <tr 
                    key={student.Student_ID} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{student.Student_ID}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300" title={student.College}>
                       <span className="font-medium text-slate-900 dark:text-white">{COLLEGE_CODES[student.College] || student.College}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300">{student.Year_Level}</td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex flex-col items-center">
                          <span className="font-medium text-slate-700 dark:text-slate-200">{avgDep.toFixed(1)}</span>
                          {getDependencyLevel(avgDep)}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mx-auto mt-1">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{width: `${(student.Motivation_Score/7)*100}%`}}></div>
                       </div>
                       <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 inline-block">{student.Motivation_Score}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                          {student.Primary_AI_Tool}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(student);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs flex items-center justify-center gap-1 mx-auto"
                      >
                        <FileText className="w-3 h-3" /> Report
                      </button>
                    </td>
                  </tr>
                )})
              ) : (
                <tr>
                   <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No students found matching your search.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
           <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} entries
           </span>
           <div className="flex gap-2 items-center">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
              >
                 <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="hidden sm:flex gap-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={typeof page !== 'number'}
                    className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage 
                        ? 'bg-blue-600 text-white border border-blue-600' 
                        : typeof page === 'number'
                          ? 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          : 'text-slate-400 cursor-default'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                 className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
              >
                 <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDirectory;