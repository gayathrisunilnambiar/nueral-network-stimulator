import React from "react";
import {
  AlertTriangle,
  Layers,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Settings2,
  SkipForward,
} from "lucide-react";

import { ACTIVATION_INFO } from "@/lib/simulator-content";
import { DATASET_INFO } from "@/lib/datasets";
import type { ActivationType } from "@/lib/neural-net";
import type { DatasetType } from "@/types/simulator";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface NetworkControlsProps {
  architecture: number[];
  batchSize: number;
  hiddenLayerCount: number;
  neuronsPerLayer: number;
  isTraining: boolean;
  onToggleTraining: () => void;
  onReset: () => void;
  onRegenerateDataset: () => void;
  onStepEpoch: () => void;
  currentEpoch: number;
  maxEpochs: number;
  learningRate: number;
  onChangeBatchSize: (batchSize: number) => void;
  onChangeLearningRate: (lr: number) => void;
  onChangeHiddenLayerCount: (count: number) => void;
  onChangeMaxEpochs: (epochs: number) => void;
  onChangeNeuronsPerLayer: (count: number) => void;
  datasetType: DatasetType;
  onChangeDatasetType: (type: DatasetType) => void;
  activation: ActivationType;
  onChangeActivation: (activation: ActivationType) => void;
}

export default function NetworkControls({
  architecture,
  batchSize,
  hiddenLayerCount,
  neuronsPerLayer,
  isTraining,
  onToggleTraining,
  onReset,
  onRegenerateDataset,
  onStepEpoch,
  currentEpoch,
  maxEpochs,
  learningRate,
  onChangeBatchSize,
  onChangeLearningRate,
  onChangeHiddenLayerCount,
  onChangeMaxEpochs,
  onChangeNeuronsPerLayer,
  datasetType,
  onChangeDatasetType,
  activation,
  onChangeActivation
}: NetworkControlsProps) {
  const datasetInfo = DATASET_INFO[datasetType];
  const activationInfo = ACTIVATION_INFO[activation];
  const progressPercent = Math.min(100, (currentEpoch / Math.max(1, maxEpochs)) * 100);
  const warnings = [
    learningRate > 0.2
      ? "High learning rate: training may diverge or make the boundary jump chaotically."
      : null,
    maxEpochs < 80
      ? "Too few epochs: the model may stop early and underfit the dataset."
      : null,
  ].filter(Boolean) as string[];

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
          <div className="space-y-1">
            <label className="text-sm font-medium">Dataset (Problem)</label>
            <Select value={datasetType} onValueChange={(v) => onChangeDatasetType(v as DatasetType)} disabled={isTraining}>
              <SelectTrigger>
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xor">XOR</SelectItem>
                <SelectItem value="linear">Linearly Separable</SelectItem>
                <SelectItem value="spiral">Spiral</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">{datasetInfo.description}</p>
            <p className="text-xs text-neural-cyan">{datasetInfo.challenge}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Activation Function</label>
            <Select value={activation} onValueChange={(v) => onChangeActivation(v as ActivationType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select activation function" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tanh">Tanh (Soft, mapped -1 to 1)</SelectItem>
                <SelectItem value="relu">ReLU (Rectified Linear Unit)</SelectItem>
                <SelectItem value="sigmoid">Sigmoid (Soft, mapped 0 to 1)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">{activationInfo.description}</p>
          </div>

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
            />
            <p className="text-xs text-muted-foreground">Higher = faster but unstable. Lower = slower but precise.</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Epoch Limit</label>
              <span className="text-xs font-mono">{maxEpochs}</span>
            </div>
            <Slider
              value={[maxEpochs]}
              onValueChange={([value]) => onChangeMaxEpochs(value)}
              min={20}
              max={400}
              step={20}
            />
            <p className="text-xs text-muted-foreground">Controls how long training is allowed to continue before it stops.</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Batch Size</label>
              <span className="text-xs font-mono">{batchSize}</span>
            </div>
            <Slider
              value={[batchSize]}
              onValueChange={([value]) => onChangeBatchSize(value)}
              min={4}
              max={120}
              step={4}
            />
            <p className="text-xs text-muted-foreground">Small batches are noisy but responsive. Larger batches are steadier but slower to react.</p>
          </div>

          <div className="space-y-1 pt-2 border-t">
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Architecture
            </div>
            <div className="space-y-3 rounded-lg border border-white/10 bg-background/40 p-3">
              <div>
                <div className="flex justify-between text-sm">
                  <label>Hidden layers</label>
                  <span className="font-mono">{hiddenLayerCount}</span>
                </div>
                <Slider
                  value={[hiddenLayerCount]}
                  onValueChange={([value]) => onChangeHiddenLayerCount(value)}
                  min={1}
                  max={4}
                  step={1}
                  disabled={isTraining}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <label>Neurons per hidden layer</label>
                  <span className="font-mono">{neuronsPerLayer}</span>
                </div>
                <Slider
                  value={[neuronsPerLayer]}
                  onValueChange={([value]) => onChangeNeuronsPerLayer(value)}
                  min={2}
                  max={8}
                  step={1}
                  disabled={isTraining}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex justify-between">
              <span className="font-mono">{architecture.join(" -> ")}</span>
              <span>Keep it small for clarity</span>
            </div>
          </div>

          {warnings.length > 0 ? (
            <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                <AlertTriangle className="h-3.5 w-3.5" />
                Training Warnings
              </div>
              {warnings.map((warning) => (
                <p key={warning} className="text-xs leading-relaxed text-amber-100">
                  {warning}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6 pt-4 border-t space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Epoch</span>
              <span className="font-mono">{currentEpoch} / {maxEpochs}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-neural-purple h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={onToggleTraining}
              disabled={currentEpoch >= maxEpochs}
              className="font-bold"
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
            <Button variant="outline" onClick={onStepEpoch} disabled={currentEpoch >= maxEpochs || isTraining}>
              <SkipForward className="w-4 h-4 mr-2" /> Step
            </Button>
            <Button variant="outline" onClick={onRegenerateDataset} disabled={isTraining}>
              <RefreshCw className="w-4 h-4 mr-2" /> New Data
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
