import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { UserProfile } from '../models/UserProfile.js';

const router = Router();

const upsertSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleInitial: z.string().optional(),
  college: z.string().optional(),
  contactNumber: z.string().optional(),
  role: z.enum(['admin', 'faculty']).default('faculty'),
});

router.get('/me', authenticate, async (req, res) => {
  const { uid, email } = req.user ?? {};

  if (!uid || !email) {
    return res.status(400).json({ message: 'Invalid Firebase identity token' });
  }

  let profile = await UserProfile.findOne({ uid });

  if (!profile) {
    profile = await UserProfile.create({
      uid,
      email,
      name: email.split('@')[0],
      role: 'faculty',
    });
  }

  return res.json(profile);
});

router.post('/register', authenticate, async (req, res) => {
  const { uid, email } = req.user ?? {};
  if (!uid || !email) {
    return res.status(400).json({ message: 'Invalid Firebase identity token' });
  }

  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.flatten() });
  }

  const data = parsed.data;

  const name = `${data.firstName} ${data.middleInitial ? data.middleInitial + '.' : ''} ${data.lastName}`.replace(/\s+/g, ' ').trim();

  const profile = await UserProfile.findOneAndUpdate(
    { uid },
    {
      uid,
      email,
      name,
      firstName: data.firstName,
      middleInitial: data.middleInitial,
      lastName: data.lastName,
      college: data.role === 'faculty' ? data.college : undefined,
      contactNumber: data.contactNumber,
      role: data.role,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return res.status(201).json(profile);
});

router.put('/me', authenticate, async (req, res) => {
  const { uid } = req.user ?? {};
  if (!uid) {
    return res.status(400).json({ message: 'Invalid Firebase identity token' });
  }

  const parsed = upsertSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.flatten() });
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data?.firstName || parsed.data?.lastName || parsed.data?.middleInitial) {
    update.name = `${parsed.data?.firstName ?? ''} ${parsed.data?.middleInitial ? parsed.data.middleInitial + '.' : ''} ${parsed.data?.lastName ?? ''}`
      .replace(/\s+/g, ' ')
      .trim();
  }

  const profile = await UserProfile.findOneAndUpdate({ uid }, update, { new: true });

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  return res.json(profile);
});

export const authRouter = router;
