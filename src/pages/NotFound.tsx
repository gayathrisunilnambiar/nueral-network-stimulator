import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-white/10 bg-card/90 text-center">
        <CardHeader>
          <CardTitle className="text-4xl">404</CardTitle>
          <p className="text-sm text-muted-foreground">
            This route does not exist in the simulator. Head back to the learning workspace.
          </p>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
