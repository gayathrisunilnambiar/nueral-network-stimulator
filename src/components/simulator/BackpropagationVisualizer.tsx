import { Pause, Play, Sigma, Undo2 } from "lucide-react";
import { useEffect, useMemo } from "react";

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
  BackpropConnectionState,
  BackpropLayerState,
  BackpropagationSnapshot,
} from "@/types/backpropagation";

interface BackpropagationVisualizerProps {
  inputVector: number[];
  networkEngine: NeuralNetwork | null;
  targetValue: number;
  version: number;
}

const BACKPROP_STAGE_DURATION = 1600;

export default function BackpropagationVisualizer({
  inputVector,
  networkEngine,
  targetValue,
  version,
}: BackpropagationVisualizerProps) {
  const { animationTime, canvasRef, containerRef, isPlaying, setIsPlaying, size } =
    usePlaybackClock({
      resetToken: `${inputVector.join(",")}:${targetValue}:${version}`,
    });

  const snapshot = useMemo<BackpropagationSnapshot | null>(() => {
    if (!networkEngine || inputVector.length === 0) {
      return null;
    }

    // `version` keeps the trace in sync with manual weight edits and training steps.
    void version;
    return networkEngine.traceBackpropagation(inputVector, [targetValue]);
  }, [inputVector, networkEngine, targetValue, version]);

  const activeStage = useMemo(() => {
    if (!snapshot) {
      return 0;
    }

    const transitionCount = Math.max(1, snapshot.layers.length - 1);
    const cycleDuration = transitionCount * BACKPROP_STAGE_DURATION;
    const normalizedTime = animationTime % cycleDuration;

    return Math.floor(normalizedTime / BACKPROP_STAGE_DURATION);
  }, [animationTime, snapshot]);

  const activeToLayer = useMemo(() => {
    if (!snapshot) {
      return 1;
    }

    return snapshot.layers.length - 1 - activeStage;
  }, [activeStage, snapshot]);

  const activeConnections = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return snapshot.connections.filter((connection) => connection.toLayer === activeToLayer);
  }, [activeToLayer, snapshot]);

  const focusConnection = useMemo(() => {
    return activeConnections.reduce<BackpropConnectionState | null>((current, connection) => {
      if (!current) {
        return connection;
      }

      return Math.abs(connection.gradient) > Math.abs(current.gradient) ? connection : current;
    }, null);
  }, [activeConnections]);

  const activeLayer = snapshot?.layers[activeToLayer] ?? null;
  const focusNeuron = useMemo(() => {
    if (!activeLayer) {
      return null;
    }

    return activeLayer.neurons.reduce<typeof activeLayer.neurons[number] | null>((current, neuron) => {
      if (!current) {
        return neuron;
      }

      return Math.abs(neuron.delta) > Math.abs(current.delta) ? neuron : current;
    }, null);
  }, [activeLayer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context || !snapshot) {
      return;
    }

    resizeCanvasToDisplaySize(canvas, context, size.width, size.height);

    drawBackpropagation({
      context,
      size,
      snapshot,
      activeToLayer,
      stageProgress: (animationTime % BACKPROP_STAGE_DURATION) / BACKPROP_STAGE_DURATION,
      isPlaying,
    });
  }, [activeToLayer, animationTime, canvasRef, isPlaying, size, snapshot]);

  return (
    <Card className="border-white/10 bg-card/90">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Undo2 className="h-5 w-5 text-neural-purple" />
            Backpropagation
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Gradient signals travel from output back toward the inputs. Active paths brighten, and edge labels show the current weight gradient and update.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsPlaying((value) => !value)}>
          {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border border-white/10 bg-background/40 p-4 md:grid-cols-4">
          <Metric label="Target" value={targetValue.toFixed(2)} />
          <Metric label="Prediction" value={(snapshot?.loss.prediction ?? 0).toFixed(3)} />
          <Metric label="MSE" value={(snapshot?.loss.mse ?? 0).toFixed(4)} />
          <Metric
            label="Animated Layer"
            value={
              snapshot
                ? `${snapshot.layers.length - activeToLayer} / ${snapshot.layers.length - 1}`
                : "0 / 0"
            }
          />
        </div>

        <div ref={containerRef} className="w-full">
          <canvas ref={canvasRef} className="w-full rounded-xl border border-white/10 bg-[#12091f]" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <MathCard
            title="Loss Calculation"
            lines={[
              `error = y - y_hat = ${targetValue.toFixed(2)} - ${(snapshot?.loss.prediction ?? 0).toFixed(3)} = ${(snapshot?.loss.error ?? 0).toFixed(3)}`,
              `MSE = (y - y_hat)^2 = (${(snapshot?.loss.error ?? 0).toFixed(3)})^2 = ${(snapshot?.loss.mse ?? 0).toFixed(4)}`,
              `dL/dy_hat = 2(y_hat - y) = ${(snapshot?.loss.derivativeWrtPrediction ?? 0).toFixed(4)}`,
            ]}
          />
          <MathCard title="Derivative Steps" lines={buildDerivativeLines(focusNeuron)} />
          <MathCard
            title="Weight Update"
            lines={buildWeightUpdateLines(focusConnection, snapshot?.learningRate ?? 0)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}

function MathCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-background/40 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Sigma className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="mt-3 space-y-2 font-mono text-xs leading-relaxed text-foreground">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function buildDerivativeLines(neuron: BackpropLayerState["neurons"][number] | null) {
  if (!neuron) {
    return ["No active neuron yet."];
  }

  if (neuron.isOutput) {
    return [
      `activation derivative = f'(z) = ${neuron.activationDerivative.toFixed(4)}`,
      `output signal = dL/dy_hat = ${neuron.upstreamSignal.toFixed(4)}`,
      `delta = dL/dy_hat * f'(z) = ${neuron.upstreamSignal.toFixed(4)} * ${neuron.activationDerivative.toFixed(4)} = ${neuron.delta.toFixed(4)}`,
    ];
  }

  return [
    `upstream = sum(w * delta_next) = ${neuron.upstreamSignal.toFixed(4)}`,
    `activation derivative = f'(z) = ${neuron.activationDerivative.toFixed(4)}`,
    `delta = upstream * f'(z) = ${neuron.upstreamSignal.toFixed(4)} * ${neuron.activationDerivative.toFixed(4)} = ${neuron.delta.toFixed(4)}`,
  ];
}

function buildWeightUpdateLines(
  connection: BackpropConnectionState | null,
  learningRate: number,
) {
  if (!connection) {
    return ["No active connection yet."];
  }

  return [
    `gradient = delta_target * a_source = ${connection.targetDelta.toFixed(4)} * ${connection.sourceActivation.toFixed(4)} = ${connection.gradient.toFixed(4)}`,
    `delta_w = -eta * gradient = -${learningRate.toFixed(3)} * ${connection.gradient.toFixed(4)} = ${connection.update.toFixed(4)}`,
    `w_new = w_old + delta_w = ${connection.weight.toFixed(4)} + ${connection.update.toFixed(4)} = ${connection.newWeight.toFixed(4)}`,
  ];
}

function drawBackpropagation({
  context,
  size,
  snapshot,
  activeToLayer,
  stageProgress,
  isPlaying,
}: {
  context: CanvasRenderingContext2D;
  size: { width: number; height: number };
  snapshot: BackpropagationSnapshot;
  activeToLayer: number;
  stageProgress: number;
  isPlaying: boolean;
}) {
  context.clearRect(0, 0, size.width, size.height);
  drawBackground(context, size.width, size.height);

  const marginX = 88;
  const marginY = 76;
  const layout = getLayerPositions(snapshot.layers, size.width, size.height, marginX, marginY);

  snapshot.connections.forEach((connection) => {
    const from = layout[connection.fromLayer][connection.fromNeuron];
    const to = layout[connection.toLayer][connection.toNeuron];
    const isActive = connection.toLayer === activeToLayer;

    drawConnection(context, from, to, connection, isActive);

    if (isActive) {
      drawGradientLabel(context, from, to, connection);

      if (isPlaying) {
        drawReverseParticle(context, from, to, connection, stageProgress);
      }
    }
  });

  snapshot.layers.forEach((layer, layerIndex) => {
    layer.neurons.forEach((neuron, neuronIndex) => {
      const point = layout[layerIndex][neuronIndex];
      drawNeuron(context, point, neuron.activation, neuron.delta, layerIndex === activeToLayer);
      drawNeuronOverlay(context, point, neuron, layerIndex);
    });
  });

  drawLayerTitles(context, snapshot.layers, layout);
}

function drawBackground(context: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#12091f");
  gradient.addColorStop(1, "#21103a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function getLayerPositions(
  layers: BackpropLayerState[],
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
    const startY = layer.neurons.length === 1 ? centerY : marginY;

    return layer.neurons.map((_, neuronIndex) => ({
      x: marginX + layerIndex * layerSpacing,
      y: layer.neurons.length === 1 ? centerY : startY + neuronIndex * neuronSpacing,
    }));
  });
}

function drawConnection(
  context: CanvasRenderingContext2D,
  from: CanvasPoint,
  to: CanvasPoint,
  connection: BackpropConnectionState,
  isActive: boolean,
) {
  const magnitude = Math.min(1, Math.abs(connection.weight) / 2.5);
  const width = 1.5 + magnitude * 5;
  const alpha = isActive ? 0.9 : 0.25 + magnitude * 0.25;
  const color =
    connection.update >= 0
      ? `rgba(251, 191, 36, ${alpha})`
      : `rgba(196, 181, 253, ${alpha})`;

  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.stroke();
}

function drawGradientLabel(
  context: CanvasRenderingContext2D,
  from: CanvasPoint,
  to: CanvasPoint,
  connection: BackpropConnectionState,
) {
  const x = from.x + (to.x - from.x) * 0.5;
  const y = from.y + (to.y - from.y) * 0.5;
  const lines = [`g=${connection.gradient.toFixed(3)}`, `dw=${connection.update.toFixed(3)}`];
  const width = 70;
  const height = 30;

  context.fillStyle = "rgba(2, 6, 23, 0.78)";
  context.strokeStyle = "rgba(196, 181, 253, 0.32)";
  roundRect(context, x - width / 2, y - height / 2, width, height, 6);
  context.fill();
  context.stroke();

  context.fillStyle = "#f8fafc";
  context.font = "10px ui-monospace, monospace";
  context.textAlign = "center";
  context.fillText(lines[0], x, y - 2);
  context.fillText(lines[1], x, y + 10);
}

function drawReverseParticle(
  context: CanvasRenderingContext2D,
  from: CanvasPoint,
  to: CanvasPoint,
  connection: BackpropConnectionState,
  progress: number,
) {
  const eased = easeInOut(progress);
  const x = to.x + (from.x - to.x) * eased;
  const y = to.y + (from.y - to.y) * eased;
  const radius = 3 + Math.min(4, Math.abs(connection.gradient) * 8);

  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle =
    connection.update >= 0 ? "rgba(251, 191, 36, 0.95)" : "rgba(196, 181, 253, 0.95)";
  context.fill();
}

function drawNeuron(
  context: CanvasRenderingContext2D,
  point: CanvasPoint,
  activation: number,
  delta: number,
  isActive: boolean,
) {
  const magnitude = Math.min(1, Math.abs(activation));
  const radius = 22;
  const fill =
    activation >= 0
      ? `rgba(45, 212, 191, ${0.18 + magnitude * 0.82})`
      : `rgba(251, 146, 60, ${0.18 + magnitude * 0.82})`;

  context.beginPath();
  context.arc(point.x, point.y, radius, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
  context.lineWidth = isActive ? 3.5 : 2;
  context.strokeStyle = isActive ? "rgba(251, 191, 36, 0.95)" : "rgba(226, 232, 240, 0.85)";
  context.stroke();

  context.fillStyle = "#f8fafc";
  context.font = "600 11px ui-sans-serif, system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText(`d ${delta.toFixed(2)}`, point.x, point.y + 4);
}

function drawNeuronOverlay(
  context: CanvasRenderingContext2D,
  point: CanvasPoint,
  neuron: BackpropLayerState["neurons"][number],
  layerIndex: number,
) {
  const boxWidth = 108;
  const boxHeight = 42;
  const boxX = point.x - boxWidth / 2;
  const boxY = point.y - 66;

  context.fillStyle = "rgba(2, 6, 23, 0.78)";
  context.strokeStyle = "rgba(196, 181, 253, 0.18)";
  roundRect(context, boxX, boxY, boxWidth, boxHeight, 8);
  context.fill();
  context.stroke();

  context.fillStyle = "#e2e8f0";
  context.font = "10px ui-monospace, monospace";
  context.textAlign = "left";
  context.fillText(
    layerIndex === 0 ? `a=${neuron.activation.toFixed(2)}` : `z=${neuron.weightedSum.toFixed(2)}`,
    boxX + 8,
    boxY + 16,
  );
  context.fillText(`d=${neuron.delta.toFixed(2)}`, boxX + 8, boxY + 31);
}
