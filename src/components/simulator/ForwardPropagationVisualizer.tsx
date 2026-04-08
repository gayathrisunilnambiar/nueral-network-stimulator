import { Pause, Play, Sigma, Waves } from "lucide-react";
import {
  useEffect,
  useMemo,
} from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlaybackClock } from "@/hooks/usePlaybackClock";
import { NeuralNetwork } from "@/lib/neural-net";
import {
  drawLayerTitles,
  easeInOut,
  getLayerPositions,
  resizeCanvasToDisplaySize,
  roundRect,
  type CanvasPoint,
} from "@/lib/network-visualization";
import type {
  ForwardPassConnectionState,
  ForwardPassLayerState,
  ForwardPassSnapshot,
} from "@/types/forward-pass";

interface ForwardPropagationVisualizerProps {
  inputVector: number[];
  networkEngine: NeuralNetwork | null;
  version: number;
}

const BASE_LAYER_DURATION = 1400;

export default function ForwardPropagationVisualizer({
  inputVector,
  networkEngine,
  version,
}: ForwardPropagationVisualizerProps) {
  const { animationTime, canvasRef, containerRef, isPlaying, setIsPlaying, size } =
    usePlaybackClock({
      resetToken: `${inputVector.join(",")}:${version}`,
    });

  const snapshot = useMemo<ForwardPassSnapshot | null>(() => {
    if (!networkEngine || inputVector.length === 0) {
      return null;
    }

    // `version` lets the visualizer re-trace after in-place weight edits.
    void version;
    return networkEngine.traceForwardPass(inputVector);
  }, [inputVector, networkEngine, version]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context || !snapshot) {
      return;
    }

    resizeCanvasToDisplaySize(canvas, context, size.width, size.height);

    drawForwardPass({
      context,
      size,
      snapshot,
      animationTime,
      isPlaying,
    });
  }, [animationTime, canvasRef, isPlaying, size, snapshot]);

  const visibleLayerIndex = useMemo(() => {
    if (!snapshot) {
      return 0;
    }

    const transitionCount = Math.max(1, snapshot.layers.length - 1);
    const cycleDuration = transitionCount * BASE_LAYER_DURATION;
    const normalizedTime = animationTime % cycleDuration;

    return Math.floor(normalizedTime / BASE_LAYER_DURATION);
  }, [animationTime, snapshot]);

  const activeLayer = snapshot
    ? snapshot.layers[Math.min(visibleLayerIndex + 1, snapshot.layers.length - 1)]
    : null;

  return (
    <Card className="border-white/10 bg-card/90">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Waves className="h-5 w-5 text-neural-cyan" />
            Forward Propagation
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Signals animate from the input layer to the output layer, showing each neuron&apos;s weighted sum and activation.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPlaying((value) => !value)}
        >
          {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border border-white/10 bg-background/40 p-4 md:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Input Vector</div>
            <div className="mt-2 font-mono text-sm text-foreground">
              [{inputVector.map((value) => value.toFixed(2)).join(", ")}]
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Animated Layer</div>
            <div className="mt-2 text-sm text-foreground">
              {visibleLayerIndex + 1} / {Math.max(1, (snapshot?.layers.length ?? 1) - 1)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current Output</div>
            <div className="mt-2 font-mono text-sm text-foreground">
              {snapshot ? snapshot.output.map((value) => value.toFixed(3)).join(", ") : "--"}
            </div>
          </div>
        </div>

        <div ref={containerRef} className="w-full">
          <canvas ref={canvasRef} className="w-full rounded-xl border border-white/10 bg-[#07111f]" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-background/40 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Visual Encoding</div>
            <p className="mt-2 text-sm text-foreground">
              Dark-to-bright node fill shows activation magnitude, and thicker edges represent stronger weights.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-background/40 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Sigma className="h-3.5 w-3.5" />
              Active Neuron Values
            </div>
            <p className="mt-2 text-sm text-foreground">
              {activeLayer
                ? activeLayer.neurons
                    .map(
                      (neuron, index) =>
                        `N${index}: z=${neuron.weightedSum.toFixed(2)}, a=${neuron.activation.toFixed(2)}`,
                    )
                    .join(" | ")
                : "Waiting for a network snapshot."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function drawForwardPass({
  context,
  size,
  snapshot,
  animationTime,
  isPlaying,
}: {
  context: CanvasRenderingContext2D;
  size: { width: number; height: number };
  snapshot: ForwardPassSnapshot;
  animationTime: number;
  isPlaying: boolean;
}) {
  context.clearRect(0, 0, size.width, size.height);
  drawBackground(context, size.width, size.height);

  const marginX = 88;
  const marginY = 76;
    const layout = getLayerPositions(snapshot.layers, size.width, size.height, marginX, marginY);
  const transitionCount = Math.max(1, snapshot.layers.length - 1);
  const cycleDuration = transitionCount * BASE_LAYER_DURATION;
  const normalizedTime = animationTime % cycleDuration;
  const activeLayerIndex = Math.floor(normalizedTime / BASE_LAYER_DURATION);
  const layerProgress = (normalizedTime % BASE_LAYER_DURATION) / BASE_LAYER_DURATION;

  snapshot.connections.forEach((connection) => {
    const from = layout[connection.fromLayer][connection.fromNeuron];
    const to = layout[connection.toLayer][connection.toNeuron];
    const isActiveConnection = connection.fromLayer === activeLayerIndex;

    drawConnection(context, from, to, connection, isActiveConnection);

    if (isPlaying && isActiveConnection) {
      drawSignalParticle(context, from, to, connection, layerProgress);
    }
  });

  snapshot.layers.forEach((layer, layerIndex) => {
    layer.neurons.forEach((neuron, neuronIndex) => {
      drawNeuron(context, layout[layerIndex][neuronIndex], neuron.weightedSum, neuron.activation, neuron.isInput);
      drawNeuronLabel(context, layout[layerIndex][neuronIndex], neuron, layerIndex);
    });
  });

  drawLayerTitles(context, snapshot.layers, layout);
}

function drawBackground(context: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#07111f");
  gradient.addColorStop(1, "#0d1b2f");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function getLayerPositions(
  layers: ForwardPassLayerState[],
  width: number,
  height: number,
  marginX: number,
  marginY: number,
) {
  const layerSpacing = layers.length === 1 ? 0 : (width - marginX * 2) / (layers.length - 1);

  return layers.map((layer, layerIndex) => {
    const neuronSpacing =
      layer.neurons.length === 1 ? 0 : (height - marginY * 2) / (layer.neurons.length - 1);
    const centerY = height / 2;
    const startY =
      layer.neurons.length === 1 ? centerY : marginY;

    return layer.neurons.map((_, neuronIndex) => ({
      x: marginX + layerIndex * layerSpacing,
      y:
        layer.neurons.length === 1
          ? centerY
          : startY + neuronIndex * neuronSpacing,
    }));
  });
}

function drawConnection(
  context: CanvasRenderingContext2D,
  from: CanvasPoint,
  to: CanvasPoint,
  connection: ForwardPassConnectionState,
  isActive: boolean,
) {
  const magnitude = Math.min(1, Math.abs(connection.weight) / 2.5);
  const width = 1.5 + magnitude * 5;
  const alpha = isActive ? 0.9 : 0.35 + magnitude * 0.35;
  const color =
    connection.weight >= 0
      ? `rgba(56, 189, 248, ${alpha})`
      : `rgba(248, 113, 113, ${alpha})`;

  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.stroke();
}

function drawSignalParticle(
  context: CanvasRenderingContext2D,
  from: CanvasPoint,
  to: CanvasPoint,
  connection: ForwardPassConnectionState,
  progress: number,
) {
  const easedProgress = easeInOut(progress);
  const x = from.x + (to.x - from.x) * easedProgress;
  const y = from.y + (to.y - from.y) * easedProgress;
  const radius = 3 + Math.min(4, Math.abs(connection.contribution) * 5);

  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle =
    connection.weight >= 0 ? "rgba(125, 211, 252, 0.95)" : "rgba(252, 165, 165, 0.95)";
  context.fill();
}

function drawNeuron(
  context: CanvasRenderingContext2D,
  point: CanvasPoint,
  weightedSum: number,
  activation: number,
  isInput: boolean,
) {
  const magnitude = Math.min(1, Math.abs(activation));
  const radius = 22;
  const fill =
    activation >= 0
      ? `rgba(34, 211, 238, ${0.18 + magnitude * 0.82})`
      : `rgba(251, 146, 60, ${0.18 + magnitude * 0.82})`;

  context.beginPath();
  context.arc(point.x, point.y, radius, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
  context.lineWidth = isInput ? 3 : 2;
  context.strokeStyle = isInput ? "rgba(255,255,255,0.85)" : "rgba(191,219,254,0.85)";
  context.stroke();

  context.fillStyle = "#f8fafc";
  context.font = "600 11px ui-sans-serif, system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText(isInput ? "x" : "a", point.x, point.y + 4);

  if (!isInput) {
    context.fillStyle = "rgba(148, 163, 184, 0.8)";
    context.font = "10px ui-monospace, monospace";
    context.fillText(`|z| ${Math.abs(weightedSum).toFixed(2)}`, point.x, point.y + 38);
  }
}

function drawNeuronLabel(
  context: CanvasRenderingContext2D,
  point: CanvasPoint,
  neuron: ForwardPassLayerState["neurons"][number],
  layerIndex: number,
) {
  const boxWidth = 94;
  const boxHeight = 42;
  const boxX = point.x - boxWidth / 2;
  const boxY = point.y - 66;

  context.fillStyle = "rgba(3, 7, 18, 0.78)";
  context.strokeStyle = "rgba(148, 163, 184, 0.18)";
  context.lineWidth = 1;
  roundRect(context, boxX, boxY, boxWidth, boxHeight, 8);
  context.fill();
  context.stroke();

  context.fillStyle = "#cbd5e1";
  context.font = "10px ui-monospace, monospace";
  context.textAlign = "left";
  context.fillText(layerIndex === 0 ? `x=${neuron.activation.toFixed(2)}` : `z=${neuron.weightedSum.toFixed(2)}`, boxX + 8, boxY + 16);
  context.fillText(`a=${neuron.activation.toFixed(2)}`, boxX + 8, boxY + 31);
}
