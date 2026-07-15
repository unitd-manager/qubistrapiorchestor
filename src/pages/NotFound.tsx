import { useLocation } from "react-router-dom";
import { use404Tracking } from "@/hooks/use404Tracking";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  // Track 404 error
  use404Tracking({ enabled: true });

  return (
    <>
      <SEOHead
        metadata={{
          id: "404",
          title: "404 - Page Not Found | Qubi Flow Orchestrator",
          description: "The page you're looking for doesn't exist.",
          robots: "noindex, follow",
        }}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted">
          <div className="text-center space-y-6 px-4">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-primary">404</h1>
              <h2 className="text-3xl font-semibold">Page Not Found</h2>
            </div>

            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Sorry, we couldn't find the page you're looking for. The path{" "}
              <code className="bg-muted px-2 py-1 rounded text-sm break-words">
                {location.pathname}
              </code>{" "}
              doesn't exist.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button onClick={() => (window.location.href = "/")} size="lg">
                Return to Home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                size="lg"
              >
                Go Back
              </Button>
            </div>

            <p className="text-sm text-muted-foreground pt-4">
              If you believe this is an error, please{" "}
              <a href="mailto:support@qubi.com" className="text-primary underline hover:no-underline">
                contact support
              </a>
              .
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default NotFound;
