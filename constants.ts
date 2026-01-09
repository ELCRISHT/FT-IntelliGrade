import { Student } from './types';

export const COLLEGES = [
  "College of Computer Studies",
  "College of Engineering",
  "College of Arts and Sciences",
  "College of Criminal Justice Education",
  "College of Teacher Education",
  "College of Industrial Technology",
  "College of International Hospitality Management and Tourism",
  "College of Business Administration and Accountancy"
];

export const COLLEGE_CODES: Record<string, string> = {
  "College of Computer Studies": "CCS",
  "College of Engineering": "COE",
  "College of Arts and Sciences": "CAS",
  "College of Criminal Justice Education": "CCJE",
  "College of Teacher Education": "CTE",
  "College of Industrial Technology": "CIT",
  "College of International Hospitality Management and Tourism": "CIHMT",
  "College of Business Administration and Accountancy": "CBAA"
};

export const TOOLS = ["ChatGPT", "Gemini", "Grammarly", "Quillbot", "Bing AI"];
export const PURPOSES = ["Grammar", "Problem-solving", "Essay writing", "Research", "Coding", "Summary", "Brainstorming"];

// Helper to generate random number in range
const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate 381 Students based on thesis patterns
const generateStudents = (count: number): Student[] => {
  const students: Student[] = [];
  
  for (let i = 1; i <= count; i++) {
    const college = pick(COLLEGES);
    let reading = random(1, 7);
    let writing = random(1, 7);
    let numeracy = random(1, 7);
    let motivation = random(1, 7);
    
    if (Math.random() > 0.7) {
       reading = random(5, 7);
       writing = random(5, 7);
       numeracy = random(5, 7);
       motivation = random(1, 3.5);
    } else if (Math.random() > 0.7) {
       reading = random(1, 4);
       writing = random(1, 4);
       numeracy = random(1, 4);
       motivation = random(5.5, 7);
    }

    students.push({
      Student_ID: `S${1000 + i}`,
      College: college,
      Year_Level: randomInt(1, 4),
      Reading_Dependency_Score: parseFloat(reading.toFixed(1)),
      Writing_Dependency_Score: parseFloat(writing.toFixed(1)),
      Numeracy_Dependency_Score: parseFloat(numeracy.toFixed(1)),
      Motivation_Score: parseFloat(motivation.toFixed(1)),
      AI_Tools_Count: randomInt(1, 6),
      Primary_AI_Tool: pick(TOOLS),
      Usage_Purpose: pick(PURPOSES)
    });
  }
  return students;
};

export const MOCK_STUDENTS: Student[] = generateStudents(381);

export const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];