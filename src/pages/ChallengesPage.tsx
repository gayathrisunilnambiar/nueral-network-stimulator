import { CheckCircle2, HelpCircle, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHALLENGES = [
  "Explain why XOR cannot be solved by a purely linear network.",
  "Describe what a large positive gradient on one edge means for the next weight update.",
  "Use the spiral dataset and explain whether low accuracy comes from underfitting, insufficient epochs, or both.",
];

export default function ChallengesPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-neural-cyan">Challenges</p>
        <h2 className="mt-2 text-3xl font-semibold">Short prompts to test understanding</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Students should be able to explain what they see, not just operate the controls. These
          prompts are designed to turn the simulator into an oral or written practice tool.
        </p>
      </header>

      <Card className="border-white/10 bg-card/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-neural-cyan" />
            Reflection prompts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {CHALLENGES.map((challenge) => (
            <div key={challenge} className="rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="mt-0.5 h-4 w-4 text-neural-cyan" />
                <div>
                  <p className="text-sm leading-relaxed text-foreground">{challenge}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Encourage students to answer with both equations and observations from the visuals.
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
