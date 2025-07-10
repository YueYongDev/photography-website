"use client";

import { useState, useEffect, Suspense } from "react";
import Footer from "@/modules/home/ui/components/footer";
import {
  PageTransitionContainer,
  PageTransitionItem,
} from "@/components/page-transition";
import { CoverPhoto } from "../components/cover-photo";
import { Introduction } from "../components/introduction";
import { CityItem } from "../components/city-item";
import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { CitySetWithPhotos } from "@/db/schema/photos";

export const TravelSection = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <TravelSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const TravelSectionSuspense = () => {
  const [activeCity, setActiveCity] = useState<CitySetWithPhotos | null>(null);

  const [data] = trpc.photos.getCitySets.useSuspenseQuery({
    limit: 99,
  });

  useEffect(() => {
    if (!activeCity && data && data.items.length > 0) {
      setActiveCity(data.items[0]);
    }
  }, [activeCity, data]);

  return (
    <>
      <CoverPhoto citySet={activeCity || data.items[0]} citySets={data.items} />

      {/* Spacer for fixed left content */}
      <div className="hidden lg:block lg:w-1/2" />

      {/* RIGHT CONTENT - Scrollable */}
      <PageTransitionContainer className="w-full mt-3 lg:mt-0 lg:w-1/2 space-y-3 pb-3">
        <PageTransitionItem>
          <Introduction />
        </PageTransitionItem>

        <PageTransitionItem>
          <div className="space-y-3">
            {data.items.map((city) => (
              <CityItem
                key={city.id}
                city={city}
                onMouseEnter={setActiveCity}
              />
            ))}
          </div>
        </PageTransitionItem>

        <PageTransitionItem>
          <Footer />
        </PageTransitionItem>
      </PageTransitionContainer>
    </>
  );
};
