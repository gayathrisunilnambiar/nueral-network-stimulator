import { BookOpen, FlaskConical, GraduationCap, Lightbulb, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  {
    to: "/concepts",
    title: "Concepts",
    description: "Build intuition for neurons, activations, and loss.",
    icon: BookOpen,
  },
  {
    to: "/learn",
    title: "Learn",
    description: "Follow a guided path from data to decision boundaries.",
    icon: GraduationCap,
  },
  {
    to: "/experiments",
    title: "Experiments",
    description: "Try structured investigations before entering the simulator.",
    icon: FlaskConical,
  },
  {
    to: "/challenges",
    title: "Challenges",
    description: "Practice explaining what the model is doing and why.",
    icon: Sparkles,
  },
];

export default function LearningSidebar() {
  return (
    <aside className="rounded-2xl border border-white/10 bg-card/60 p-4 backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-neural-cyan" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Learning Tracks
        </h2>
      </div>

      <div className="space-y-2">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "block rounded-xl border border-transparent p-3 transition-all",
                  isActive
                    ? "border-neural-cyan/30 bg-neural-gradient-subtle"
                    : "bg-background/40 hover:border-white/10 hover:bg-background/60",
                )
              }
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-white/10 bg-background/60 p-2">
                  <Icon className="h-4 w-4 text-neural-cyan" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{item.title}</div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
