import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Define node types
const NeuronNode = ({ data }: { data: { label: string; active: boolean; layerType: string } }) => {
  const getNodeStyle = () => {
    const baseClasses = `
      w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl
      transition-all duration-300
    `;
    
    if (data.active) {
      switch (data.layerType) {
        case 'input':
          return `${baseClasses} bg-neural-blue border-neural-blue text-background animate-pulse-neuron`;
        case 'hidden':
          return `${baseClasses} bg-neural-purple border-neural-purple text-background animate-pulse-neuron`;
        case 'output':
          return `${baseClasses} bg-neural-cyan border-neural-cyan text-background animate-pulse-neuron`;
        default:
          return `${baseClasses} bg-neuron-active border-neuron-active text-background animate-pulse-neuron`;
      }
    }
    
    return `${baseClasses} bg-neuron-inactive border-neuron-inactive text-muted-foreground`;
  };

  return (
    <div className={getNodeStyle()}>
      🧍
    </div>
  );
};

const nodeTypes = {
  neuron: NeuronNode,
};

interface NeuralNetworkProps {
  hiddenLayerCount: number;
  isTraining: boolean;
  currentEpoch: number;
  onTrainingStep: (loss: number) => void;
}

export default function NeuralNetwork({ 
  hiddenLayerCount, 
  isTraining, 
  currentEpoch,
  onTrainingStep 
}: NeuralNetworkProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Generate network structure based on hidden layer count
  const networkStructure = useMemo(() => {
    const inputCount = 3;
    const hiddenNeuronCount = 4;
    const outputCount = 2;
    const layerSpacing = 200;
    const neuronSpacing = 80;

    // Calculate total width for centering
    const totalLayers = hiddenLayerCount + 2; // input + hidden + output
    const totalWidth = totalLayers * layerSpacing;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Input layer
    for (let i = 0; i < inputCount; i++) {
      newNodes.push({
        id: `i${i}`,
        type: 'neuron',
        position: { 
          x: 0, 
          y: i * neuronSpacing + (hiddenNeuronCount - inputCount) * neuronSpacing / 2 
        },
        data: { label: '', active: false, layerType: 'input' }
      });
    }

    // Hidden layers
    for (let layer = 0; layer < hiddenLayerCount; layer++) {
      for (let i = 0; i < hiddenNeuronCount; i++) {
        newNodes.push({
          id: `h${layer}-${i}`,
          type: 'neuron',
          position: { 
            x: (layer + 1) * layerSpacing, 
            y: i * neuronSpacing 
          },
          data: { label: '', active: false, layerType: 'hidden' }
        });
      }
    }

    // Output layer
    for (let i = 0; i < outputCount; i++) {
      newNodes.push({
        id: `o${i}`,
        type: 'neuron',
        position: { 
          x: (hiddenLayerCount + 1) * layerSpacing, 
          y: i * neuronSpacing + (hiddenNeuronCount - outputCount) * neuronSpacing / 2 
        },
        data: { label: '', active: false, layerType: 'output' }
      });
    }

    // Create connections
    // Input to first hidden layer
    for (let i = 0; i < inputCount; i++) {
      for (let j = 0; j < hiddenNeuronCount; j++) {
        newEdges.push({
          id: `i${i}-h0-${j}`,
          source: `i${i}`,
          target: `h0-${j}`,
          style: { stroke: 'hsl(var(--connection-inactive))', strokeWidth: 1 }
        });
      }
    }

    // Hidden layer to hidden layer connections
    for (let layer = 0; layer < hiddenLayerCount - 1; layer++) {
      for (let i = 0; i < hiddenNeuronCount; i++) {
        for (let j = 0; j < hiddenNeuronCount; j++) {
          newEdges.push({
            id: `h${layer}-${i}-h${layer + 1}-${j}`,
            source: `h${layer}-${i}`,
            target: `h${layer + 1}-${j}`,
            style: { stroke: 'hsl(var(--connection-inactive))', strokeWidth: 1 }
          });
        }
      }
    }

    // Last hidden layer to output
    for (let i = 0; i < hiddenNeuronCount; i++) {
      for (let j = 0; j < outputCount; j++) {
        newEdges.push({
          id: `h${hiddenLayerCount - 1}-${i}-o${j}`,
          source: `h${hiddenLayerCount - 1}-${i}`,
          target: `o${j}`,
          style: { stroke: 'hsl(var(--connection-inactive))', strokeWidth: 1 }
        });
      }
    }

    return { nodes: newNodes, edges: newEdges };
  }, [hiddenLayerCount]);

  // Reset network when structure changes
  useEffect(() => {
    setNodes(networkStructure.nodes);
    setEdges(networkStructure.edges);
    setCurrentStep(0);
  }, [networkStructure, setNodes, setEdges]);

  // Simulate forward pass with loss calculation
  const simulateTrainingStep = useCallback(() => {
    const steps = [
      // Step 1: Activate input layer
      () => {
        setNodes(nodes => nodes.map(node => ({
          ...node,
          data: { ...node.data, active: node.id.startsWith('i') }
        })));
        setEdges(edges => edges.map(edge => ({
          ...edge,
          style: { stroke: 'hsl(var(--connection-inactive))', strokeWidth: 1 }
        })));
      },
      // Step 2-n: Activate each hidden layer progressively
      ...Array.from({ length: hiddenLayerCount }, (_, layerIndex) => () => {
        // Activate connections to this layer
        setEdges(edges => edges.map(edge => {
          const isConnectionToCurrentLayer = edge.target.startsWith(`h${layerIndex}-`);
          return {
            ...edge,
            style: { 
              stroke: isConnectionToCurrentLayer 
                ? 'hsl(var(--connection-active))' 
                : edge.style?.stroke || 'hsl(var(--connection-inactive))',
              strokeWidth: isConnectionToCurrentLayer ? 2 : 1
            }
          };
        }));

        // Activate neurons in this layer
        setNodes(nodes => nodes.map(node => {
          const shouldActivate = node.id.startsWith('i') || 
                                node.id.startsWith(`h${layerIndex}-`) ||
                                (layerIndex > 0 && node.id.startsWith('h') && 
                                 parseInt(node.id.split('-')[0].substring(1)) < layerIndex);
          return {
            ...node,
            data: { ...node.data, active: shouldActivate }
          };
        }));
      }),
      // Final step: Activate output layer and calculate loss
      () => {
        setEdges(edges => edges.map(edge => {
          const isOutputConnection = edge.target.startsWith('o');
          return {
            ...edge,
            style: { 
              stroke: isOutputConnection 
                ? 'hsl(var(--connection-active))' 
                : 'hsl(var(--connection-inactive))',
              strokeWidth: isOutputConnection ? 2 : 1
            }
          };
        }));

        setNodes(nodes => nodes.map(node => ({
          ...node,
          data: { ...node.data, active: true }
        })));

        // Calculate loss (simulated - decreases with more layers and epochs)
        const baseLoss = 1.0;
        const layerReduction = Math.log(hiddenLayerCount + 1) * 0.1;
        const epochReduction = currentEpoch * 0.02;
        const randomNoise = (Math.random() - 0.5) * 0.1;
        const loss = Math.max(0.001, baseLoss - layerReduction - epochReduction + randomNoise);
        
        onTrainingStep(loss);
      }
    ];

    if (currentStep < steps.length) {
      steps[currentStep]();
      setCurrentStep(prev => prev + 1);
    } else {
      setCurrentStep(0);
    }
  }, [currentStep, hiddenLayerCount, currentEpoch, onTrainingStep, setNodes, setEdges]);

  // Handle training animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTraining) {
      interval = setInterval(() => {
        simulateTrainingStep();
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isTraining, simulateTrainingStep]);

  // Reset when not training
  useEffect(() => {
    if (!isTraining && currentStep === 0) {
      setNodes(networkStructure.nodes);
      setEdges(networkStructure.edges);
    }
  }, [isTraining, currentStep, networkStructure, setNodes, setEdges]);

  return (
    <div className="w-full h-[500px] relative bg-card rounded-lg border overflow-hidden">
      <div className="absolute top-4 right-4 z-10 text-sm text-muted-foreground bg-card/90 px-3 py-2 rounded-md border">
        {hiddenLayerCount} Hidden Layer{hiddenLayerCount !== 1 ? 's' : ''} • Epoch {currentEpoch}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background />
        <Controls />
      </ReactFlow>
      
      <div className="absolute bottom-4 left-4 right-4 z-10 text-sm text-muted-foreground bg-card/90 px-4 py-3 rounded-md border">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold">Input Layer</span>
          <span className="font-semibold">
            Hidden Layer{hiddenLayerCount > 1 ? 's' : ''} ({hiddenLayerCount})
          </span>
          <span className="font-semibold">Output Layer</span>
        </div>
      </div>
    </div>
  );
}