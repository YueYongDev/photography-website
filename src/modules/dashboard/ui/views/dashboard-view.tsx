"use client";

import { ChartsSection } from "../sections/charts-section";
import { StatisticsSection } from "../sections/statistics-section";
import { TravelSection } from "../sections/travel-section";
import { PageTransitionItem } from "@/components/page-transition";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoUploadModal } from "../components/photo-upload-modal";

export const DashboardView = () => {
  return (
    <div className="flex flex-col gap-y-4 py-6 px-4 max-w-7xl mx-auto">
      <PageTransitionItem>
        <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Photography Studio</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Archive dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload photographs, edit metadata, and manage the public archive from one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/photos">Photo Library <ArrowUpRight className="size-4" /></Link>
            </Button>
            <PhotoUploadModal />
          </div>
        </div>
      </PageTransitionItem>
      <PageTransitionItem>
        <StatisticsSection />
      </PageTransitionItem>
      <PageTransitionItem>
        <ChartsSection />
      </PageTransitionItem>
      <PageTransitionItem>
        <TravelSection />
      </PageTransitionItem>
    </div>
  );
};
