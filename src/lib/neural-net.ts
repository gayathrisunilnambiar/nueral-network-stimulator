export type ActivationType = 'relu' | 'sigmoid' | 'tanh' | 'linear';

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

  getWeights(): { weights: number[][]; biases: number[]; outputs: number[] }[] {
    return this.layers.map(layer => ({
      weights: layer.weights.data,
      biases: layer.biases.data.map(b => b[0]),
      outputs: layer.outputs ? layer.outputs.data.map(o => o[0]) : new Array(layer.weights.rows).fill(0)
    }));
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

    let currentErrors = outputError;

    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      const prev_inputs = layer.inputs!;

      const gradients = Matrix.map(layer.outputs!, val => layer.derivative(val));
      gradients.multiply(currentErrors);
      gradients.multiply(this.learningRate);

      const inputs_t = Matrix.transpose(prev_inputs);
      const weight_deltas = Matrix.multiply(gradients, inputs_t);

      layer.weights.add(weight_deltas);
      layer.biases.add(gradients);

      const weights_t = Matrix.transpose(layer.weights);
      currentErrors = Matrix.multiply(weights_t, currentErrors);
    }
    
    return loss;
  }
}
