import type {
  BackpropConnectionState,
  BackpropagationSnapshot,
} from "@/types/backpropagation";
import type {
  ForwardPassConnectionState,
  ForwardPassSnapshot,
} from "@/types/forward-pass";

export type ActivationType = 'relu' | 'sigmoid' | 'tanh' | 'linear';

export interface LayerSnapshot {
  weights: number[][];
  biases: number[];
  outputs: number[];
  activation: ActivationType;
}

export interface NetworkSnapshot {
  architecture: number[];
  layers: LayerSnapshot[];
}

export class Matrix {
  rows: number;
  cols: number;
  data: number[][];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.data = Array.from({ length: rows }, () => new Array(cols).fill(0));
  }

  static fromArray(arr: number[]): Matrix {
    const m = new Matrix(arr.length, 1);
    for (let i = 0; i < arr.length; i++) {
      m.data[i][0] = arr[i];
    }
    return m;
  }

  toArray(): number[] {
    const arr: number[] = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        arr.push(this.data[i][j]);
      }
    }
    return arr;
  }

  randomize(): void {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = Math.random() * 2 - 1;
      }
    }
  }

  add(n: Matrix | number): void {
    if (n instanceof Matrix) {
      if (this.rows !== n.rows || this.cols !== n.cols) {
        throw new Error('Matrix Dimensions must match for addition');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] += n.data[i][j];
        }
      }
    } else {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] += n;
        }
      }
    }
  }

  static subtract(a: Matrix, b: Matrix): Matrix {
    if (a.rows !== b.rows || a.cols !== b.cols) {
      throw new Error('Matrix Dimensions must match for subtraction');
    }
    const result = new Matrix(a.rows, a.cols);
    for (let i = 0; i < a.rows; i++) {
      for (let j = 0; j < a.cols; j++) {
        result.data[i][j] = a.data[i][j] - b.data[i][j];
      }
    }
    return result;
  }

  static multiply(a: Matrix, b: Matrix): Matrix {
    if (a.cols !== b.rows) {
      throw new Error('Columns of A must match rows of B');
    }
    const result = new Matrix(a.rows, b.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        let sum = 0;
        for (let k = 0; k < a.cols; k++) {
          sum += a.data[i][k] * b.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  multiply(n: Matrix | number): void {
    if (n instanceof Matrix) {
      if (this.rows !== n.rows || this.cols !== n.cols) {
        throw new Error('Matrix Dimensions must match for element-wise multiplication');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] *= n.data[i][j];
        }
      }
    } else {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] *= n;
        }
      }
    }
  }

  map(func: (val: number, i: number, j: number) => number): void {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = func(this.data[i][j], i, j);
      }
    }
  }

  static map(m: Matrix, func: (val: number, i: number, j: number) => number): Matrix {
    const result = new Matrix(m.rows, m.cols);
    for (let i = 0; i < m.rows; i++) {
      for (let j = 0; j < m.cols; j++) {
        result.data[i][j] = func(m.data[i][j], i, j);
      }
    }
    return result;
  }

  static transpose(m: Matrix): Matrix {
    const result = new Matrix(m.cols, m.rows);
    for (let i = 0; i < m.rows; i++) {
      for (let j = 0; j < m.cols; j++) {
        result.data[j][i] = m.data[i][j];
      }
    }
    return result;
  }

  clone(): Matrix {
    const m = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        m.data[i][j] = this.data[i][j];
      }
    }
    return m;
  }
}

export class Layer {
  weights: Matrix;
  biases: Matrix;
  activationFunc: ActivationType;
  
  // Cache for backprop
  inputs: Matrix | null = null;
  outputs: Matrix | null = null;
  weightedSums: Matrix | null = null;

  constructor(inputSize: number, outputSize: number, activationFunc: ActivationType = 'sigmoid') {
    this.weights = new Matrix(outputSize, inputSize);
    this.biases = new Matrix(outputSize, 1);
    
    // Xavier/Glorot-like initialization
    const scale = activationFunc === 'relu' ? Math.sqrt(2 / inputSize) : Math.sqrt(1 / inputSize);
    this.weights.map(() => (Math.random() * 2 - 1) * scale);
    this.activationFunc = activationFunc;
  }

  activate(x: number): number {
    switch(this.activationFunc) {
      case 'sigmoid': return 1 / (1 + Math.exp(-x));
      case 'tanh': return Math.tanh(x);
      case 'relu': return Math.max(0, x);
      case 'linear': 
      default: return x;
    }
  }

  derivative(y: number): number {
    // y is the ACTIVATED output
    switch(this.activationFunc) {
      case 'sigmoid': return y * (1 - y);
      case 'tanh': return 1 - (y * y);
      case 'relu': return y > 0 ? 1 : 0;
      case 'linear':
      default: return 1;
    }
  }

  forward(inputs: Matrix): Matrix {
    this.inputs = inputs;
    const z = Matrix.multiply(this.weights, inputs);
    z.add(this.biases);
    this.weightedSums = z.clone();
    z.map((val) => this.activate(val));
    this.outputs = z;
    return z;
  }
}

export class NeuralNetwork {
  layers: Layer[] = [];
  learningRate: number = 0.1;

  constructor(public architecture: number[], public activationFuncType: ActivationType = 'tanh') {
    this.buildNetwork();
  }

  buildNetwork() {
    this.layers = [];
    for (let i = 1; i < this.architecture.length; i++) {
      // Output layer uses sigmoid for binary classification
      const isOutputLayer = i === this.architecture.length - 1;
      const func = isOutputLayer ? 'sigmoid' : this.activationFuncType;
      this.layers.push(new Layer(this.architecture[i - 1], this.architecture[i], func));
    }
  }

  getSnapshot(): NetworkSnapshot {
    return {
      architecture: [...this.architecture],
      layers: this.layers.map((layer) => ({
        weights: layer.weights.data.map((row) => [...row]),
        biases: layer.biases.data.map((bias) => bias[0]),
        outputs: layer.outputs
          ? layer.outputs.data.map((output) => output[0])
          : new Array(layer.weights.rows).fill(0),
        activation: layer.activationFunc,
      })),
    };
  }

  getWeights() {
    return this.getSnapshot().layers;
  }

  setLearningRate(lr: number) {
    this.learningRate = lr;
  }

  setActivation(activation: ActivationType) {
    this.activationFuncType = activation;
    // Rebuild the network to apply new activation function on hidden layers
    this.buildNetwork();
  }

  predict(inputArray: number[]): number[] {
    let inputs = Matrix.fromArray(inputArray);
    for (const layer of this.layers) {
      inputs = layer.forward(inputs);
    }
    return inputs.toArray();
  }

  train(inputArray: number[], targetArray: number[]): number {
    let inputs = Matrix.fromArray(inputArray);
    for (const layer of this.layers) {
      inputs = layer.forward(inputs);
    }
    
    const targets = Matrix.fromArray(targetArray);
    const outputError = Matrix.subtract(targets, inputs);
    
    let loss = 0;
    const errArray = outputError.toArray();
    for (let i = 0; i < errArray.length; i++) {
      loss += errArray[i] * errArray[i];
    }
    loss /= errArray.length;

    const previousWeights = this.layers.map((layer) => layer.weights.clone());
    let downstreamDelta: Matrix | null = null;

    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      const prev_inputs = layer.inputs!;
      const derivatives = Matrix.map(layer.outputs!, val => layer.derivative(val));
      let delta: Matrix;

      if (i === this.layers.length - 1) {
        // For MSE, the output layer starts with "prediction minus target",
        // then scales it by the activation derivative to get the local delta.
        const predictionMinusTarget = Matrix.subtract(layer.outputs!, targets);
        predictionMinusTarget.multiply(2 / targetArray.length);
        delta = predictionMinusTarget;
      } else {
        // Hidden layers do not see the target directly. Their error signal comes
        // from the next layer's deltas flowing backward through the old weights.
        const nextWeightsT = Matrix.transpose(previousWeights[i + 1]);
        delta = Matrix.multiply(nextWeightsT, downstreamDelta!);
      }

      delta.multiply(derivatives);

      const inputs_t = Matrix.transpose(prev_inputs);
      const weightGradients = Matrix.multiply(delta, inputs_t);
      const weightUpdates = weightGradients.clone();
      weightUpdates.multiply(-this.learningRate);

      const biasUpdates = delta.clone();
      biasUpdates.multiply(-this.learningRate);

      layer.weights.add(weightUpdates);
      layer.biases.add(biasUpdates);
      downstreamDelta = delta;
    }
    
    return loss;
  }

  setLayerWeights(layerIdx: number, fromNeuron: number, toNeuron: number, newWeight: number) {
    const layer = this.layers[layerIdx];

    if (!layer) {
      return;
    }

    if (layer.weights.data[toNeuron]?.[fromNeuron] === undefined) {
      return;
    }

    layer.weights.data[toNeuron][fromNeuron] = newWeight;
  }

  traceForwardPass(inputArray: number[]): ForwardPassSnapshot {
    const output = this.predict(inputArray);
    const layers = [
      {
        layerIndex: 0,
        neurons: inputArray.map((value, index) => ({
          index,
          bias: 0,
          weightedSum: value,
          activation: value,
          isInput: true,
        })),
      },
    ];

    const connections: ForwardPassConnectionState[] = [];

    for (let layerIdx = 0; layerIdx < this.layers.length; layerIdx++) {
      const layer = this.layers[layerIdx];
      const previousOutputs =
        layer.inputs?.data.map((value) => value[0]) ?? new Array(layer.weights.cols).fill(0);
      const weightedSums =
        layer.weightedSums?.data.map((value) => value[0]) ?? new Array(layer.weights.rows).fill(0);
      const activations =
        layer.outputs?.data.map((value) => value[0]) ?? new Array(layer.weights.rows).fill(0);

      layers.push({
        layerIndex: layerIdx + 1,
        neurons: activations.map((activation, neuronIdx) => ({
          index: neuronIdx,
          bias: layer.biases.data[neuronIdx][0],
          weightedSum: weightedSums[neuronIdx],
          activation,
          isInput: false,
        })),
      });

      for (let toNeuron = 0; toNeuron < layer.weights.rows; toNeuron++) {
        for (let fromNeuron = 0; fromNeuron < layer.weights.cols; fromNeuron++) {
          const weight = layer.weights.data[toNeuron][fromNeuron];

          connections.push({
            fromLayer: layerIdx,
            fromNeuron,
            toLayer: layerIdx + 1,
            toNeuron,
            weight,
            contribution: previousOutputs[fromNeuron] * weight,
          });
        }
      }
    }

    return {
      input: [...inputArray],
      output,
      layers,
      connections,
    };
  }

  traceBackpropagation(inputArray: number[], targetArray: number[]): BackpropagationSnapshot {
    const output = this.predict(inputArray);
    const previousWeights = this.layers.map((layer) => layer.weights.clone());
    const layerStates = this.layers.map(() => ({
      neurons: [] as BackpropagationSnapshot["layers"][number]["neurons"],
    }));
    const connections: BackpropConnectionState[] = [];

    const prediction = output[0] ?? 0;
    const target = targetArray[0] ?? 0;
    const error = target - prediction;
    const mse = error * error;
    let downstreamDelta: Matrix | null = null;

    for (let layerIdx = this.layers.length - 1; layerIdx >= 0; layerIdx--) {
      const layer = this.layers[layerIdx];
      const activations = layer.outputs?.data.map((value) => value[0]) ?? [];
      const weightedSums = layer.weightedSums?.data.map((value) => value[0]) ?? [];
      const previousActivations = layer.inputs?.data.map((value) => value[0]) ?? [];
      const derivatives = activations.map((value) => layer.derivative(value));

      let upstreamSignals: number[];
      let deltas: number[];

      if (layerIdx === this.layers.length - 1) {
        upstreamSignals = activations.map((value, index) => (2 * (value - targetArray[index])) / targetArray.length);
        deltas = upstreamSignals.map((signal, index) => signal * derivatives[index]);
      } else {
        upstreamSignals = new Array(layer.weights.rows).fill(0);

        for (let neuronIndex = 0; neuronIndex < layer.weights.rows; neuronIndex++) {
          let sum = 0;
          for (let nextNeuron = 0; nextNeuron < previousWeights[layerIdx + 1].rows; nextNeuron++) {
            const nextWeight = previousWeights[layerIdx + 1].data[nextNeuron][neuronIndex];
            const nextDelta = downstreamDelta?.data[nextNeuron][0] ?? 0;
            sum += nextWeight * nextDelta;
          }
          upstreamSignals[neuronIndex] = sum;
        }

        // Each hidden neuron combines the downstream error signal with its own
        // local slope, which is the core idea behind backpropagation.
        deltas = upstreamSignals.map((signal, index) => signal * derivatives[index]);
      }

      layerStates[layerIdx] = {
        neurons: activations.map((activation, neuronIndex) => ({
          index: neuronIndex,
          bias: layer.biases.data[neuronIndex][0],
          weightedSum: weightedSums[neuronIndex],
          activation,
          activationDerivative: derivatives[neuronIndex],
          upstreamSignal: upstreamSignals[neuronIndex],
          delta: deltas[neuronIndex],
          biasGradient: deltas[neuronIndex],
          biasUpdate: -this.learningRate * deltas[neuronIndex],
          isInput: false,
          isOutput: layerIdx === this.layers.length - 1,
        })),
      };

      for (let toNeuron = 0; toNeuron < layer.weights.rows; toNeuron++) {
        for (let fromNeuron = 0; fromNeuron < layer.weights.cols; fromNeuron++) {
          const weight = layer.weights.data[toNeuron][fromNeuron];
          const sourceActivation = previousActivations[fromNeuron];
          const gradient = deltas[toNeuron] * sourceActivation;
          const update = -this.learningRate * gradient;

          connections.push({
            fromLayer: layerIdx,
            fromNeuron,
            toLayer: layerIdx + 1,
            toNeuron,
            weight,
            sourceActivation,
            targetDelta: deltas[toNeuron],
            gradient,
            update,
            newWeight: weight + update,
          });
        }
      }

      downstreamDelta = Matrix.fromArray(deltas);
    }

    const inputLayer = {
      layerIndex: 0,
      neurons: inputArray.map((value, index) => ({
        index,
        bias: 0,
        weightedSum: value,
        activation: value,
        activationDerivative: 1,
        upstreamSignal: 0,
        delta: 0,
        biasGradient: 0,
        biasUpdate: 0,
        isInput: true,
        isOutput: false,
      })),
    };

    return {
      input: [...inputArray],
      target: [...targetArray],
      output,
      learningRate: this.learningRate,
      loss: {
        prediction,
        target,
        error,
        mse,
        derivativeWrtPrediction: 2 * (prediction - target),
      },
      layers: [
        inputLayer,
        ...layerStates.map((layerState, index) => ({
          layerIndex: index + 1,
          neurons: layerState.neurons,
        })),
      ],
      connections,
    };
  }
}
