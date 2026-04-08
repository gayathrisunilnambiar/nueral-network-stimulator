import type {
  DataPoint,
  DatasetInfo,
  DatasetSummary,
  DatasetType,
} from "@/types/simulator";

export const DATASET_INFO: Record<DatasetType, DatasetInfo> = {
  xor: {
    key: "xor",
    title: "XOR",
    description: "Points in opposite quadrants share the same class.",
    intuition: "A single straight line cannot solve XOR, so hidden layers must bend space.",
    challenge: "Students see why non-linearity matters in neural networks.",
  },
  linear: {
    key: "linear",
    title: "Linearly Separable",
    description: "A single straight boundary is enough to separate the two classes.",
    intuition: "This is the easiest case, so students can quickly see what fast convergence looks like.",
    challenge: "It provides a clean baseline before moving to harder non-linear problems.",
  },
  spiral: {
    key: "spiral",
    title: "Spiral",
    description: "Two intertwined spirals force the network to learn a highly curved boundary.",
    intuition: "The model must keep warping the plane to unwrap the classes from each other.",
    challenge: "This shows why deeper networks and slower training can matter on complex patterns.",
  },
};

export function generateDataset(
  type: DatasetType,
  numPoints: number = 240,
): DataPoint[] {
  if (type === "xor") {
    return generateXorDataset(numPoints);
  }

  if (type === "linear") {
    return generateLinearlySeparableDataset(numPoints);
  }

  if (type === "spiral") {
    return generateSpiralDataset(numPoints);
  }

  return generateXorDataset(numPoints);
}

export function summarizeDataset(dataset: DataPoint[]): DatasetSummary {
  const positiveCount = dataset.filter((point) => point.label === 1).length;
  const negativeCount = dataset.length - positiveCount;

  return {
    totalPoints: dataset.length,
    positiveCount,
    negativeCount,
    positiveRatio: dataset.length === 0 ? 0 : positiveCount / dataset.length,
  };
}

export function pickRepresentativeSamples(
  dataset: DataPoint[],
  limit: number = 4,
): DataPoint[] {
  const positives = dataset.filter((point) => point.label === 1).slice(0, Math.ceil(limit / 2));
  const negatives = dataset.filter((point) => point.label === 0).slice(0, Math.floor(limit / 2));

  return [...positives, ...negatives].slice(0, limit);
}

export function generateXorDataset(numPoints: number): DataPoint[] {
  const points: DataPoint[] = [];

  for (let i = 0; i < numPoints; i += 1) {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const padding = 0.12;

    if (Math.abs(x) < padding || Math.abs(y) < padding) {
      i -= 1;
      continue;
    }

    const label = (x > 0 && y > 0) || (x < 0 && y < 0) ? 1 : 0;
    points.push({ x, y, label });
  }

  return points;
}

export function generateLinearlySeparableDataset(numPoints: number): DataPoint[] {
  const points: DataPoint[] = [];

  for (let i = 0; i < numPoints; i += 1) {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const signedDistance = x - 0.35 * y;
    const margin = 0.08;

    if (Math.abs(signedDistance) < margin) {
      i -= 1;
      continue;
    }

    points.push({
      x,
      y,
      label: signedDistance > 0 ? 1 : 0,
    });
  }

  return points;
}

export function generateSpiralDataset(numPoints: number): DataPoint[] {
  const points: DataPoint[] = [];
  const pointsPerClass = Math.floor(numPoints / 2);

  for (let index = 0; index < pointsPerClass; index += 1) {
    const progress = index / Math.max(1, pointsPerClass - 1);
    const radius = 0.12 + progress * 0.88;
    const angle = progress * 3.8 * Math.PI;
    const noise = 0.04;

    points.push(createSpiralPoint(radius, angle, noise, 1));
    points.push(createSpiralPoint(radius, angle + Math.PI, noise, 0));
  }

  return points.slice(0, numPoints);
}

function randomNormal(mean: number, std: number): number {
  let u = 0;
  let v = 0;

  while (u === 0) {
    u = Math.random();
  }

  while (v === 0) {
    v = Math.random();
  }

  const normal = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return normal * std + mean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createSpiralPoint(
  radius: number,
  angle: number,
  noise: number,
  label: number,
): DataPoint {
  const x = clamp(radius * Math.cos(angle) + randomNormal(0, noise), -1, 1);
  const y = clamp(radius * Math.sin(angle) + randomNormal(0, noise), -1, 1);

  return { x, y, label };
}
