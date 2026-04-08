import { ArrowRight, BrainCircuit, Compass, FlaskConical, GraduationCap, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_PATHS = [
  {
    title: "Concepts",
    description: "Explain the core building blocks before students touch the simulator.",
    to: "/concepts",
    icon: Layers3,
  },
  {
    title: "Learn",
    description: "Follow a sequenced path from dataset geometry to backpropagation.",
    to: "/learn",
    icon: GraduationCap,
  },
  {
    title: "Experiments",
    description: "Frame guided questions around hyperparameters, datasets, and failure modes.",
    to: "/experiments",
    icon: FlaskConical,
  },
  {
    title: "Challenges",
    description: "Use small prompts and reflection tasks to test understanding.",
    to: "/challenges",
    icon: Compass,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-neural-gradient opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--neural-cyan)/0.18),transparent_35%)]" />
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <BrainCircuit className="mr-2 h-4 w-4" />
              Multi-page Neural Network Learning Platform
            </Badge>
            <h1 className="bg-gradient-to-r from-neural-blue via-white to-neural-cyan bg-clip-text pb-2 text-4xl font-bold text-transparent md:text-6xl">
              Learn the Math, Then Watch It Happen
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              This platform separates explanations, guided learning, and hands-on experimentation so
              students can move from intuition to interaction without losing the thread.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/simulator">
                  Open Simulator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/learn">Start Guided Learning</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {QUICK_PATHS.map((path) => {
            const Icon = path.icon;

            return (
              <Card key={path.title} className="border-white/10 bg-card/90">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-background/50 p-2">
                      <Icon className="h-5 w-5 text-neural-cyan" />
                    </div>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{path.description}</p>
                  <Button asChild variant="link" className="mt-3 px-0 text-neural-cyan">
                    <Link to={path.to}>
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
