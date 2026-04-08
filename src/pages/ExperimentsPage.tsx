import { FlaskConical, Gauge, Layers3, SlidersHorizontal } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EXPERIMENTS = [
  {
    title: "Learning-rate sweep",
    icon: Gauge,
    prompt: "Try 0.02, 0.08, and 0.25. Which value gives steady learning, and which one causes unstable jumps?",
  },
  {
    title: "Architecture comparison",
    icon: Layers3,
    prompt: "Keep the dataset fixed and compare shallow versus deeper networks. Which shapes can each model represent?",
  },
  {
    title: "Activation study",
    icon: SlidersHorizontal,
    prompt: "Switch between ReLU, sigmoid, and tanh. Watch how the forward activations and the boundary evolve differently.",
  },
];

export default function ExperimentsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-neural-cyan">Experiments</p>
        <h2 className="mt-2 text-3xl font-semibold">Structured investigations for the simulator</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          These prompts keep experimentation purposeful, so students can connect parameter changes to
          boundary geometry and training stability.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {EXPERIMENTS.map((experiment) => {
          const Icon = experiment.icon;

          return (
            <Card key={experiment.title} className="border-white/10 bg-card/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Icon className="h-5 w-5 text-neural-cyan" />
                  {experiment.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <FlaskConical className="h-3.5 w-3.5" />
                  Try this
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{experiment.prompt}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
