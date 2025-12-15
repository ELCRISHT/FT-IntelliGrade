import React from 'react';
import { Student } from '../types';
import { COLLEGES, COLORS, COLLEGE_CODES } from '../constants';
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
  Radar
} from 'recharts';

interface ReportsProps {
  students: Student[];
  theme: 'light' | 'dark';
}

const Reports: React.FC<ReportsProps> = ({ students, theme }) => {
  // 1. Prepare Data for College Comparison (Dependency Scores)
  const collegeData = COLLEGES.map((college, index) => {
    // Correctly filter by matching the exact college string
    const studentsInCollege = students.filter(s => s.College === college);
    const count = studentsInCollege.length;
    const avgScore = count > 0 
      ? studentsInCollege.reduce((acc, s) => acc + (s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score)/3, 0) / count 
      : 0;
    
    return {
      name: COLLEGE_CODES[college] || college, // Use abbreviation for chart
      score: parseFloat(avgScore.toFixed(2)),
      count: count,
      fill: COLORS[index % COLORS.length]
    };
  }).filter(c => c.count > 0); 

  // 2. Prepare Data for Scatter (Motivation vs Dependency)
  const scatterData = students.map(s => ({
    x: parseFloat(((s.Reading_Dependency_Score + s.Writing_Dependency_Score + s.Numeracy_Dependency_Score)/3).toFixed(2)), // Dependency
    y: s.Motivation_Score, // Motivation
    z: 1 
  }));

  // 3. Prepare Data for AI Tool Popularity (Radar or Bar)
  const tools: Record<string, number> = {};
  students.forEach(s => {
    tools[s.Primary_AI_Tool] = (tools[s.Primary_AI_Tool] || 0) + 1;
  });
  const toolData = Object.keys(tools).map(key => ({
     subject: key,
     A: tools[key],
     fullMark: Math.max(...Object.values(tools))
  }));

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipStyle = isDark ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' } : {};

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Reports</h1>
        <p className="text-slate-500 dark:text-slate-400">Deep dive into the correlations between AI dependency and academic factors for {students.length} students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* College Comparison Chart */}
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Average Dependency by College</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Comparing total AI dependency scores across different departments.</p>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={collegeData} layout="vertical" margin={{ left: 40 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                     <XAxis type="number" domain={[0, 7]} stroke={axisColor} />
                     <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: axisColor}} stroke={axisColor} />
                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={tooltipStyle} />
                     <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20} name="Avg Score" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Scatter Plot: Motivation vs Dependency */}
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Dependency vs. Motivation Correlation</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Analyzing the inverse relationship hypothesis (Cognitive Load Theory).</p>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                     <CartesianGrid stroke={gridColor} />
                     <XAxis type="number" dataKey="x" name="Dependency" unit="/7" domain={[0, 8]} stroke={axisColor} />
                     <YAxis type="number" dataKey="y" name="Motivation" unit="/7" domain={[0, 8]} stroke={axisColor} />
                     <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                     <Legend wrapperStyle={{ color: axisColor }} />
                     <Scatter name="Students" data={scatterData} fill="#8884d8" />
                  </ScatterChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

       {/* Tool Usage Radar */}
       <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
             <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Primary AI Tools Distribution</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400">Which tools are predominantly used for academic tasks?</p>
             </div>
          </div>
          <div className="h-96 w-full flex justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={toolData}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: axisColor }} />
                  <PolarRadiusAxis stroke={axisColor} />
                  <Radar name="Usage Count" dataKey="A" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.6} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};

export default Reports;