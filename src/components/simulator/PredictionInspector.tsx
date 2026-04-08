import { CheckCircle2, Search, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PredictionSample } from "@/types/simulator";

interface PredictionInspectorProps {
  samples: PredictionSample[];
}

export default function PredictionInspector({ samples }: PredictionInspectorProps) {
  return (
    <Card className="border-white/10 bg-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-neural-blue" />
          Sample Predictions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          These points let students compare the true label with the network's current guess.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {samples.map((sample) => {
          const isCorrect = sample.predictedLabel === sample.point.label;

          return (
            <div
              key={sample.id}
              className="rounded-lg border border-white/10 bg-background/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-sm text-foreground">
                    ({sample.point.x.toFixed(2)}, {sample.point.y.toFixed(2)})
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expected class: {sample.point.label}
                  </p>
                </div>
                <Badge variant={isCorrect ? "secondary" : "destructive"}>
                  {isCorrect ? "Correct" : "Mismatch"}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Predicted</div>
                  <div className="mt-1 font-semibold">{sample.predictedLabel}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Probability</div>
                  <div className="mt-1 font-semibold">{sample.probability.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Confidence</div>
                  <div className="mt-1 font-semibold">{(sample.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                {isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400" />
                )}
                {isCorrect
                  ? "The decision boundary places this point on the right side."
                  : "This point still lies near a confusing part of the boundary."}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
