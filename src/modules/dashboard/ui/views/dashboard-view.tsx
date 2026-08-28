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
import { useStudioLocale } from "../../i18n/studio-locale";

export const DashboardView = () => {
  const { copy } = useStudioLocale();

  return (
    <div className={styles.page}>
      <StudioPageHeader
        index="00"
        eyebrow={copy.overview.eyebrow}
        title={copy.overview.title}
        description={copy.overview.description}
        actions={
          <>
            <Button className={styles.secondaryAction} asChild>
              <Link href="/studio/photos">
                {copy.overview.contactSheets} <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
            <PhotoUploadModal
              triggerClassName={styles.primaryAction}
              triggerLabel={copy.overview.upload}
            />
          </>
        }
      />

      <StatisticsSection />

      <div className={styles.sectionLabel}>
        <p>{copy.overview.rhythm}</p>
        <span>{copy.overview.fiveYear}</span>
      </div>
      <ChartsSection />

      <TravelSection />
    </div>
  );
};
