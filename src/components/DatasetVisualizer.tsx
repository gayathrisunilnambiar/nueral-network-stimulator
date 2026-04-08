import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Target, Info } from 'lucide-react';
import { NeuralNetwork } from '../lib/neural-net';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import type { DataPoint } from '@/types/simulator';

interface DatasetVisualizerProps {
  dataset: DataPoint[];
  network: NeuralNetwork | null;
  currentEpoch: number; // Trigger re-draws when epoch updates
}

export default function DatasetVisualizer({ dataset, network, currentEpoch }: DatasetVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // The background is a prediction heatmap: each small tile shows what class the
    // network would assign at that location, which makes the boundary visible.
    if (network) {
      const resolution = 8;
      for (let x = 0; x < width; x += resolution) {
        for (let y = 0; y < height; y += resolution) {
          // coordinate maps from canvas to [-1, 1]
          const mappedX = (x / width) * 2 - 1;
          const mappedY = -((y / height) * 2 - 1); // Flip Y

          const pred = network.predict([mappedX, mappedY])[0];
          // Color based on prediction prob
          const prob = Math.max(0, Math.min(1, pred));
          const r = Math.floor(249 * (1 - prob) + 59 * prob);
          const g = Math.floor(115 * (1 - prob) + 130 * prob);
          const b = Math.floor(22  * (1 - prob) + 246 * prob);
          
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
          ctx.fillRect(x, y, resolution, resolution);
        }
      }
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    // Data points sit on top of the heatmap so students can compare the learned
    // regions with the actual labels the model is trying to separate.
    ctx.strokeStyle = "rgba(15, 23, 42, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    dataset.forEach(pt => {
      const x = ((pt.x + 1) / 2) * width;
      const y = ((-pt.y + 1) / 2) * height; // Flip Y back for rendering
      
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = pt.label === 1 ? '#3b82f6' : '#f97316'; // blue vs orange
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'white';
      ctx.stroke();
    });

  }, [dataset, network, currentEpoch]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Dataset & Decision Boundary
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">
                This area shows the data points the network is trying to classify.
                The background color represents what the neural network predicts 
                at that specific position in space (decision boundary).
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <div className="w-full max-w-[400px]">
          <canvas 
            ref={canvasRef}
            width={400}
            height={400}
            className="border rounded-md bg-white w-full max-w-[400px] aspect-square"
          />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Orange = class 0 region</span>
            <span>Blue = class 1 region</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
