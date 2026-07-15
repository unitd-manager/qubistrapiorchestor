import { ComponentType, lazy, Suspense, useEffect, useRef, useState } from "react";

interface DeferredSectionProps {
  loader: () => Promise<{ default: ComponentType }>;
  minHeight?: string;
  rootMargin?: string;
}

export const DeferredSection = ({
  loader,
  minHeight = "24rem",
  rootMargin = "300px 0px",
}: DeferredSectionProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const LazyComponent = lazy(loader);

  useEffect(() => {
    if (shouldRender || !targetRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(targetRef.current);

    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return (
    <div ref={targetRef} style={{ minHeight }}>
      {shouldRender ? (
        <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>
          <LazyComponent />
        </Suspense>
      ) : null}
    </div>
  );
};
