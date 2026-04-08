import { Activity, BrainCircuit, Gauge, Layers3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRAINING_PHASE_CONTENT } from "@/lib/simulator-content";
import type { DatasetSummary, TrainingPhase } from "@/types/simulator";

interface TrainingStatusCardProps {
  accuracy: number;
  architecture: number[];
  currentEpoch: number;
  currentLoss: number;
  datasetSummary: DatasetSummary;
  insight: string;
  isTraining: boolean;
  maxEpochs: number;
  trainingPhase: TrainingPhase;
}

export default function TrainingStatusCard({
  accuracy,
  architecture,
  currentEpoch,
  currentLoss,
  datasetSummary,
  insight,
  isTraining,
  maxEpochs,
  trainingPhase,
}: TrainingStatusCardProps) {
  const phase = TRAINING_PHASE_CONTENT[trainingPhase];
  const progressPercent = Math.min(100, (currentEpoch / Math.max(1, maxEpochs)) * 100);

  return (
    <Card className="h-full border-white/10 bg-card/90">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-neural-cyan" />
              Training Status
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              A compact view of what the network is doing right now.
            </p>
          </div>
          <Badge variant={isTraining ? "default" : "secondary"}>
            {isTraining ? "Training" : "Paused"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-background/50 p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              Accuracy
            </div>
            <div className="mt-2 text-2xl font-semibold">{(accuracy * 100).toFixed(1)}%</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-background/50 p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <BrainCircuit className="h-3.5 w-3.5" />
              Loss
            </div>
            <div className="mt-2 text-2xl font-semibold">{currentLoss.toFixed(4)}</div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-background/40 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Epoch progress</span>
            <span className="font-mono">
              {currentEpoch} / {maxEpochs}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neural-blue via-neural-purple to-neural-cyan transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-background/40 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5" />
              Architecture
            </div>
            <p className="mt-2 font-mono text-sm text-foreground">{architecture.join(" -> ")}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-background/40 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dataset balance</div>
            <p className="mt-2 text-sm text-foreground">
              {datasetSummary.positiveCount} positive / {datasetSummary.negativeCount} negative
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Positive ratio: {(datasetSummary.positiveRatio * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-neural-cyan/20 bg-neural-gradient-subtle p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current learning phase</div>
          <p className="mt-2 text-base font-semibold">{phase.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{phase.description}</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-background/40 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Teaching note</div>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{insight}</p>
        </div>
      </CardContent>
    </Card>
  );
}
