import { Binary, Brain, GitBranch, Sigma } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CONCEPTS = [
  {
    title: "Neuron",
    icon: Brain,
    body: "A neuron takes inputs, multiplies them by weights, adds a bias, and applies an activation function. In the simulator, every circle is one of these units.",
  },
  {
    title: "Weighted Sum",
    icon: Sigma,
    body: "Before activation, each neuron computes z = w.x + b. This intermediate value explains why a neuron becomes strongly active or stays quiet.",
  },
  {
    title: "Activation",
    icon: Binary,
    body: "Activation functions bend the space. Without them, stacked layers still behave like one straight-line model.",
  },
  {
    title: "Decision Boundary",
    icon: GitBranch,
    body: "The decision boundary is the border between predicted classes. As training improves, the colored map shifts to better match the dataset points.",
  },
];

export default function ConceptsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-neural-cyan">Concepts</p>
        <h2 className="mt-2 text-3xl font-semibold">Core ideas behind the simulator</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          These summaries give students the vocabulary they need before they dive into forward
          propagation, backpropagation, and live training behavior.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {CONCEPTS.map((concept) => {
          const Icon = concept.icon;

          return (
            <Card key={concept.title} className="border-white/10 bg-card/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Icon className="h-5 w-5 text-neural-cyan" />
                  {concept.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{concept.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
