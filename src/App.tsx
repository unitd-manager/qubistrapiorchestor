import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { RedirectHandler } from "@/components/RedirectHandler";
import Index from "./pages/Index.tsx";
import ResourcePage from "./pages/ResourcePage.tsx";
import FAQsPage from "@/pages/FAQsPage";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const DynamicPage = lazy(() => import("./pages/DynamicPage.tsx"));
const UseCasesPage = lazy(() => import("./pages/UseCasesPage.tsx"));
const IndustriesPage = lazy(() => import("./pages/IndustriesPage.tsx"));
const CustomersPage = lazy(() => import("./pages/CustomersPage.tsx"));
const PricingPage = lazy(() => import("./pages/PricingPage.tsx"));
const BlogPage = lazy(() => import("./pages/BlogPage.tsx"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage.tsx"));
<Route path="/resources/:slug" element={<ResourcePage />} />
const NewsroomPage = lazy(() => import("./pages/NewsroomPage.tsx"));
const Toaster = lazy(() => import("@/components/ui/toaster").then((module) => ({ default: module.Toaster })));
const SonnerToaster = lazy(() => import("@/components/ui/sonner").then((module) => ({ default: module.Toaster })));

const queryClient = new QueryClient();

const RouteFallback = () => <div className="min-h-screen bg-background" aria-hidden="true" />;

const App = () => {
  const [showDeferredUi, setShowDeferredUi] = useState(false);

  useEffect(() => {
    const schedule = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 1));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = schedule(() => setShowDeferredUi(true));

    return () => cancel(handle);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {showDeferredUi ? (
          <Suspense fallback={null}>
            <Toaster />
            <SonnerToaster />
          </Suspense>
        ) : null}
        <ScrollToTop />
        <RedirectHandler enabled={true} />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/solutions/use-cases" element={<UseCasesPage />} />
            <Route path="/solutions/industries" element={<IndustriesPage />} />
            <Route path="/resources/blog" element={<BlogPage />} />
            <Route path="/resources/blog/:documentId" element={<BlogDetailPage />} />
            <Route path="/resources/:slug" element={<ResourcePage />} />
            <Route path="/resources/newsroom" element={<NewsroomPage />} />
            <Route path="/resources/:slug" element={<ResourcePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            {/* Any page a client creates in Strapi (any slug) renders here automatically. */}
            <Route path="/:slug" element={<DynamicPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
