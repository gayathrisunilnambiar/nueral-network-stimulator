import { ArrowRight, Eye, RefreshCcw, Route, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LEARNING_STEPS = [
  {
    title: "1. Inspect the dataset",
    icon: Eye,
    detail: "Start by locating the two classes in the 2D plane. Ask whether a straight line could separate them.",
  },
  {
    title: "2. Watch the forward pass",
    icon: ArrowRight,
    detail: "Follow signals through the layers and compare the weighted sums with the final activation values.",
  },
  {
    title: "3. Trace backpropagation",
    icon: RefreshCcw,
    detail: "See how loss becomes gradients, and how each active path contributes to a weight update.",
  },
  {
    title: "4. Compare the boundary",
    icon: Target,
    detail: "Relate the updated decision map to the latest predictions and decide whether the network is underfitting or improving.",
  },
];

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-neural-cyan">Learn</p>
        <h2 className="mt-2 text-3xl font-semibold">Suggested learning sequence</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          This path keeps the explanation aligned with the simulator so students can connect math,
          model state, and visual behavior step by step.
        </p>
      </header>

      <Card className="border-white/10 bg-card/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Route className="h-5 w-5 text-neural-cyan" />
            Guided flow
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {LEARNING_STEPS.map((step) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="rounded-xl border border-white/10 bg-background/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-white/10 bg-background/60 p-2">
                    <Icon className="h-4 w-4 text-neural-cyan" />
                  </div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
