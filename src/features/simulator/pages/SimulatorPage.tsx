import { ArrowRight, Brain, Network, Target, TrendingDown } from "lucide-react";

import ConceptCard from "@/components/ConceptCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  BackpropagationVisualizer,
  DatasetVisualizer,
  ForwardPropagationVisualizer,
  LearningJourney,
  LossChart,
  NetworkControls,
  PredictionInspector,
  TrainingStatusCard,
} from "@/features/simulator/components";
import { useSimulator } from "@/features/simulator/hooks/useSimulator";
import { DATASET_INFO } from "@/features/simulator/lib/datasets";

export default function SimulatorPage() {
  const simulator = useSimulator();
  const datasetInfo = DATASET_INFO[simulator.datasetType];
  const focusPoint = simulator.predictionSamples[0]?.point ?? simulator.dataset[0];
  const focusInput = focusPoint ? [focusPoint.x, focusPoint.y] : [0, 0];
  const focusTarget = focusPoint?.label ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-neural-gradient opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--neural-cyan)/0.18),transparent_35%)]" />
        <div className="container relative z-10 mx-auto px-4 py-16">
          <div className="mx-auto max-w-5xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Brain className="mr-2 h-4 w-4" />
              Educational Neural Network Simulator
            </Badge>
            <h1 className="bg-gradient-to-r from-neural-blue via-white to-neural-cyan bg-clip-text pb-2 text-4xl font-bold text-transparent md:text-6xl">
              Neural Networks Inside Out
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              A beginner-friendly playground for second-year engineering students to see how an MLP
              learns from 2D data, one epoch at a time.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-3">
            <Card className="border-white/10 bg-card/80">
              <CardHeader>
                <CardTitle className="text-lg">1. Problem Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Choose a dataset, activation function, learning rate, and compact architecture.</p>
                <p className="text-foreground">{datasetInfo.intuition}</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-card/80">
              <CardHeader>
                <CardTitle className="text-lg">2. Training Engine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>A pure frontend TypeScript MLP performs forward pass, loss computation, and backpropagation.</p>
                <div className="flex items-center gap-2 text-foreground">
                  <span>Dataset</span>
                  <ArrowRight className="h-4 w-4 text-neural-cyan" />
                  <span>Network</span>
                  <ArrowRight className="h-4 w-4 text-neural-cyan" />
                  <span>Boundary</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-card/80">
              <CardHeader>
                <CardTitle className="text-lg">3. Visual Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Every change updates the network graph, prediction map, loss curve, and sample outputs.</p>
                <p className="text-foreground">This makes the math visible instead of abstract.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-muted/20 py-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <NetworkControls
                activation={simulator.activation}
                architecture={simulator.architecture}
                batchSize={simulator.batchSize}
                currentEpoch={simulator.currentEpoch}
                datasetType={simulator.datasetType}
                hiddenLayerCount={simulator.hiddenLayerCount}
                isTraining={simulator.isTraining}
                learningRate={simulator.learningRate}
                maxEpochs={simulator.maxEpochs}
                neuronsPerLayer={simulator.neuronsPerLayer}
                onChangeActivation={simulator.setActivation}
                onChangeBatchSize={simulator.setBatchSize}
                onChangeDatasetType={simulator.setDatasetType}
                onChangeHiddenLayerCount={simulator.setHiddenLayerCount}
                onChangeLearningRate={simulator.setLearningRate}
                onChangeMaxEpochs={simulator.setMaxEpochs}
                onChangeNeuronsPerLayer={simulator.setNeuronsPerLayer}
                onRegenerateDataset={simulator.regenerateDataset}
                onReset={simulator.resetSimulation}
                onStepEpoch={simulator.stepEpoch}
                onToggleTraining={simulator.toggleTraining}
              />
            </div>

            <div className="flex flex-col gap-6 xl:col-span-8">
              <TrainingStatusCard
                accuracy={simulator.accuracy}
                architecture={simulator.architecture}
                currentEpoch={simulator.currentEpoch}
                currentLoss={simulator.currentLoss}
                datasetSummary={simulator.datasetSummary}
                insight={simulator.insight}
                isTraining={simulator.isTraining}
                maxEpochs={simulator.maxEpochs}
                trainingPhase={simulator.trainingPhase}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <DatasetVisualizer
                currentEpoch={simulator.currentEpoch + simulator.networkVersion}
                dataset={simulator.dataset}
                network={simulator.network}
              />
            </div>
            <div className="xl:col-span-4">
              <LossChart data={simulator.lossHistory} hiddenLayerCount={simulator.hiddenLayerCount} />
            </div>
            <div className="xl:col-span-4">
              <PredictionInspector samples={simulator.predictionSamples} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto space-y-6 px-4">
          <ForwardPropagationVisualizer
            inputVector={focusInput}
            networkEngine={simulator.network}
            version={simulator.currentEpoch + simulator.networkVersion}
          />

          <BackpropagationVisualizer
            inputVector={focusInput}
            networkEngine={simulator.network}
            targetValue={focusTarget}
            version={simulator.currentEpoch + simulator.networkVersion}
          />

          <LearningJourney activePhase={simulator.trainingPhase} />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ConceptCard
              title="Weights & Biases"
              description="The adjustable memory of the model"
              icon={Network}
              details={[
                "Weights control how strongly one signal influences the next layer.",
                "Biases shift neuron responses so the network can move boundaries, not just rotate them.",
                "As training runs, these values keep changing to reduce prediction error.",
              ]}
            />
            <ConceptCard
              title="Hyperparameters"
              description="Knobs that shape learning"
              icon={TrendingDown}
              details={[
                "Learning rate controls the size of each correction during backpropagation.",
                "More hidden layers or neurons increase expressive power but can make learning harder to reason about.",
                "Activation functions decide whether the network can bend space into non-linear boundaries.",
              ]}
            />
            <ConceptCard
              title="Decision Boundary"
              description="The network's map of the plane"
              icon={Target}
              details={[
                "The heatmap shows what the output neuron predicts at every location in 2D space.",
                "Watching the colors change after each epoch helps students see learning as geometry.",
                "Difficult datasets produce curved or fragmented boundaries until training stabilizes.",
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
