import axios from 'axios';
import { auth } from './firebase';
import type { Student, User } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
});

const withAuth = async () => {
  if (!auth) {
    throw new Error('Authentication is not configured. Set Firebase environment variables.');
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }
  const token = await currentUser.getIdToken();
  return token;
};

const authorizedRequest = async <T>(config: Parameters<typeof api.request>[0]) => {
  const token = await withAuth();
  const response = await api.request<T>({
    ...config,
    headers: {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

interface StudentApi {
  studentId: string;
  college: string;
  yearLevel: number;
  readingDependencyScore: number;
  writingDependencyScore: number;
  numeracyDependencyScore: number;
  motivationScore: number;
  aiToolsCount: number;
  primaryAiTool: string;
  usagePurpose: string;
}

export interface PaginatedStudents {
  items: Student[];
  total: number;
  page: number;
  limit: number;
}

export interface PredictionResponse {
  id: string;
  level: 'AtRisk' | 'Moderate' | 'High';
  probability: number;
  rationale: string;
  createdAt: string;
}

export const fetchProfile = async () => {
  const data = await authorizedRequest<User>({
    method: 'GET',
    url: '/auth/me',
  });
  return data;
};

interface RegisterPayload {
  firstName: string;
  lastName: string;
  middleInitial?: string;
  college?: string;
  contactNumber?: string;
  role: 'admin' | 'faculty';
}

export const registerProfile = async (payload: RegisterPayload) => {
  const data = await authorizedRequest<User>({
    method: 'POST',
    url: '/auth/register',
    data: payload,
  });
  return data;
};

export const fetchStudents = async () => {
  const data = await authorizedRequest<{ items: StudentApi[]; total: number; page: number; limit: number }>({
    method: 'GET',
    url: '/students',
  });
  return {
    ...data,
    items: data.items.map((student) => ({
      Student_ID: student.studentId,
      College: student.college,
      Year_Level: student.yearLevel,
      Reading_Dependency_Score: student.readingDependencyScore,
      Writing_Dependency_Score: student.writingDependencyScore,
      Numeracy_Dependency_Score: student.numeracyDependencyScore,
      Motivation_Score: student.motivationScore,
      AI_Tools_Count: student.aiToolsCount,
      Primary_AI_Tool: student.primaryAiTool,
      Usage_Purpose: student.usagePurpose,
    } satisfies Student)),
  } satisfies PaginatedStudents;
};

export const importStudents = async (students: Student[]) => {
  const data = await authorizedRequest<{ matched: number; modified: number; upserted: number; totalImported: number }>({
    method: 'POST',
    url: '/students/bulk',
    data: { students: students.map((student) => ({
      studentId: student.Student_ID,
      college: student.College,
      yearLevel: student.Year_Level,
      readingDependencyScore: student.Reading_Dependency_Score,
      writingDependencyScore: student.Writing_Dependency_Score,
      numeracyDependencyScore: student.Numeracy_Dependency_Score,
      motivationScore: student.Motivation_Score,
      aiToolsCount: student.AI_Tools_Count,
      primaryAiTool: student.Primary_AI_Tool,
      usagePurpose: student.Usage_Purpose,
    })) },
  });
  return data;
};

export const createPrediction = async (payload: {
  readingDependency: number;
  writingDependency: number;
  numeracyDependency: number;
  motivationScore: number;
  toolsCount: number;
  studentId?: string;
  studentReference?: string;
}) => {
  const data = await authorizedRequest<{
    id: string;
    input: {
      readingDependency: number;
      writingDependency: number;
      numeracyDependency: number;
      motivationScore: number;
      toolsCount: number;
    };
    result: {
      level: 'AtRisk' | 'Moderate' | 'High';
      probability: number;
      rationale: string;
    };
    createdAt: string;
  }>({
    method: 'POST',
    url: '/predictions',
    data: payload,
  });
  return {
    id: data.id,
    level: data.result.level,
    probability: data.result.probability,
    rationale: data.result.rationale,
    createdAt: data.createdAt,
  } satisfies PredictionResponse;
};

export interface PredictionHistoryEntry {
  id: string;
  level: 'AtRisk' | 'Moderate' | 'High';
  probability: number;
  rationale: string;
  studentReference?: string;
  createdAt: string;
}

export const fetchPredictionHistory = async () => {
  const data = await authorizedRequest<Array<{
    id: string;
    input: {
      readingDependency: number;
      writingDependency: number;
      numeracyDependency: number;
      motivationScore: number;
      toolsCount: number;
    };
    result: {
      level: 'AtRisk' | 'Moderate' | 'High';
      probability: number;
      rationale: string;
    };
    studentReference?: string;
    createdAt: string;
  }>>({
    method: 'GET',
    url: '/predictions',
  });
  return data.map((prediction) => ({
    id: prediction.id,
    level: prediction.result.level,
    probability: prediction.result.probability,
    rationale: prediction.result.rationale,
    studentReference: prediction.studentReference,
    createdAt: prediction.createdAt,
  })) satisfies PredictionHistoryEntry[];
};
