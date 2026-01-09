export interface Student {
  Student_ID: string;
  College: string;
  Year_Level: number;
  Reading_Dependency_Score: number;
  Writing_Dependency_Score: number;
  Numeracy_Dependency_Score: number;
  Motivation_Score: number;
  AI_Tools_Count: number;
  Primary_AI_Tool: string;
  Usage_Purpose: string;
}

export enum PerformanceLevel {
  High = 'High Performance',
  Moderate = 'Moderate Performance',
  AtRisk = 'At-Risk' // Low Performance
}

export enum View {
  Welcome = 'WELCOME',
  Login = 'LOGIN',
  Signup = 'SIGNUP',
  Dashboard = 'DASHBOARD',
  IPredict = 'IPREDICT',
  Directory = 'DIRECTORY',
  Reports = 'REPORTS',
  Settings = 'SETTINGS'
}

export interface User {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  middleInitial?: string;
  college?: string;
  contactNumber?: string;
  role: 'admin' | 'faculty' | 'student';
}