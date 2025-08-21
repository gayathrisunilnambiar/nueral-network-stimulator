import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NeuralNetwork from '@/components/NeuralNetwork';
import NetworkControls from '@/components/NetworkControls';
import LossChart from '@/components/LossChart';
import ConceptCard from '@/components/ConceptCard';
import { Brain, Network, Zap, Target, Play, Share, TrendingDown } from 'lucide-react';

interface LossData {
  epoch: number;
  loss: number;
}

const Index = () => {
  const [hiddenLayerCount, setHiddenLayerCount] = useState(1);
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [lossData, setLossData] = useState<LossData[]>([]);
  const maxEpochs = 50;

  const handleAddLayer = useCallback(() => {
    if (hiddenLayerCount < 5) {
      setHiddenLayerCount(prev => prev + 1);
      // Reset training when architecture changes
      setCurrentEpoch(0);
      setLossData([]);
    }
  }, [hiddenLayerCount]);

  const handleRemoveLayer = useCallback(() => {
    if (hiddenLayerCount > 1) {
      setHiddenLayerCount(prev => prev - 1);
      // Reset training when architecture changes
      setCurrentEpoch(0);
      setLossData([]);
    }
  }, [hiddenLayerCount]);

  const handleToggleTraining = useCallback(() => {
    setIsTraining(prev => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsTraining(false);
    setCurrentEpoch(0);
    setLossData([]);
  }, []);

  const handleTrainingStep = useCallback((loss: number) => {
    setCurrentEpoch(prev => {
      const newEpoch = prev + 1;
      setLossData(prevData => [...prevData, { epoch: newEpoch, loss }]);
      
      if (newEpoch >= maxEpochs) {
        setIsTraining(false);
      }
      
      return newEpoch;
    });
  }, [maxEpochs]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Neural Networks Simplified',
        text: 'Learn how neural networks work with this interactive visualization!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };
    return (
      <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-neural-gradient opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Brain className="w-4 h-4 mr-2" />
              Interactive Learning
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-neural-blue to-neural-purple bg-clip-text text-transparent">
              Neural Networks
              <br />
              <span className="text-4xl md:text-6xl">Simplified</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover how artificial intelligence learns through this interactive visualization. 
              Watch data flow through layers of artificial neurons in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                <Play className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share className="w-5 h-5 mr-2" />
                Share This Tool
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Neural Network with Controls */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Interactive Neural Network Training</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Watch little people represent neurons as data flows through the network. 
              Add or remove hidden layers to see how network depth affects training loss.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Network Controls */}
            <div className="lg:col-span-1">
              <NetworkControls
                hiddenLayerCount={hiddenLayerCount}
                onAddLayer={handleAddLayer}
                onRemoveLayer={handleRemoveLayer}
                isTraining={isTraining}
                onToggleTraining={handleToggleTraining}
                onReset={handleReset}
                currentEpoch={currentEpoch}
                maxEpochs={maxEpochs}
              />
            </div>
            
            {/* Neural Network Visualization */}
            <div className="lg:col-span-2">
              <NeuralNetwork
                hiddenLayerCount={hiddenLayerCount}
                isTraining={isTraining}
                currentEpoch={currentEpoch}
                onTrainingStep={handleTrainingStep}
              />
            </div>
          </div>
          
          {/* Loss Visualization */}
          <div className="mt-8 max-w-4xl mx-auto">
            <LossChart data={lossData} hiddenLayerCount={hiddenLayerCount} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Understanding Network Depth and Loss</CardTitle>
                <CardDescription className="text-base">
                  Learn how the number of hidden layers affects neural network performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-neural-blue/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-neural-blue font-bold">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Shallow Networks</h3>
                    <p className="text-sm text-muted-foreground">
                      1-2 hidden layers. Learn simple patterns quickly but may struggle with complex relationships. 
                      Fast training, lower computational cost.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-neural-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-neural-purple font-bold">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Deep Networks</h3>
                    <p className="text-sm text-muted-foreground">
                      3+ hidden layers. Can learn complex hierarchical patterns and achieve lower loss. 
                      Slower training, higher computational requirements.
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-6 mt-8">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-primary" />
                    What You'll Observe
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong>Training Speed:</strong> More layers often reduce loss faster initially
                    </div>
                    <div>
                      <strong>Final Performance:</strong> Deeper networks can achieve lower final loss
                    </div>
                    <div>
                      <strong>Complexity Trade-off:</strong> Each layer adds computational overhead
                    </div>
                    <div>
                      <strong>Overfitting Risk:</strong> Very deep networks may memorize rather than generalize
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-card rounded-md border">
                    <p className="text-sm">
                      <strong>Try this:</strong> Train a network with 1 layer, then with 3-4 layers. 
                      Notice how the loss curve changes and how the deeper network can achieve lower loss values.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Concepts */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Understanding the Basics</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Neural networks are inspired by how our brain works. Here are the fundamental concepts you need to know.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <ConceptCard
              title="Network Depth"
              description="Impact of hidden layers"
              icon={TrendingDown}
              details={[
                "More layers = deeper networks",
                "Can learn more complex patterns",
                "May reduce training loss faster",
                "Risk of overfitting with too many"
              ]}
            />
            <ConceptCard
              title="Layers"
              description="Information processing stages"
              icon={Network}
              details={[
                "Input layer receives data",
                "Hidden layers transform data",
                "Output layer gives results",
                "Each layer learns different features"
              ]}
            />
            <ConceptCard
              title="Training Loss"
              description="How well the network learns"
              icon={Target}
              details={[
                "Measures prediction errors",
                "Should decrease over time",
                "Lower loss = better performance",
                "Plateaus when learning slows"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">
            Created to help beginners understand neural networks through interactive visualization
          </p>
          <Button variant="ghost" onClick={handleShare}>
            <Share className="w-4 h-4 mr-2" />
            Share this learning tool
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Index;