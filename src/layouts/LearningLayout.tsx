import { Outlet } from "react-router-dom";

import LearningSidebar from "@/components/navigation/LearningSidebar";

export default function LearningLayout() {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <LearningSidebar />
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
