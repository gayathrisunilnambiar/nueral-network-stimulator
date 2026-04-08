import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { generateDataset, pickRepresentativeSamples, summarizeDataset } from "@/lib/datasets";
import { NeuralNetwork, type ActivationType } from "@/lib/neural-net";
import {
  buildArchitecture,
  createNetwork,
  DATASET_SIZE,
  DEFAULT_BATCH_SIZE,
  evaluateNetwork,
  MAX_EPOCHS,
  TRAINING_STEP_INTERVAL_MS,
} from "@/lib/simulator-engine";
import type {
  DataPoint,
  DatasetType,
  LossPoint,
  PredictionSample,
  TrainingPhase,
} from "@/types/simulator";
const PHASE_SEQUENCE: TrainingPhase[] = [
  "forward-pass",
  "loss-check",
  "backpropagation",
  "decision-boundary",
];

export function useSimulator() {
  const [datasetType, setDatasetType] = useState<DatasetType>("xor");
  const [activation, setActivation] = useState<ActivationType>("tanh");
  const [learningRate, setLearningRate] = useState(0.08);
  const [batchSize, setBatchSize] = useState(DEFAULT_BATCH_SIZE);
  const [hiddenLayerCount, setHiddenLayerCount] = useState(2);
  const [neuronsPerLayer, setNeuronsPerLayer] = useState(4);
  const [maxEpochs, setMaxEpochs] = useState(MAX_EPOCHS);
  const [dataset, setDataset] = useState<DataPoint[]>(() => generateDataset("xor", DATASET_SIZE));
  const [network, setNetwork] = useState<NeuralNetwork>(() =>
    createNetwork(buildArchitecture(2, 4), "tanh", 0.08),
  );
  const [networkVersion, setNetworkVersion] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState<LossPoint[]>([]);
  const [currentLoss, setCurrentLoss] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const animationFrameRef = useRef<number | null>(null);
  const datasetRef = useRef(dataset);
  const networkRef = useRef(network);
  const isTrainingRef = useRef(isTraining);
  const currentEpochRef = useRef(currentEpoch);
  const learningRateRef = useRef(learningRate);
  const batchSizeRef = useRef(batchSize);
  const maxEpochsRef = useRef(maxEpochs);
  const lastTrainingStepRef = useRef(0);

  const architecture = useMemo(
    () => buildArchitecture(hiddenLayerCount, neuronsPerLayer),
    [hiddenLayerCount, neuronsPerLayer],
  );

  const resetMetrics = useCallback((nextNetwork: NeuralNetwork, nextDataset: DataPoint[]) => {
    const baseline = evaluateNetwork(nextNetwork, nextDataset);

    currentEpochRef.current = 0;
    setCurrentEpoch(0);
    setLossHistory([]);
    setCurrentLoss(baseline.loss);
    setAccuracy(baseline.accuracy);
  }, []);

  const rebuildNetwork = useCallback(
    (nextDataset: DataPoint[]) => {
      const nextNetwork = createNetwork(architecture, activation, learningRateRef.current);

      isTrainingRef.current = false;
      setIsTraining(false);
      networkRef.current = nextNetwork;
      setNetwork(nextNetwork);
      setNetworkVersion((value) => value + 1);
      resetMetrics(nextNetwork, nextDataset);
    },
    [activation, architecture, resetMetrics],
  );

  const regenerateDataset = useCallback(
    (nextType: DatasetType) => {
      const nextDataset = generateDataset(nextType, DATASET_SIZE);
      datasetRef.current = nextDataset;
      setDataset(nextDataset);
      rebuildNetwork(nextDataset);
    },
    [rebuildNetwork],
  );

  const runEpoch = useCallback(() => {
    const activeNetwork = networkRef.current;
    const activeDataset = datasetRef.current;

    if (!activeNetwork || activeDataset.length === 0) {
      return;
    }

    const effectiveBatchSize = Math.max(1, Math.min(batchSizeRef.current, activeDataset.length));
    const shuffledDataset = [...activeDataset].sort(() => Math.random() - 0.5);
    let epochLoss = 0;
    let seenSamples = 0;

    // One visual "epoch" still covers the full dataset, but it is processed in
    // batches so students can see how batch size changes training behavior.
    for (let start = 0; start < shuffledDataset.length; start += effectiveBatchSize) {
      const batch = shuffledDataset.slice(start, start + effectiveBatchSize);

      batch.forEach((point) => {
        epochLoss += activeNetwork.train([point.x, point.y], [point.label]);
        seenSamples += 1;
      });
    }

    const meanLoss = epochLoss / Math.max(1, seenSamples);
    const evaluation = evaluateNetwork(activeNetwork, activeDataset);
    const nextEpoch = currentEpochRef.current + 1;

    currentEpochRef.current = nextEpoch;
    setCurrentEpoch(nextEpoch);
    setCurrentLoss(meanLoss);
    setAccuracy(evaluation.accuracy);
    setLossHistory((history) =>
      [...history, { epoch: nextEpoch, loss: meanLoss, accuracy: evaluation.accuracy }].slice(-MAX_EPOCHS),
    );
    setNetworkVersion((value) => value + 1);

    if (nextEpoch >= maxEpochsRef.current) {
      isTrainingRef.current = false;
      setIsTraining(false);
    }
  }, []);

  const toggleTraining = useCallback(() => {
    if (currentEpochRef.current >= maxEpochsRef.current) {
      return;
    }

    setIsTraining((value) => {
      const nextValue = !value;
      isTrainingRef.current = nextValue;
      return nextValue;
    });
  }, []);

  const stepEpoch = useCallback(() => {
    if (currentEpochRef.current >= maxEpochsRef.current) {
      return;
    }

    isTrainingRef.current = false;
    setIsTraining(false);
    runEpoch();
  }, [runEpoch]);

  const resetSimulation = useCallback(() => {
    rebuildNetwork(datasetRef.current);
  }, [rebuildNetwork]);

  const setDatasetTypeAndReset = useCallback(
    (nextType: DatasetType) => {
      setDatasetType(nextType);
      regenerateDataset(nextType);
    },
    [regenerateDataset],
  );

  const handleWeightChange = useCallback((layerIdx: number, fromNeuron: number, toNeuron: number, newWeight: number) => {
    const activeNetwork = networkRef.current;

    if (!activeNetwork) {
      return;
    }

    isTrainingRef.current = false;
    setIsTraining(false);
    activeNetwork.setLayerWeights(layerIdx, fromNeuron, toNeuron, newWeight);

    const evaluation = evaluateNetwork(activeNetwork, datasetRef.current);
    setCurrentLoss(evaluation.loss);
    setAccuracy(evaluation.accuracy);
    setNetworkVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    datasetRef.current = dataset;
  }, [dataset]);

  useEffect(() => {
    networkRef.current = network;
  }, [network]);

  useEffect(() => {
    isTrainingRef.current = isTraining;
  }, [isTraining]);

  useEffect(() => {
    currentEpochRef.current = currentEpoch;
  }, [currentEpoch]);

  useEffect(() => {
    learningRateRef.current = learningRate;
  }, [learningRate]);

  useEffect(() => {
    batchSizeRef.current = batchSize;
  }, [batchSize]);

  useEffect(() => {
    maxEpochsRef.current = maxEpochs;

    if (currentEpochRef.current >= maxEpochs) {
      isTrainingRef.current = false;
      setIsTraining(false);
    }
  }, [maxEpochs]);

  useEffect(() => {
    rebuildNetwork(datasetRef.current);
  }, [activation, architecture, rebuildNetwork]);

  useEffect(() => {
    const activeNetwork = networkRef.current;

    if (!activeNetwork) {
      return;
    }

    activeNetwork.setLearningRate(learningRate);
    const evaluation = evaluateNetwork(activeNetwork, datasetRef.current);
    setCurrentLoss(evaluation.loss);
    setAccuracy(evaluation.accuracy);
    setNetworkVersion((value) => value + 1);
  }, [learningRate]);

  useEffect(() => {
    const loop = () => {
      const now = performance.now();

      // A small delay between epochs gives students time to notice how the
      // visuals respond, while also reducing avoidable main-thread pressure.
      if (isTrainingRef.current && now - lastTrainingStepRef.current >= TRAINING_STEP_INTERVAL_MS) {
        lastTrainingStepRef.current = now;
        runEpoch();
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [runEpoch]);

  const datasetSummary = useMemo(() => summarizeDataset(dataset), [dataset]);
  const predictionSamples = useMemo<PredictionSample[]>(() => {
    if (!network) {
      return [];
    }

    // The network mutates in place during training, so this keeps the teaching
    // examples aligned with the latest weights even when the instance is reused.
    void networkVersion;
    return pickRepresentativeSamples(dataset, 4).map((point, index) => {
      const probability = network.predict([point.x, point.y])[0];
      const predictedLabel = probability >= 0.5 ? 1 : 0;

      return {
        id: `${index}-${point.x.toFixed(2)}-${point.y.toFixed(2)}`,
        point,
        probability,
        predictedLabel,
        confidence: Math.abs(probability - 0.5) * 2,
      };
    });
  }, [dataset, network, networkVersion]);

  const trainingPhase = useMemo<TrainingPhase>(() => {
    if (currentEpoch === 0 && !isTraining) {
      return "idle";
    }

    if (!isTraining) {
      return "decision-boundary";
    }

    return PHASE_SEQUENCE[currentEpoch % PHASE_SEQUENCE.length];
  }, [currentEpoch, isTraining]);

  const insight = useMemo(() => {
    if (currentEpoch === 0) {
      return "Start with one step to see how a single epoch nudges the decision boundary.";
    }

    if (accuracy > 0.9) {
      return "The model is separating the classes well. Try a tougher dataset or reduce neurons to test its limits.";
    }

    if (learningRate > 0.2) {
      return "A large learning rate can make the boundary jump around. Lower it if the loss oscillates.";
    }

    if (activation === "linear") {
      return "Linear hidden layers cannot bend the space enough for XOR or spiral data, so accuracy will plateau.";
    }

    if (datasetType === "linear") {
      return "This dataset is linearly separable, so the boundary should straighten out quickly as the model learns.";
    }

    if (datasetType === "spiral") {
      return "Spiral data is intentionally hard. Watch for a slowly twisting decision boundary instead of a quick clean split.";
    }

    return "Watch how the boundary smooths out over time as the network keeps correcting its mistakes.";
  }, [accuracy, activation, currentEpoch, datasetType, learningRate]);

  return {
    activation,
    architecture,
    currentEpoch,
    currentLoss,
    dataset,
    datasetSummary,
    datasetType,
    accuracy,
    hiddenLayerCount,
    insight,
    isTraining,
    batchSize,
    learningRate,
    lossHistory,
    maxEpochs,
    network,
    networkVersion,
    neuronsPerLayer,
    predictionSamples,
    trainingPhase,
    handleWeightChange,
    regenerateDataset: () => regenerateDataset(datasetType),
    resetSimulation,
    setActivation,
    setBatchSize,
    setDatasetType: setDatasetTypeAndReset,
    setHiddenLayerCount,
    setLearningRate,
    setMaxEpochs,
    setNeuronsPerLayer,
    stepEpoch,
    toggleTraining,
  };
}
