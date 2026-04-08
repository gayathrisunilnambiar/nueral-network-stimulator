import { Outlet } from "react-router-dom";

import MainNavbar from "@/components/navigation/MainNavbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
