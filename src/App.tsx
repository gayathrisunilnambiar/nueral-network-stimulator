import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "@/layouts/AppLayout";
import LearningLayout from "@/layouts/LearningLayout";
import { SimulatorPage } from "@/features/simulator";

import Index from "./pages/Index";
import ConceptsPage from "./pages/ConceptsPage";
import LearnPage from "./pages/LearnPage";
import ExperimentsPage from "./pages/ExperimentsPage";
import ChallengesPage from "./pages/ChallengesPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route element={<LearningLayout />}>
            <Route path="/concepts" element={<ConceptsPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/experiments" element={<ExperimentsPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
