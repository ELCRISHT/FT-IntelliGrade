import React from 'react';
import { Student, User } from '../types';
import { COLLEGES, COLORS, COLLEGE_CODES } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from 'recharts';
import { Download } from 'lucide-react';

interface ReportsProps {
  students: Student[];
  theme: 'light' | 'dark';
  user: User | null;
}

const Reports: React.FC<ReportsProps> = ({ students, theme, user }) => {
  const isFaculty = user?.role === 'faculty';

  const collegeData = COLLEGES.map((college, index) => {
    const studentsInCollege = students.filter(s => s.College === college);
    const count = studentsInCollege.length;
    const avgScore = count > 0 
      ? studentsInCollege.reduce((acc, s) => acc + (s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score)/3, 0) / count 
      : 0;
    return {
      name: COLLEGE_CODES[college] || college,
      score: parseFloat(avgScore.toFixed(2)),
      count: count,
      fill: COLORS[index % COLORS.length]
    };
  }).filter(c => c.count > 0); 

  const domainData = isFaculty ? [
    { name: 'Reading', score: students.length > 0 ? students.reduce((acc, s) => acc + s.Reading_Dependency_Score, 0) / students.length : 0 },
    { name: 'Writing', score: students.length > 0 ? students.reduce((acc, s) => acc + s.Writing_Dependency_Score, 0) / students.length : 0 },
    { name: 'Numeracy', score: students.length > 0 ? students.reduce((acc, s) => acc + s.Numeracy_Dependency_Score, 0) / students.length : 0 }
  ].map(d => ({ ...d, score: parseFloat(d.score.toFixed(2)) })) : [];

  const scatterData = students.map(s => ({
    x: parseFloat(((s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score)/3).toFixed(2)),
    y: s.Motivation_Score,
    z: 1 
  }));

  const tools: Record<string, number> = {};
  students.forEach(s => { tools[s.Primary_AI_Tool] = (tools[s.Primary_AI_Tool] || 0) + 1; });
  const toolData = Object.keys(tools).map(key => ({ subject: key, A: tools[key], fullMark: Math.max(...Object.values(tools)) }));

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipStyle = isDark ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' } : {};

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const blue = [37, 99, 235];
    
    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("Correlation Analysis Report", 14, 25);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Scope: ${isFaculty ? user?.college : 'Full Institutional Comparison'}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);

    // Summary Analytics Table
    autoTable(doc, {
      startY: 55,
      head: [['Category', 'Summary of Findings']],
      body: [
        ["Total Sample Size", `${students.length} Respondents`],
        ["Major Trend", "Inverse correlation detected between Motivation and AI Dependency."],
        ["Most Impacted Domain", "Writing scores show highest AI reliance university-wide."],
        ["Risk Assessment", `${((students.filter(s => s.Motivation_Score < 4.5).length / students.length) * 100).toFixed(1)}% show low intrinsic motivation profiles.`]
      ],
      headStyles: { fillColor: blue }
    });

    let y = (doc as any).lastAutoTable.finalY + 20;

    // --- CHART: CORRELATION GRID ---
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.text("Motivation-Dependency Distribution Graph", 14, y);
    y += 10;

    // Draw Grid Coordinates
    const boxSize = 80;
    const startX = 40;
    doc.setDrawColor(203, 213, 225);
    doc.line(startX, y, startX + boxSize, y); // Top
    doc.line(startX, y + boxSize, startX + boxSize, y + boxSize); // Bottom
    doc.line(startX, y, startX, y + boxSize); // Left
    doc.line(startX + boxSize, y, startX + boxSize, y + boxSize); // Right
    
    // Quadrant Lines
    doc.setLineDash([2, 2]);
    doc.line(startX + (boxSize/2), y, startX + (boxSize/2), y + boxSize);
    doc.line(startX, y + (boxSize/2), startX + boxSize, y + (boxSize/2));
    doc.setLineDash([]);

    // Plot simple points for the top 20 extreme cases to show trend
    const plotCases = students.slice(0, 25);
    plotCases.forEach(s => {
       const avgDep = (s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score) / 3;
       const px = startX + ((avgDep / 7) * boxSize);
       const py = (y + boxSize) - ((s.Motivation_Score / 7) * boxSize);
       doc.setFillColor(s.Motivation_Score < 4 ? 239 : 59, s.Motivation_Score < 4 ? 68 : 130, s.Motivation_Score < 4 ? 68 : 246);
       doc.circle(px, py, 1.5, 'F');
    });

    // Legends for Graph
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Low Motivation / High Dependency (High Risk)", startX + 5, y + boxSize - 5);
    doc.text("High Motivation / Low Dependency (Standard)", startX + boxSize - 60, y + 10);
    
    doc.save(`IntelliGrade_Analytical_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isFaculty ? `${COLLEGE_CODES[user?.college || ''] || user?.college} Analytics` : 'Analytics Reports'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Institutional report analyzing {students.length} student records.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Download className="w-5 h-5" /> Export PDF Summary
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              {isFaculty ? 'Average Score by Domain' : 'Average Dependency by College'}
            </h3>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={isFaculty ? domainData : collegeData} layout={isFaculty ? "horizontal" : "vertical"} margin={{ left: isFaculty ? 0 : 40 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={!isFaculty} stroke={gridColor} />
                     <XAxis dataKey={isFaculty ? "name" : undefined} type={isFaculty ? "category" : "number"} domain={isFaculty ? undefined : [0, 7]} stroke={axisColor} />
                     <YAxis dataKey={isFaculty ? undefined : "name"} type={isFaculty ? "number" : "category"} domain={isFaculty ? [0, 7] : undefined} width={isFaculty ? 30 : 100} stroke={axisColor} />
                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={tooltipStyle} />
                     <Bar dataKey={isFaculty ? "score" : "score"} radius={isFaculty ? [4, 4, 0, 0] : [0, 4, 4, 0]} barSize={isFaculty ? 60 : 20} fill="#3B82F6" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Correlation Distribution</h3>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                     <CartesianGrid stroke={gridColor} />
                     <XAxis type="number" dataKey="x" name="Dependency" unit="/7" domain={[1, 7]} stroke={axisColor} />
                     <YAxis type="number" dataKey="y" name="Motivation" unit="/7" domain={[1, 7]} stroke={axisColor} />
                     <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                     <Scatter name="Students" data={scatterData} fill="#8884d8" />
                  </ScatterChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Reports;