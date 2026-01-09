import React, { useRef, useState } from 'react';
import { Student, User } from '../types';
import { COLLEGE_CODES } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Award,
  Download,
  Upload,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  Cell
} from 'recharts';

interface DashboardProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  theme: 'light' | 'dark';
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ students, setStudents, theme, user }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFaculty = user?.role === 'faculty';

  // --- Data Processing ---
  const totalStudents = students.length;
  
  const avgReading = totalStudents > 0 ? students.reduce((acc, curr) => acc + curr.Reading_Dependency_Score, 0) / totalStudents : 0;
  const avgWriting = totalStudents > 0 ? students.reduce((acc, curr) => acc + curr.Writing_Dependency_Score, 0) / totalStudents : 0;
  const avgNumeracy = totalStudents > 0 ? students.reduce((acc, curr) => acc + curr.Numeracy_Dependency_Score, 0) / totalStudents : 0;
  const overallAvg = (avgReading + avgWriting + avgNumeracy) / 3;
  const avgMotivation = totalStudents > 0 ? students.reduce((acc, curr) => acc + curr.Motivation_Score, 0) / totalStudents : 0;

  const atRiskStudents = students.filter(s => {
    const avgDep = (s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score) / 3;
    return avgDep > 5.5 && s.Motivation_Score < 4.5;
  });

  const collegeData = Object.values(students.reduce((acc, student) => {
    if (!acc[student.College]) {
      acc[student.College] = { name: student.College, totalDep: 0, count: 0 };
    }
    const avgDep = (student.Reading_Dependency_Score + student.Writing_Dependency_Score + student.Numeracy_Dependency_Score) / 3;
    acc[student.College].totalDep += avgDep;
    acc[student.College].count += 1;
    return acc;
  }, {} as Record<string, {name: string, totalDep: number, count: number}>)).map((c: {name: string, totalDep: number, count: number}) => ({
    name: COLLEGE_CODES[c.name] || c.name,
    value: parseFloat((c.totalDep / c.count).toFixed(2))
  })).sort((a, b) => b.value - a.value);

  const scatterData = students.map(s => ({
    x: parseFloat(((s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score) / 3).toFixed(2)),
    y: s.Motivation_Score,
    status: (s.Motivation_Score < 4.5 && ((s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score) / 3) > 5.5) ? 'At Risk' : 'Normal'
  }));

  const toolDataMap = students.reduce((acc, curr) => {
    acc[curr.Primary_AI_Tool] = (acc[curr.Primary_AI_Tool] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const toolData = Object.keys(toolDataMap)
    .map(k => ({ name: k, value: toolDataMap[k] }))
    .sort((a, b) => b.value - a.value);

  const yearDataMap = students.reduce((acc, curr) => {
    if (!acc[curr.Year_Level]) acc[curr.Year_Level] = { year: `Year ${curr.Year_Level}`, total: 0, count: 0 };
    const avgDep = (curr.Reading_Dependency_Score + curr.Writing_Dependency_Score + curr.Numeracy_Dependency_Score) / 3;
    acc[curr.Year_Level].total += avgDep;
    acc[curr.Year_Level].count += 1;
    return acc;
  }, {} as Record<number, any>);
  const yearData = Object.values(yearDataMap).sort((a: any, b: any) => a.year.localeCompare(b.year)).map((d: any) => ({
    name: d.year,
    dependency: parseFloat((d.total / d.count).toFixed(2))
  }));

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipStyle = isDark ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' } : {};

  const handleImportClick = () => { if (fileInputRef.current) fileInputRef.current.click(); };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      for(let i=1; i<lines.length; i++) {
        const values = lines[i].split(delimiter).map(clean);
        if (values.length !== headers.length) continue;
        const studentObj: any = {};
        try {
            headers.forEach((header, index) => {
                const val = values[index];
                if (header.includes('Student_ID')) studentObj.Student_ID = val;
                else if (header.includes('College')) studentObj.College = val || "Unknown";
                else if (header.includes('Year')) studentObj.Year_Level = Number(val);
                else if (header.includes('Reading')) studentObj.Reading_Dependency_Score = Number(val);
                else if (header.includes('Writing')) studentObj.Writing_Dependency_Score = Number(val);
                else if (header.includes('Numeracy')) studentObj.Numeracy_Dependency_Score = Number(val);
                else if (header.includes('Motivation')) studentObj.Motivation_Score = Number(val);
                else if (header.includes('Count')) studentObj.AI_Tools_Count = Number(val);
                else if (header.includes('Primary')) studentObj.Primary_AI_Tool = val || "None";
                else if (header.includes('Purpose')) studentObj.Usage_Purpose = val || "General";
            });
            if (studentObj.Student_ID) newStudents.push(studentObj as Student);
        } catch(err) { console.error(err); }
      }
      if (newStudents.length > 0) setStudents(prev => [...prev, ...newStudents]);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const exportCSV = () => {
    const summaryData = [
      { Metric: "Scope", Value: isFaculty ? user?.college : "Full University" },
      { Metric: "Total Population", Value: totalStudents },
      { Metric: "Average Dependency Score", Value: overallAvg.toFixed(2) },
      { Metric: "Average Motivation Score", Value: avgMotivation.toFixed(2) },
      { Metric: "At-Risk Students", Value: atRiskStudents.length }
    ];
    const header = Object.keys(summaryData[0]).join(',');
    const rows = summaryData.map(obj => Object.values(obj).join(',')).join('\n');
    const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dashboard_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const primaryColor = [59, 130, 246]; // Blue-600
    
    // Header Section
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text(`IntelliGrade Analytics Report`, 14, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Report Scope: ${isFaculty ? user?.college : 'Full University-wide Dataset'}`, 14, 32);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 37);

    // Summary Table
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Calculation']],
      body: [
        ["Total Respondents", totalStudents.toString()],
        ["Avg AI Dependency Score", `${overallAvg.toFixed(2)} / 7.0`],
        ["Avg Motivation Level", `${avgMotivation.toFixed(2)} / 7.0`],
        ["High-Risk Population", `${atRiskStudents.length} Students`]
      ],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 11 },
      styles: { cellPadding: 5 }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- GRAPH 1: DOMAIN BREAKDOWN BAR CHART ---
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("Domain Dependency Analysis", 14, currentY);
    currentY += 10;

    const domains = [
      { label: "Reading", value: avgReading, color: [37, 99, 235] },
      { label: "Writing", value: avgWriting, color: [79, 70, 229] },
      { label: "Numeracy", value: avgNumeracy, color: [124, 58, 237] }
    ];

    const chartWidth = 120;
    const barHeight = 8;
    const gap = 6;

    domains.forEach((d, i) => {
      // Draw Label
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(d.label, 14, currentY + (i * (barHeight + gap)) + 6);
      
      // Draw Background Bar
      doc.setFillColor(241, 245, 249);
      doc.rect(50, currentY + (i * (barHeight + gap)), chartWidth, barHeight, 'F');
      
      // Draw Progress Bar
      const fillWidth = (d.value / 7) * chartWidth;
      doc.setFillColor(d.color[0], d.color[1], d.color[2]);
      doc.rect(50, currentY + (i * (barHeight + gap)), fillWidth, barHeight, 'F');
      
      // Draw Value
      doc.setTextColor(30, 41, 59);
      doc.text(d.value.toFixed(2), 50 + chartWidth + 5, currentY + (i * (barHeight + gap)) + 6);
    });

    currentY += (domains.length * (barHeight + gap)) + 20;

    // --- GRAPH 2: RISK DISTRIBUTION METER ---
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("Risk Population Density", 14, currentY);
    currentY += 10;

    const riskPerc = totalStudents > 0 ? (atRiskStudents.length / totalStudents) * 100 : 0;
    
    // Draw Scale
    const meterWidth = 140;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, meterWidth, 12, 'F');
    
    // Color coded fill
    if (riskPerc > 30) doc.setFillColor(239, 68, 68); // Red
    else if (riskPerc > 15) doc.setFillColor(245, 158, 11); // Yellow
    else doc.setFillColor(16, 185, 129); // Green
    
    doc.rect(14, currentY, (riskPerc / 100) * meterWidth, 12, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`${riskPerc.toFixed(1)}% of students are flagged as At-Risk`, 14, currentY + 18);

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('© IntelliGrade Research - LSPU San Pablo', 105, 290, { align: 'center' });
    }

    doc.save(`IntelliGrade_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
             {isFaculty ? `${COLLEGE_CODES[user?.college || ''] || user?.college} Analytics` : 'Executive Dashboard'}
           </h1>
           <p className="text-slate-500 dark:text-slate-400">
             {isFaculty ? `Analyzing dependency patterns for ${user?.college}.` : `Real-time analysis of ${totalStudents} respondents university-wide.`}
           </p>
        </div>
        <div className="flex gap-2 relative">
           {!isFaculty && (
             <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
           )}
           {!isFaculty && (
             <button onClick={handleImportClick} className="text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
               <Upload className="w-4 h-4" /> Import CSV
             </button>
           )}
           <div className="relative">
              <button onClick={() => setShowExportMenu(!showExportMenu)} className="text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Report <ChevronDown className="w-3 h-3" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-100 dark:border-slate-800 py-1 z-20 animate-fade-in">
                  <button onClick={exportCSV} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">CSV Summary</button>
                  <button onClick={exportPDF} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-blue-600 dark:text-blue-400">PDF Analytical Report</button>
                </div>
              )}
           </div>
           <button onClick={() => window.location.reload()} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
             <RefreshCw className="w-4 h-4" /> Refresh
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Respondents</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalStudents}</h3>
          </div>
          <Users className="absolute right-4 top-6 w-12 h-12 text-slate-100 dark:text-slate-800" />
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Avg Dependency</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{overallAvg.toFixed(2)}</h3>
          </div>
          <TrendingUp className="absolute right-4 top-6 w-12 h-12 text-indigo-50 dark:text-slate-800" />
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">At-Risk Students</p>
            <h3 className="text-3xl font-bold text-red-600 dark:text-red-500">{atRiskStudents.length}</h3>
          </div>
          <AlertTriangle className="absolute right-4 top-6 w-12 h-12 text-red-50 dark:text-red-900/20" />
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
           <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Avg Motivation</p>
            <h3 className="text-3xl font-bold text-green-600 dark:text-green-500">{avgMotivation.toFixed(2)}</h3>
          </div>
          <Award className="absolute right-4 top-6 w-12 h-12 text-green-50 dark:text-green-900/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-[450px]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Motivation vs. Dependency</h3>
          <ResponsiveContainer width="100%" height="85%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" dataKey="x" name="Dependency" unit="/7" domain={[1, 7]} stroke={axisColor} />
              <YAxis type="number" dataKey="y" name="Motivation" unit="/7" domain={[1, 7]} stroke={axisColor} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
              <Scatter name="Students" data={scatterData}>
                 {scatterData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.status === 'At Risk' ? '#EF4444' : '#3B82F6'} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-[450px]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Domain Impact Breakdown</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={[{ name: 'Reading', val: avgReading }, { name: 'Writing', val: avgWriting }, { name: 'Numeracy', val: avgNumeracy }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} />
              <YAxis domain={[0, 7]} stroke={axisColor} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={tooltipStyle} />
              <Bar dataKey="val" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;