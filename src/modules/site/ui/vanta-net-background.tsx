"use client";

import { useEffect, useRef } from "react";

type VantaNetBackgroundProps = {
  className?: string;
};

export const VantaNetBackground = ({
  className,
}: VantaNetBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    let cancelled = false;
    let effect: { destroy: () => void } | null = null;

    void Promise.all([
      import("three"),
      import("vanta/dist/vanta.net.min"),
    ])
      .then(([THREE, module]) => {
        if (cancelled || !containerRef.current) return;

        effect = module.default({
          el: containerRef.current,
          THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          color: 0x778b8e,
          backgroundColor: 0xf7f8f7,
          points: 7,
          maxDistance: 22,
          spacing: 19,
          showDots: true,
        });
      })
      .catch(() => {
        // The static loading treatment remains visible if WebGL is unavailable.
      });

    return () => {
      cancelled = true;
      effect?.destroy();
    };
  }, []);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
};
