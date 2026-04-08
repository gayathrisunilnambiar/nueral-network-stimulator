import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NeuralNetworkVis from '@/components/NeuralNetwork';
import NetworkControls from '@/components/NetworkControls';
import LossChart from '@/components/LossChart';
import ConceptCard from '@/components/ConceptCard';
import DatasetVisualizer from '@/components/DatasetVisualizer';
import { Brain, Network, Target, Play, Share, TrendingDown } from 'lucide-react';
import { NeuralNetwork as NetEngine, ActivationType } from '@/lib/neural-net';
import { generateDataset, DatasetType, DataPoint } from '@/lib/datasets';

interface LossData {
  epoch: number;
  loss: number;
}

const Index = () => {
  const [hiddenLayerCount, setHiddenLayerCount] = useState(2);
  const [learningRate, setLearningRate] = useState(0.1);
  const [activation, setActivation] = useState<ActivationType>('tanh');
  const [datasetType, setDatasetType] = useState<DatasetType>('xor');
  
  const [dataset, setDataset] = useState<DataPoint[]>([]);
  const [network, setNetwork] = useState<NetEngine | null>(null);

  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [lossData, setLossData] = useState<LossData[]>([]);
  
  const maxEpochs = 500;
  
  // Use refs for training loop
  const networkRef = useRef<NetEngine | null>(null);
  const datasetRef = useRef<DataPoint[]>([]);
  const isTrainingRef = useRef(isTraining);
  const reqRef = useRef<number>();

  useEffect(() => { isTrainingRef.current = isTraining; }, [isTraining]);
  useEffect(() => { datasetRef.current = dataset; }, [dataset]);
  useEffect(() => { networkRef.current = network; }, [network]);

  const initNetwork = useCallback(() => {
    // 2 Inputs (x,y), hidden layers, 1 Output (binary prob)
    const arch = [2, ...Array(hiddenLayerCount).fill(4), 1];
    const net = new NetEngine(arch, activation);
    net.setLearningRate(learningRate);
    setNetwork(net);
    setCurrentEpoch(0);
    setLossData([]);
    setIsTraining(false);
  }, [hiddenLayerCount, activation, learningRate]);

  useEffect(() => {
    setDataset(generateDataset(datasetType, 200));
    initNetwork();
  }, [datasetType, initNetwork]);

  useEffect(() => {
    if (network) {
      network.setLearningRate(learningRate);
    }
  }, [learningRate, network]);

  const handleAddLayer = useCallback(() => {
    if (hiddenLayerCount < 5) setHiddenLayerCount(prev => prev + 1);
  }, [hiddenLayerCount]);

  const handleRemoveLayer = useCallback(() => {
    if (hiddenLayerCount > 1) setHiddenLayerCount(prev => prev - 1);
  }, [hiddenLayerCount]);

  // Training Loop
  useEffect(() => {
    let lastTime = 0;
    const loop = (time: number) => {
      if (isTrainingRef.current && networkRef.current && datasetRef.current.length > 0) {
        if (time - lastTime > 16) { // ~60fps updates
          const net = networkRef.current;
          const data = datasetRef.current;
          let epochLoss = 0;
          
          for (let i = 0; i < data.length; i++) {
             const d = data[i];
             epochLoss += net.train([d.x, d.y], [d.label]);
          }
          epochLoss /= data.length;

          setCurrentEpoch(prev => {
            const next = prev + 1;
            setLossData(ld => [...ld, { epoch: next, loss: epochLoss }]);
            if (next >= maxEpochs) setIsTraining(false);
            return next;
          });
          
          lastTime = time;
        }
      }
      reqRef.current = requestAnimationFrame(loop);
    };
    reqRef.current = requestAnimationFrame(loop);
    return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); };
  }, [maxEpochs]);

  const handleWeightChange = useCallback((layerIdx: number, fromNeuron: number, toNeuron: number, newWeight: number) => {
    if (network) {
      setIsTraining(false); // Pause training
      network.setLayerWeights(layerIdx, fromNeuron, toNeuron, newWeight);
      setCurrentEpoch(prev => prev); // trigger re-render
      // force visual update without changing epoch
      setNetwork(Object.assign(Object.create(Object.getPrototypeOf(network)), network)); 
    }
  }, [network]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-neural-gradient opacity-5"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Brain className="w-4 h-4 mr-2" />
              Interactive Learning Environment
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-neural-blue via-neural-purple to-neural-cyan bg-clip-text text-transparent pb-2">
              Neural Networks Inside Out
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore how Multi-Layer Perceptrons learn decision boundaries in real-time. 
              Adjust hyperparameters, observe the mathematics, and build your intuition for AI.
            </p>
          </div>
        </div>
      </section>

      {/* Main interactive section */}
      <section className="py-12 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
            
            {/* Left: Controls */}
            <div className="lg:col-span-1">
              <NetworkControls
                hiddenLayerCount={hiddenLayerCount}
                onAddLayer={handleAddLayer}
                onRemoveLayer={handleRemoveLayer}
                isTraining={isTraining}
                onToggleTraining={() => setIsTraining(!isTraining)}
                onReset={initNetwork}
                currentEpoch={currentEpoch}
                maxEpochs={maxEpochs}
                learningRate={learningRate}
                onChangeLearningRate={setLearningRate}
                datasetType={datasetType}
                onChangeDatasetType={setDatasetType}
                activation={activation}
                onChangeActivation={setActivation}
              />
            </div>
            
            {/* Middle: Neural Net Architecture */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <NeuralNetworkVis
                networkEngine={network}
                architecture={[2, ...Array(hiddenLayerCount).fill(4), 1]}
                currentEpoch={currentEpoch}
                onWeightChange={handleWeightChange}
              />
            </div>

            {/* Right: Visualization & Loss */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="h-[300px]">
                <DatasetVisualizer 
                  dataset={dataset}
                  network={network}
                  currentEpoch={currentEpoch}
                />
              </div>
              <div className="flex-1 bg-card rounded-lg border">
                <LossChart data={lossData} hiddenLayerCount={hiddenLayerCount} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Concept Explanations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Core AI Concepts Explained</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This interactive tool lets you directly manipulate the inner mechanisms of a neural network.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
            <ConceptCard
              title="Weights & Biases"
              description="The 'memory' of the network"
              icon={Network}
              details={[
                "Click on any connecting line to see or edit its Weight.",
                "Red lines signify negative weights, Blue signify positive.",
                "Thicker lines mean stronger connections (higher absolute value).",
                "Hover over neurons to see their Bias and Activation output."
              ]}
            />
            <ConceptCard
              title="Hyperparameters"
              description="Controlling the training process"
              icon={TrendingDown}
              details={[
                "Learning Rate acts as the 'step size' during backpropagation.",
                "A too-high learning rate causes unstable, chaotic learning.",
                "Activation (e.g., ReLU, Tanh) allows the network to learn non-linear decision boundaries like circles.",
              ]}
            />
            <ConceptCard
              title="Decision Boundaries"
              description="How the AI classifies data"
              icon={Target}
              details={[
                "The heatmap in the top right shows what the network predicts across the 2D space.",
                "Orange represents 0 (Negative), Blue represents 1 (Positive).",
                "As training progresses, watch the network map bend and warp to segregate the points."
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;