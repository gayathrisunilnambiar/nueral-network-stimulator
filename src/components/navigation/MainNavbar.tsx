import { BrainCircuit, BookOpen, FlaskConical, GraduationCap, Home, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Intro", icon: Home },
  { to: "/concepts", label: "Concepts", icon: BookOpen },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/simulator", label: "Simulator", icon: BrainCircuit },
  { to: "/experiments", label: "Experiments", icon: FlaskConical },
  { to: "/challenges", label: "Challenges", icon: Sparkles },
];

export default function MainNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/90 backdrop-blur">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neural-cyan">Neural Learning Lab</p>
          <h1 className="text-lg font-semibold text-foreground">Visual ML platform for engineering students</h1>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Button key={item.to} variant="ghost" size="sm" asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-white/10 text-foreground"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
