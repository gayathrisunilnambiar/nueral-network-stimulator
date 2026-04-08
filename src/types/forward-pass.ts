export interface ForwardPassNeuronState {
  index: number;
  bias: number;
  weightedSum: number;
  activation: number;
  isInput: boolean;
}

export interface ForwardPassLayerState {
  layerIndex: number;
  neurons: ForwardPassNeuronState[];
}

export interface ForwardPassConnectionState {
  fromLayer: number;
  fromNeuron: number;
  toLayer: number;
  toNeuron: number;
  weight: number;
  contribution: number;
}

export interface ForwardPassSnapshot {
  input: number[];
  output: number[];
  layers: ForwardPassLayerState[];
  connections: ForwardPassConnectionState[];
}
