import { ArrowRight, Binary, Brain, RefreshCcw, Waves } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingPhase } from "@/types/simulator";

interface LearningJourneyProps {
  activePhase: TrainingPhase;
}

const JOURNEY_STEPS: Array<{
  key: TrainingPhase;
  title: string;
  description: string;
  icon: typeof Brain;
}> = [
  {
    key: "forward-pass",
    title: "1. Inputs move forward",
    description: "Each layer transforms the two input coordinates into a new internal representation.",
    icon: Binary,
  },
  {
    key: "loss-check",
    title: "2. Prediction meets truth",
    description: "The output neuron compares its probability with the actual class label.",
    icon: Waves,
  },
  {
    key: "backpropagation",
    title: "3. Error flows backward",
    description: "Gradients tell every weight whether it should increase or decrease.",
    icon: RefreshCcw,
  },
  {
    key: "decision-boundary",
    title: "4. Boundary changes shape",
    description: "The map updates so students can see the new classification regions.",
    icon: Brain,
  },
];

export default function LearningJourney({ activePhase }: LearningJourneyProps) {
  return (
    <Card className="border-white/10 bg-card/90">
      <CardHeader>
        <CardTitle className="text-lg">How One Epoch Works</CardTitle>
        <p className="text-sm text-muted-foreground">
          The simulator makes the training loop visible instead of treating it like a black box.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-4">
        {JOURNEY_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = activePhase === step.key;

          return (
            <div
              key={step.key}
              className={`relative rounded-xl border p-4 transition-all ${
                isActive
                  ? "border-neural-cyan/50 bg-neural-gradient-subtle shadow-lg"
                  : "border-white/10 bg-background/30"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-full border border-white/10 bg-background/70 p-2">
                  <Icon className={`h-4 w-4 ${isActive ? "text-neural-cyan" : "text-muted-foreground"}`} />
                </div>
                {index < JOURNEY_STEPS.length - 1 ? (
                  <ArrowRight className="hidden h-4 w-4 text-muted-foreground lg:block" />
                ) : null}
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
