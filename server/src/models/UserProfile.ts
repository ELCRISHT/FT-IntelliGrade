import { Schema, model, type Document } from 'mongoose';

export type UserRole = 'admin' | 'faculty';

export interface IUserProfile extends Document {
  uid: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  middleInitial?: string;
  college?: string;
  contactNumber?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    middleInitial: { type: String },
    college: { type: String },
    contactNumber: { type: String },
    role: { type: String, enum: ['admin', 'faculty'], default: 'faculty' },
  },
  {
    timestamps: true,
  },
);

export const UserProfile = model<IUserProfile>('UserProfile', userProfileSchema);
