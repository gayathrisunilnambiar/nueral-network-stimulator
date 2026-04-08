import { NeuralNetwork, type ActivationType } from "@/lib/neural-net";
import type { DataPoint } from "@/types/simulator";

export const MAX_EPOCHS = 400;
export const DATASET_SIZE = 240;
export const DEFAULT_BATCH_SIZE = 24;
export const TRAINING_STEP_INTERVAL_MS = 80;

export function buildArchitecture(hiddenLayerCount: number, neuronsPerLayer: number) {
  return [2, ...Array.from({ length: hiddenLayerCount }, () => neuronsPerLayer), 1];
}

export function createNetwork(
  architecture: number[],
  activation: ActivationType,
  learningRate: number,
) {
  const network = new NeuralNetwork(architecture, activation);
  network.setLearningRate(learningRate);
  return network;
}

export function evaluateNetwork(network: NeuralNetwork, dataset: DataPoint[]) {
  if (dataset.length === 0) {
    return { loss: 0, accuracy: 0 };
  }

  let correct = 0;
  let cumulativeLoss = 0;

  dataset.forEach((point) => {
    const probability = network.predict([point.x, point.y])[0];
    const error = point.label - probability;

    cumulativeLoss += error * error;
    correct += (probability >= 0.5 ? 1 : 0) === point.label ? 1 : 0;
  });

  return {
    loss: cumulativeLoss / dataset.length,
    accuracy: correct / dataset.length,
  };
}
