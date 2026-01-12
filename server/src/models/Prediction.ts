import { Schema, model, models, type Types } from 'mongoose';

export enum PerformanceLevel {
	AtRisk = 'AtRisk',
	Moderate = 'Moderate',
	High = 'High',
}

export interface PredictionDocument {
	_id: Schema.Types.ObjectId;
	studentId?: Types.ObjectId;
	studentReference?: string;
	requestedBy: string;
	input: {
		readingDependency: number;
		writingDependency: number;
		numeracyDependency: number;
		motivationScore: number;
		toolsCount: number;
	};
	result: {
		level: PerformanceLevel;
		probability: number;
		rationale: string;
	};
	createdAt: Date;
	updatedAt: Date;
}

const predictionSchema = new Schema<PredictionDocument>(
	{
		studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
		studentReference: { type: String },
		requestedBy: { type: String, required: true },
		input: {
			readingDependency: { type: Number, required: true, min: 0, max: 7 },
			writingDependency: { type: Number, required: true, min: 0, max: 7 },
			numeracyDependency: { type: Number, required: true, min: 0, max: 7 },
			motivationScore: { type: Number, required: true, min: 0, max: 7 },
			toolsCount: { type: Number, required: true, min: 0 },
		},
		result: {
			level: {
				type: String,
				enum: Object.values(PerformanceLevel),
				required: true,
			},
			probability: { type: Number, required: true, min: 0, max: 100 },
			rationale: { type: String, required: true },
		},
	},
	{ timestamps: true },
);

predictionSchema.index({ requestedBy: 1, createdAt: -1 });
predictionSchema.index({ studentId: 1, createdAt: -1 });

export const PredictionModel =
	models.Prediction || model<PredictionDocument>('Prediction', predictionSchema);
