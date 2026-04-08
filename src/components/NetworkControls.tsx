import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Minus, Layers, RotateCcw, Play, Pause, Settings2 } from 'lucide-react';
import { Slider } from './ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { DatasetType } from '../lib/datasets';
import { ActivationType } from '../lib/neural-net';

interface NetworkControlsProps {
  hiddenLayerCount: number;
  onAddLayer: () => void;
  onRemoveLayer: () => void;
  isTraining: boolean;
  onToggleTraining: () => void;
  onReset: () => void;
  currentEpoch: number;
  maxEpochs: number;
  learningRate: number;
  onChangeLearningRate: (lr: number) => void;
  datasetType: DatasetType;
  onChangeDatasetType: (type: DatasetType) => void;
  activation: ActivationType;
  onChangeActivation: (activation: ActivationType) => void;
}

export default function NetworkControls({
  hiddenLayerCount,
  onAddLayer,
  onRemoveLayer,
  isTraining,
  onToggleTraining,
  onReset,
  currentEpoch,
  maxEpochs,
  learningRate,
  onChangeLearningRate,
  datasetType,
  onChangeDatasetType,
  activation,
  onChangeActivation
}: NetworkControlsProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          Hyperparameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
        
        <div className="space-y-4">
          {/* Dataset Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Dataset (Problem)</label>
            <Select value={datasetType} onValueChange={(v) => onChangeDatasetType(v as DatasetType)} disabled={isTraining}>
              <SelectTrigger>
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xor">XOR (Exclusive OR)</SelectItem>
                <SelectItem value="circle">Concentric Circles</SelectItem>
                <SelectItem value="gaussian">Two Gaussians</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Different problems require different network complexities.</p>
          </div>

          {/* Activation Function */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Activation Function</label>
            <Select value={activation} onValueChange={(v) => onChangeActivation(v as ActivationType)} disabled={isTraining}>
              <SelectTrigger>
                <SelectValue placeholder="Select activation function" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tanh">Tanh (Soft, mapped -1 to 1)</SelectItem>
                <SelectItem value="relu">ReLU (Rectified Linear Unit)</SelectItem>
                <SelectItem value="sigmoid">Sigmoid (Soft, mapped 0 to 1)</SelectItem>
                <SelectItem value="linear">Linear (No activation)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Defines how nodes "fire".</p>
          </div>

          {/* Learning Rate */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Learning Rate</label>
              <span className="text-xs font-mono">{learningRate.toFixed(3)}</span>
            </div>
            <Slider
              value={[learningRate]}
              onValueChange={([v]) => onChangeLearningRate(v)}
              max={0.5}
              step={0.005}
              disabled={isTraining}
            />
            <p className="text-xs text-muted-foreground">Higher = faster but unstable. Lower = slower but precise.</p>
          </div>

          {/* Architecture (Hidden Layers) */}
          <div className="space-y-1 pt-2 border-t">
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Architecture
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRemoveLayer}
                disabled={hiddenLayerCount <= 1 || isTraining}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="bg-muted px-3 py-1 rounded-md font-mono text-lg min-w-[3rem] text-center">
                {hiddenLayerCount}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddLayer}
                disabled={hiddenLayerCount >= 5 || isTraining}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex justify-between">
              <span>Hidden Layers</span>
              <span>(Max 5)</span>
            </div>
          </div>
        </div>

        {/* Training Controls */}
        <div className="mt-6 pt-4 border-t space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Epoch</span>
              <span className="font-mono">{currentEpoch} / {maxEpochs}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-neural-purple h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentEpoch / maxEpochs) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={onToggleTraining}
              disabled={currentEpoch >= maxEpochs}
              className="flex-1 font-bold"
            >
              {isTraining ? (
                <>
                  <Pause className="w-4 h-4 mr-2 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2 fill-current" /> {currentEpoch === 0 ? 'Train Model' : 'Resume'}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onReset} title="Reset Network and Epoch">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}