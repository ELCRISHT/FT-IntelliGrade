import { Schema, model, type Document } from 'mongoose';

export interface IStudent extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    studentId: { type: String, required: true, unique: true },
    college: { type: String, required: true, index: true },
    yearLevel: { type: Number, required: true },
    readingDependencyScore: { type: Number, required: true },
    writingDependencyScore: { type: Number, required: true },
    numeracyDependencyScore: { type: Number, required: true },
    motivationScore: { type: Number, required: true },
    aiToolsCount: { type: Number, required: true },
    primaryAiTool: { type: String, required: true },
    usagePurpose: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

studentSchema.index({ studentId: 1 });
studentSchema.index({ college: 1, yearLevel: 1 });

export const Student = model<IStudent>('Student', studentSchema);
