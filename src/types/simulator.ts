import type { ActivationType } from "@/lib/neural-net";

export type DatasetType = "xor" | "linear" | "spiral";

export interface DataPoint {
  x: number;
  y: number;
  label: number;
}

export interface DatasetInfo {
  key: DatasetType;
  title: string;
  description: string;
  intuition: string;
  challenge: string;
}

export interface DatasetSummary {
  totalPoints: number;
  positiveCount: number;
  negativeCount: number;
  positiveRatio: number;
}

export interface LossPoint {
  epoch: number;
  loss: number;
  accuracy: number;
}

export interface PredictionSample {
  id: string;
  point: DataPoint;
  probability: number;
  predictedLabel: number;
  confidence: number;
}

export type TrainingPhase =
  | "idle"
  | "forward-pass"
  | "loss-check"
  | "backpropagation"
  | "decision-boundary";

export interface ActivationInfo {
  key: ActivationType;
  title: string;
  description: string;
  bestFor: string;
}
