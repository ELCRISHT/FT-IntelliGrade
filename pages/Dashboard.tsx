import React, { useRef, useState } from 'react';
import { Student } from '../types';
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
}

const Dashboard: React.FC<DashboardProps> = ({ students, setStudents, theme }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Data Processing ---
  const totalStudents = students.length;
  
  // Averages
  const avgReading = students.reduce((acc, curr) => acc + curr.Reading_Dependency_Score, 0) / totalStudents;
  const avgWriting = students.reduce((acc, curr) => acc + curr.Writing_Dependency_Score, 0) / totalStudents;
  const avgNumeracy = students.reduce((acc, curr) => acc + curr.Numeracy_Dependency_Score, 0) / totalStudents;
  const overallAvg = (avgReading + avgWriting + avgNumeracy) / 3;
  const avgMotivation = students.reduce((acc, curr) => acc + curr.Motivation_Score, 0) / totalStudents;

  // Logic: High Avg Dependency (> 5.5) AND Low Motivation (< 4.5)
  const atRiskStudents = students.filter(s => {
    const avgDep = (s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score) / 3;
    return avgDep > 5.5 && s.Motivation_Score < 4.5;
  });

  // Chart 1: Dependency by College (Bar)
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

  // Chart 2: Scatter Plot Data (Motivation vs Dependency)
  const scatterData = students.map(s => ({
    x: parseFloat(((s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score) / 3).toFixed(2)),
    y: s.Motivation_Score,
    status: (s.Motivation_Score < 4.5 && ((s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score) / 3) > 5.5) ? 'At Risk' : 'Normal'
  }));

  // Chart 3: Tool Usage (Bar Chart)
  const toolDataMap = students.reduce((acc, curr) => {
    acc[curr.Primary_AI_Tool] = (acc[curr.Primary_AI_Tool] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const toolData = Object.keys(toolDataMap)
    .map(k => ({ name: k, value: toolDataMap[k] }))
    .sort((a, b) => b.value - a.value);

  // Chart 4: Year Level Trend (Area)
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

  // --- Import Logic ---
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
      const validLines = lines.filter(l => l.trim().length > 0);

      if (validLines.length < 2) return;

      const firstLine = validLines[0];
      const possibleDelimiters = [',', ';', '\t', '|'];
      const delimiter = possibleDelimiters.reduce((a, b) => 
        (firstLine.split(a).length > firstLine.split(b).length ? a : b)
      );

      const clean = (s: string) => s ? s.trim().replace(/^"|"$/g, '') : '';
      const headers = firstLine.split(delimiter).map(clean);
      const newStudents: Student[] = [];
      
      for(let i=1; i<validLines.length; i++) {
        const line = validLines[i];
        if(!line.trim()) continue;
        const values = line.split(delimiter).map(clean);
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

      if (newStudents.length > 0) {
        setStudents(prev => [...prev, ...newStudents]);
        alert(`Successfully imported ${newStudents.length} records.`);
      } else {
        alert("No valid records found in file.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // --- Export Logic ---
  const exportCSV = () => {
    const summaryData = [
      { Metric: "Total Population", Value: totalStudents },
      { Metric: "Average Dependency Score", Value: overallAvg.toFixed(2) },
      { Metric: "Average Motivation Score", Value: avgMotivation.toFixed(2) },
      { Metric: "At-Risk Students", Value: atRiskStudents.length },
      { Metric: "Risk Percentage", Value: `${((atRiskStudents.length/totalStudents)*100).toFixed(2)}%` }
    ];
    const header = Object.keys(summaryData[0]).join(',');
    const rows = summaryData.map(obj => Object.values(obj).join(',')).join('\n');
    const content = `${header}\n${rows}`;
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
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
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("IntelliGrade Executive Dashboard", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    // KPI Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Key Performance Indicators", 14, 40);
    
    const kpiData = [
      ["Total Students", totalStudents.toString()],
      ["Avg Dependency Score", `${overallAvg.toFixed(2)} / 7.0`],
      ["Avg Motivation Score", `${avgMotivation.toFixed(2)} / 7.0`],
      ["At-Risk Count", `${atRiskStudents.length} (${((atRiskStudents.length/totalStudents)*100).toFixed(1)}%)`]
    ];

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: kpiData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // College Breakdown
    doc.text("Dependency by College", 14, (doc as any).lastAutoTable.finalY + 15);
    
    const collegeTableData = collegeData.map(c => [c.name, c.value.toString()]);
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['College', 'Avg Dependency']],
      body: collegeTableData,
      theme: 'grid'
    });

    doc.save(`dashboard_summary_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Executive Dashboard</h1>
           <p className="text-slate-500 dark:text-slate-400">Real-time analysis of {totalStudents} respondents.</p>
        </div>
        <div className="flex gap-2 relative">
           <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
           />
           <button 
             onClick={handleImportClick}
             className="text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
           >
             <Upload className="w-4 h-4" /> Import CSV
           </button>

           <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export Summary <ChevronDown className="w-3 h-3" />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-20 animate-fade-in">
                  <button onClick={exportCSV} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                     Download as CSV
                  </button>
                  <button onClick={exportPDF} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                     Download as PDF
                  </button>
                </div>
              )}
           </div>

           <button 
             onClick={() => window.location.reload()}
             className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
           >
             <RefreshCw className="w-4 h-4" /> Refresh
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Study Population</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalStudents}</h3>
          </div>
          <Users className="absolute right-4 top-6 w-12 h-12 text-slate-100 dark:text-slate-800" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Avg Dependency</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{overallAvg.toFixed(2)}<span className="text-sm text-slate-400 dark:text-slate-500 font-normal">/7.0</span></h3>
          </div>
          <TrendingUp className="absolute right-4 top-6 w-12 h-12 text-indigo-50 dark:text-slate-800" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">At-Risk Students</p>
            <h3 className="text-3xl font-bold text-red-600 dark:text-red-500">{atRiskStudents.length}</h3>
            <p className="text-xs text-red-500 dark:text-red-400 font-medium">{(atRiskStudents.length / totalStudents * 100).toFixed(1)}% of population</p>
          </div>
          <AlertTriangle className="absolute right-4 top-6 w-12 h-12 text-red-50 dark:text-red-900/20" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
           <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Avg Motivation</p>
            <h3 className="text-3xl font-bold text-green-600 dark:text-green-500">{avgMotivation.toFixed(2)}<span className="text-sm text-slate-400 dark:text-slate-500 font-normal">/7.0</span></h3>
          </div>
          <Award className="absolute right-4 top-6 w-12 h-12 text-green-50 dark:text-green-900/20" />
        </div>
      </div>

      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter: Risk Analysis */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Motivation vs. Dependency Correlation</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Students in the <span className="text-red-500 font-medium">Bottom Right</span> (High Dep, Low Mot) are At-Risk.
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" dataKey="x" name="Dependency" unit="/7" domain={[1, 7]} label={{ value: 'Dependency Score', position: 'insideBottom', offset: -10, fill: axisColor }} stroke={axisColor} />
                <YAxis type="number" dataKey="y" name="Motivation" unit="/7" domain={[1, 7]} label={{ value: 'Motivation Score', angle: -90, position: 'insideLeft', fill: axisColor }} stroke={axisColor} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                <Scatter name="Students" data={scatterData} fill="#8884d8" fillOpacity={0.6}>
                   {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.status === 'At Risk' ? '#EF4444' : '#3B82F6'} />
                    ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar: Dependency by College */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
           <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Institutional Dependency Impact</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Average AI dependency score across different colleges.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collegeData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                <XAxis type="number" domain={[0, 7]} stroke={axisColor} />
                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11, fill: axisColor}} stroke={axisColor} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 lg:col-span-1 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Primary AI Tool Usage</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={toolData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: axisColor}} stroke={axisColor} />
                  <YAxis stroke={axisColor} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 lg:col-span-2 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Longitudinal Trend by Year Level</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Tracking how dependency evolves from freshman to senior year.</p>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke={axisColor} />
                    <YAxis domain={[0, 7]} stroke={axisColor} />
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="dependency" stroke="#3B82F6" fillOpacity={1} fill="url(#colorDep)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;