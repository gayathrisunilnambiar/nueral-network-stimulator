import React, { useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Position,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NeuralNetwork as NetEngine } from '../lib/neural-net';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';

// Color interpolator for weights (-1 to 1) -> (red to blue)
const getWeightColor = (w: number) => {
  if (w < 0) {
    const intensity = Math.min(1, Math.abs(w));
    return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`; // Red
  } else {
    const intensity = Math.min(1, Math.abs(w));
    return `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`; // Blue
  }
};

const getWeightStrokeWidth = (w: number) => {
  return 1 + Math.min(4, Math.abs(w) * 2);
};

// Node component
const NeuronNode = ({ data }: { data: any }) => {
  const val = data.outputValue || 0; 
  const opacity = Math.min(1, Math.abs(val));
  const isPositive = val > 0;
  const color = isPositive ? `rgba(59, 130, 246, ${opacity})` : `rgba(239, 68, 68, ${opacity})`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="w-10 h-10 rounded-full border border-slate-300 shadow-sm flex items-center justify-center cursor-pointer overflow-hidden relative transition-transform hover:scale-110 bg-white">
          <div className="absolute inset-0 transition-colors duration-100" style={{ backgroundColor: color }}></div>
          {/* subtle inner shadow/ring to make it look like a technical indicator */}
          <div className="absolute inset-1 rounded-full border border-white/20"></div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-48 text-sm" side="top">
        <div className="space-y-2">
          <h4 className="font-semibold text-xs text-muted-foreground uppercase">{data.layerType} Neuron</h4>
          <div className="flex justify-between">
            <span>Activation:</span>
            <span className="font-mono">{val?.toFixed(3)}</span>
          </div>
          {data.layerType !== 'input' && (
            <div className="flex justify-between">
              <span>Bias:</span>
              <span className="font-mono">{data.bias?.toFixed(3)}</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const nodeTypes = { neuron: NeuronNode };

interface NeuralNetworkProps {
  networkEngine: NetEngine | null;
  architecture: number[];
  currentEpoch: number;
  onWeightChange: (layerIdx: number, fromNeuron: number, toNeuron: number, newWeight: number) => void;
}

export default function NeuralNetworkVis({ networkEngine, architecture, currentEpoch, onWeightChange }: NeuralNetworkProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const [selectedEdge, setSelectedEdge] = useState<{ id: string, w: number, layerIdx: number, from: number, to: number } | null>(null);

  useEffect(() => {
    if (!networkEngine) return;
    
    const engineWeights = networkEngine.getWeights();
    
    const layerSpacing = 200;
    const neuronSpacing = 70;
    
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    const maxNeurons = Math.max(...architecture);
    
    // Create Nodes
    for (let layerIdx = 0; layerIdx < architecture.length; layerIdx++) {
      const numNeurons = architecture[layerIdx];
      const yOffset = (maxNeurons - numNeurons) * neuronSpacing / 2;
      
      let layerType = 'hidden';
      if (layerIdx === 0) layerType = 'input';
      if (layerIdx === architecture.length - 1) layerType = 'output';

      let outputs: number[] = new Array(numNeurons).fill(0);
      let biases: number[] = new Array(numNeurons).fill(0);
      if (layerIdx > 0 && engineWeights[layerIdx - 1]) {
        outputs = engineWeights[layerIdx - 1].outputs || new Array(numNeurons).fill(0);
        biases = engineWeights[layerIdx - 1].biases || new Array(numNeurons).fill(0);
      }
      
      for (let i = 0; i < numNeurons; i++) {
        newNodes.push({
          id: `L${layerIdx}-N${i}`,
          type: 'neuron',
          position: { x: layerIdx * layerSpacing, y: i * neuronSpacing + yOffset },
          data: { 
            layerType, 
            outputValue: outputs[i],
            bias: layerIdx > 0 ? biases[i] : 0,
            nId: i,
            lId: layerIdx
          },
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
        });
      }
    }
    
    // Create Edges
    for (let layerIdx = 0; layerIdx < engineWeights.length; layerIdx++) {
      const wMatrix = engineWeights[layerIdx].weights; 
      const numFrom = architecture[layerIdx];
      const numTo = architecture[layerIdx + 1];
      
      for (let toN = 0; toN < numTo; toN++) {
        for (let fromN = 0; fromN < numFrom; fromN++) {
          const w = wMatrix[toN][fromN];
          const edgeId = `e-L${layerIdx}-N${fromN}-L${layerIdx+1}-N${toN}`;
          const isSelected = selectedEdge?.id === edgeId;

          newEdges.push({
            id: edgeId,
            source: `L${layerIdx}-N${fromN}`,
            target: `L${layerIdx+1}-N${toN}`,
            style: { 
              stroke: isSelected ? '#10b981' : getWeightColor(w), 
              strokeWidth: isSelected ? 4 : getWeightStrokeWidth(w),
              transition: 'stroke 0.1s ease, stroke-width 0.1s ease',
              zIndex: isSelected ? 10 : 0
            },
            animated: Math.abs(w) > 1.5,
            data: { w, layerIdx, fromN, toN }
          });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    
    if (selectedEdge) {
      const ew = engineWeights[selectedEdge.layerIdx].weights[selectedEdge.to][selectedEdge.from];
      if (ew !== selectedEdge.w) {
         setSelectedEdge(prev => prev ? { ...prev, w: ew } : prev);
      }
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkEngine, architecture, currentEpoch]);

  return (
    <div className="w-full h-[500px] relative bg-card rounded-lg border overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        onEdgeClick={(e, edge) => {
          setSelectedEdge({
            id: edge.id,
            w: edge.data.w,
            layerIdx: edge.data.layerIdx,
            from: edge.data.fromN,
            to: edge.data.toN
          });
        }}
        onPaneClick={() => setSelectedEdge(null)}
        onNodeClick={() => setSelectedEdge(null)}
      >
        <Background gap={12} size={1} color="#e2e8f0" />
        <Controls />
      </ReactFlow>
      
      {selectedEdge && (
        <div className="absolute top-4 right-4 z-10 w-64 p-4 bg-background border rounded-lg shadow-xl animate-in slide-in-from-right-4 fade-in">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold">Edit Connection Weight</h4>
            <Badge variant="outline" className="font-mono">{selectedEdge.w.toFixed(3)}</Badge>
          </div>
          <Slider
            value={[selectedEdge.w]}
            min={-5}
            max={5}
            step={0.01}
            onValueChange={([val]) => {
               setSelectedEdge(prev => prev ? { ...prev, w: val } : prev);
               onWeightChange(selectedEdge.layerIdx, selectedEdge.from, selectedEdge.to, val);
            }}
          />
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Adjusting this weight manually changes how much the source neuron influences the target neuron. Overriding it pauses training.
          </p>
        </div>
      )}

      {/* Layer Labels */}
      <div className="absolute bottom-4 left-4 right-4 z-10 text-sm text-muted-foreground bg-card/90 px-4 py-3 rounded-md border flex justify-between items-center text-xs shadow-sm">
          <span className="font-semibold uppercase tracking-wider text-neural-blue">Input Layer</span>
          <span className="font-semibold text-center flex-1 uppercase tracking-wider">
            Hidden Layers
          </span>
          <span className="font-semibold uppercase tracking-wider text-neural-cyan">Output Layer</span>
      </div>
    </div>
  );
}