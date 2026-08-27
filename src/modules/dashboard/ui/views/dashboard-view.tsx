"use client";

import { ChartsSection } from "../sections/charts-section";
import { StatisticsSection } from "../sections/statistics-section";
import { TravelSection } from "../sections/travel-section";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoUploadModal } from "../components/photo-upload-modal";
import { StudioPageHeader } from "../components/studio-page-header";
import styles from "../studio.module.css";

export const DashboardView = () => {
  return (
    <div className={styles.page}>
      <StudioPageHeader
        index="00"
        eyebrow="Studio index"
        title={<>Archive, in progress.</>}
        description={
          <>
            A quiet working view of the photographs, places, and stories that
            shape the public archive.
          </>
        }
        actions={
          <>
            <Button className={styles.secondaryAction} asChild>
              <Link href="/photos">
                Contact sheets <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
            <PhotoUploadModal triggerClassName={styles.primaryAction} />
          </>
        }
      />

      <StatisticsSection />

      <div className={styles.sectionLabel}>
        <p>Archive rhythm</p>
        <span>Five-year view</span>
      </div>
      <ChartsSection />

      <TravelSection />
    </div>
  );
};
