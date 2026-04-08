## Neural Network Simulator

An educational React + TypeScript simulator for understanding how a small multi-layer perceptron learns 2D classification problems.

### Architecture

- `pages/Index.tsx`: Composes the learning experience and keeps the page focused on layout.
- `hooks/useSimulator.ts`: Owns simulator state, training flow, dataset resets, and derived teaching metrics.
- `lib/neural-net.ts`: Implements a small neural network engine with forward pass, backpropagation, prediction, and editable weights.
- `lib/datasets.ts`: Generates beginner-friendly synthetic datasets and exposes dataset metadata.
- `components/*`: Render controls, network structure, decision boundary, loss chart, and teaching panels.

### Data Flow

1. The user changes dataset or hyperparameters in `NetworkControls`.
2. `useSimulator` rebuilds the network or regenerates data when needed.
3. The training loop runs epochs with the TypeScript MLP in `lib/neural-net.ts`.
4. Updated network state is rendered in the network graph, decision boundary canvas, loss chart, and sample prediction cards.
5. Explanatory cards translate each visual change into beginner-friendly language.

### Folder Structure

```text
src/
  components/
    simulator/
      LearningJourney.tsx
      PredictionInspector.tsx
      TrainingStatusCard.tsx
    ConceptCard.tsx
    DatasetVisualizer.tsx
    LossChart.tsx
    NetworkControls.tsx
    NeuralNetwork.tsx
  hooks/
    useSimulator.ts
  lib/
    datasets.ts
    neural-net.ts
    simulator-content.ts
  pages/
    Index.tsx
  types/
    simulator.ts
```

### Key Files

- `src/hooks/useSimulator.ts`: Main orchestration layer for training, stepping, and metric updates.
- `src/lib/neural-net.ts`: Core math and backpropagation implementation.
- `src/components/NeuralNetwork.tsx`: Interactive architecture view with editable connection weights.
- `src/components/DatasetVisualizer.tsx`: Canvas-based decision boundary renderer.
- `src/components/simulator/TrainingStatusCard.tsx`: High-level learning status and teaching notes.

### Run

```bash
npm install
npm run dev
```
