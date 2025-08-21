import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Minus, Layers, RotateCcw, Play, Pause } from 'lucide-react';

interface NetworkControlsProps {
  hiddenLayerCount: number;
  onAddLayer: () => void;
  onRemoveLayer: () => void;
  isTraining: boolean;
  onToggleTraining: () => void;
  onReset: () => void;
  currentEpoch: number;
  maxEpochs: number;
}

export default function NetworkControls({
  hiddenLayerCount,
  onAddLayer,
  onRemoveLayer,
  isTraining,
  onToggleTraining,
  onReset,
  currentEpoch,
  maxEpochs
}: NetworkControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Network Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Hidden Layers</div>
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
          <div className="text-xs text-muted-foreground mt-1">
            1-5 hidden layers allowed
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Training Progress</div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-neural-purple h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentEpoch / maxEpochs) * 100}%` }}
              />
            </div>
            <div className="text-xs font-mono min-w-[4rem] text-right">
              {currentEpoch}/{maxEpochs}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={onToggleTraining}
            disabled={currentEpoch >= maxEpochs}
            className="flex-1"
          >
            {isTraining ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {currentEpoch === 0 ? 'Start Training' : 'Resume'}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>More layers:</strong> Can learn complex patterns</p>
          <p><strong>Fewer layers:</strong> Simpler, faster training</p>
          <p><strong>Trade-off:</strong> Complexity vs. overfitting risk</p>
        </div>
      </CardContent>
    </Card>
  );
}