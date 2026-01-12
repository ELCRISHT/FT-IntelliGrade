import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { Student } from '../models/Student.js';
import { UserProfile } from '../models/UserProfile.js';

const router = Router();

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(1000),
  search: z.string().optional(),
});

const studentPayload = z.object({
  studentId: z.string().min(1),
  college: z.string().min(1),
  yearLevel: z.number().min(1).max(6),
  readingDependencyScore: z.number().min(0).max(7),
  writingDependencyScore: z.number().min(0).max(7),
  numeracyDependencyScore: z.number().min(0).max(7),
  motivationScore: z.number().min(0).max(7),
  aiToolsCount: z.number().min(0).max(50),
  primaryAiTool: z.string().min(1),
  usagePurpose: z.string().min(1),
});

router.get('/', authenticate, async (req, res) => {
  const { uid } = req.user ?? {};
  if (!uid) {
    return res.status(400).json({ message: 'Invalid Firebase identity token' });
  }

  const profile = await UserProfile.findOne({ uid });
  if (!profile) {
    return res.status(403).json({ message: 'Profile not found' });
  }

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid query params', issues: parsed.error.flatten() });
  }

  const { page, limit, search } = parsed.data;

  const filters: Record<string, unknown> = {};
  if (profile.role === 'faculty') {
    filters.college = profile.college;
  }

  if (search) {
    filters.$or = [
      { studentId: { $regex: search, $options: 'i' } },
      { college: { $regex: search, $options: 'i' } },
      { primaryAiTool: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Student.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Student.countDocuments(filters),
  ]);

  return res.json({ items, total, page, limit });
});

router.post('/bulk', authenticate, async (req, res) => {
  const { uid } = req.user ?? {};
  if (!uid) {
    return res.status(400).json({ message: 'Invalid Firebase identity token' });
  }

  const profile = await UserProfile.findOne({ uid });
  if (!profile) {
    return res.status(403).json({ message: 'Profile not found' });
  }

  if (profile.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can import datasets' });
  }

  const payload = z.array(studentPayload).safeParse(req.body?.students);
  if (!payload.success) {
    return res.status(400).json({ message: 'Invalid students payload', issues: payload.error.flatten() });
  }

  const operations = payload.data.map((student) => ({
    updateOne: {
      filter: { studentId: student.studentId },
      update: { $set: student },
      upsert: true,
    },
  }));

  if (operations.length === 0) {
    return res.status(400).json({ message: 'No valid students provided' });
  }

  const bulk = await Student.bulkWrite(operations, { ordered: false });

  return res.status(201).json({
    matched: bulk.nMatched,
    modified: bulk.nModified,
    upserted: bulk.nUpserted,
    totalImported: payload.data.length,
  });
});

export const studentsRouter = router;
