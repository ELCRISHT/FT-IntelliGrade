import { PerformanceLevel } from '../models/Prediction.js';

interface PredictionInput {
  readingScore: number;
  writingScore: number;
  numeracyScore: number;
  motivationScore: number;
  toolsCount: number;
}

interface PredictionResult {
  probability: number;
  level: PerformanceLevel;
  rationale: string;
}

const coefficients = {
  intercept: 8.4,
  reading: -0.9,
  writing: -1.05,
  numeracy: -0.85,
  motivation: 1.25,
  toolsCount: -0.35,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const runLogisticModel = (input: PredictionInput): PredictionResult => {
  const { readingScore, writingScore, numeracyScore, motivationScore, toolsCount } = input;

  const linearScore =
    coefficients.intercept +
    coefficients.reading * readingScore +
    coefficients.writing * writingScore +
    coefficients.numeracy * numeracyScore +
    coefficients.motivation * motivationScore +
    coefficients.toolsCount * toolsCount;

  const probability = 1 / (1 + Math.exp(-linearScore));
  const normalizedProbability = Math.round(clamp(probability, 0.01, 0.99) * 100);

  let level: PerformanceLevel = PerformanceLevel.Moderate;
  if (normalizedProbability >= 70) {
    level = PerformanceLevel.High;
  } else if (normalizedProbability <= 40) {
    level = PerformanceLevel.AtRisk;
  }

  const rationale = (() => {
    if (level === PerformanceLevel.High) {
      return 'Student exhibits healthy AI usage patterns and strong intrinsic motivation. Sustain current interventions and consider mentorship roles.';
    }
    if (level === PerformanceLevel.AtRisk) {
      return 'Indicators show elevated AI dependency with low motivation. Recommend immediate academic coaching and ethical AI usage refresher.';
    }
    return 'Monitor writing and numeracy dependency monthly; consider targeted workshops to keep motivation elevated.';
  })();

  return {
    probability: normalizedProbability,
    level,
    rationale,
  };
};
