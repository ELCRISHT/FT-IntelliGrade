import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { PredictionModel } from '../models/Prediction.js';
import { runLogisticModel } from '../services/predictionService.js';

const router = Router();

const predictionSchema = z.object({
  readingDependency: z.number().min(0).max(7),
  writingDependency: z.number().min(0).max(7),
  numeracyDependency: z.number().min(0).max(7),
  motivationScore: z.number().min(0).max(7),
  toolsCount: z.number().min(0).max(30),
  studentId: z
    .string()
    .trim()
    .refine((value) => Types.ObjectId.isValid(value), { message: 'Invalid studentId' })
    .optional(),
  studentReference: z.string().trim().optional(),
});

router.post('/', authenticate, async (req, res) => {
  const { uid } = req.user ?? {};
  if (!uid) {
    return res.status(400).json({ message: 'Invalid Firebase identity token' });
  }

  const parsed = predictionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.flatten() });
  }

  const result = runLogisticModel({
    readingScore: parsed.data.readingDependency,
    writingScore: parsed.data.writingDependency,
    numeracyScore: parsed.data.numeracyDependency,
    motivationScore: parsed.data.motivationScore,
    toolsCount: parsed.data.toolsCount,
  });

  const doc = await PredictionModel.create({
    studentId: parsed.data.studentId ? new Types.ObjectId(parsed.data.studentId) : undefined,
    studentReference: parsed.data.studentReference,
    requestedBy: uid,
    input: {
      readingDependency: parsed.data.readingDependency,
      writingDependency: parsed.data.writingDependency,
      numeracyDependency: parsed.data.numeracyDependency,
      motivationScore: parsed.data.motivationScore,
      toolsCount: parsed.data.toolsCount,
    },
    result: {
      level: result.level,
      probability: result.probability,
      rationale: result.rationale,
    },
  });

  return res.status(201).json({
    id: doc._id,
    input: doc.input,
    result: doc.result,
    createdAt: doc.createdAt,
  });
});

router.get('/', authenticate, async (req, res) => {
  const { uid } = req.user ?? {};
  if (!uid) {
    return res.status(400).json({ message: 'Invalid Firebase identity token' });
  }

  const history = await PredictionModel.find({ requestedBy: uid })
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  return res.json(
    history.map((prediction) => ({
      id: prediction._id,
      input: prediction.input,
      result: prediction.result,
      studentReference: prediction.studentReference,
      createdAt: prediction.createdAt,
    })),
  );
});

export const predictionsRouter = router;
