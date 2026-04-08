import type { ActivationType } from "@/lib/neural-net";
import type { ActivationInfo, TrainingPhase } from "@/types/simulator";

export const ACTIVATION_INFO: Record<ActivationType, ActivationInfo> = {
  tanh: {
    key: "tanh",
    title: "Tanh",
    description: "Outputs between -1 and 1, so hidden neurons can express positive and negative influence.",
    bestFor: "Balanced hidden-layer behaviour on centered datasets like XOR.",
  },
  relu: {
    key: "relu",
    title: "ReLU",
    description: "Keeps positive values and clips negative ones to zero, which makes activations sparse.",
    bestFor: "Fast experimentation when students want to see simple piecewise boundaries.",
  },
  sigmoid: {
    key: "sigmoid",
    title: "Sigmoid",
    description: "Maps values into 0 to 1 and feels intuitive when thinking in probabilities.",
    bestFor: "Probability-like activations, but hidden layers can saturate on harder problems.",
  },
  linear: {
    key: "linear",
    title: "Linear",
    description: "Does not bend the data at all, so the whole network behaves like stacked lines.",
    bestFor: "Demonstrating why non-linear activations are necessary.",
  },
};

export const TRAINING_PHASE_CONTENT: Record<
  TrainingPhase,
  { title: string; description: string }
> = {
  idle: {
    title: "Ready to Learn",
    description: "The simulator is waiting for you to train, step once, or change the problem setup.",
  },
  "forward-pass": {
    title: "Forward Pass",
    description: "Inputs move left to right through the network, and each neuron computes its activation.",
  },
  "loss-check": {
    title: "Loss Check",
    description: "The model compares its prediction to the true label and measures how wrong it was.",
  },
  backpropagation: {
    title: "Backpropagation",
    description: "Errors move backward so each weight learns how it contributed to the mistake.",
  },
  "decision-boundary": {
    title: "Decision Boundary Update",
    description: "The colored map changes after the weights update, showing the model's new belief.",
  },
};
