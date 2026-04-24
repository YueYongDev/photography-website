"use client";

import { useCallback, useEffect, useRef } from "react";

const normalizeText = (value: string | null | undefined) =>
  (value ?? "").replace(/\s+/g, "");

const HEADER_SIGNATURE = "ECarryTravelDiscoverJourneysBlogAboutREEL03";

export const JourneysView = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const hideEmbeddedHeader = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.body) return false;

    if (doc.scrollingElement) {
      doc.scrollingElement.scrollTop = 0;
    }

    doc.body.style.display = "block";
    doc.body.style.alignItems = "stretch";
    doc.body.style.justifyContent = "flex-start";
    doc.body.style.minHeight = "100vh";

    const header = Array.from(doc.body.querySelectorAll<HTMLElement>("*")).find(
      (element) => {
        const text = normalizeText(element.textContent);
        const box = element.getBoundingClientRect();

        return (
          text.includes(HEADER_SIGNATURE) &&
          box.width > 500 &&
          box.height >= 40 &&
          box.height <= 120
        );
      },
    );

    if (!header) return false;

    header.style.display = "none";

    const heroSection = header.nextElementSibling;
    if (heroSection instanceof HTMLElement) {
      heroSection.style.paddingTop = "32px";
    }

    return true;
  }, []);

  const handleLoad = useCallback(() => {
    hideEmbeddedHeader();
  }, [hideEmbeddedHeader]);

  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      hideEmbeddedHeader();
    }, 250);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full overflow-hidden rounded-xl bg-black">
      <iframe
        ref={iframeRef}
        src="/journeys-film-reel.html"
        title="Journeys Film Reel"
        onLoad={handleLoad}
        className="block h-full w-full border-0 bg-black"
      />
    </div>
  );
};
