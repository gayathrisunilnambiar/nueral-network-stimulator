export interface BackpropNeuronState {
  index: number;
  bias: number;
  weightedSum: number;
  activation: number;
  activationDerivative: number;
  upstreamSignal: number;
  delta: number;
  biasGradient: number;
  biasUpdate: number;
  isInput: boolean;
  isOutput: boolean;
}

export interface BackpropLayerState {
  layerIndex: number;
  neurons: BackpropNeuronState[];
}

export interface BackpropConnectionState {
  fromLayer: number;
  fromNeuron: number;
  toLayer: number;
  toNeuron: number;
  weight: number;
  sourceActivation: number;
  targetDelta: number;
  gradient: number;
  update: number;
  newWeight: number;
}

export interface LossSnapshot {
  prediction: number;
  target: number;
  error: number;
  mse: number;
  derivativeWrtPrediction: number;
}

export interface BackpropagationSnapshot {
  input: number[];
  target: number[];
  output: number[];
  learningRate: number;
  loss: LossSnapshot;
  layers: BackpropLayerState[];
  connections: BackpropConnectionState[];
}
