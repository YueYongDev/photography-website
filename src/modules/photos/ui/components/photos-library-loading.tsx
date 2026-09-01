"use client";

import type { CSSProperties } from "react";

import { StudioPageHeader } from "@/modules/dashboard/ui/components/studio-page-header";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";
import styles from "@/modules/dashboard/ui/studio.module.css";

const loadingRows = Array.from({ length: 6 });

export const PhotosLibraryLoading = () => {
  const { copy } = useStudioLocale();

  return (
    <section
      className={`${styles.photoLibrary} ${styles.photoLibraryLoading}`}
      aria-label={copy.photos.loading}
      aria-busy="true"
    >
      <div
        className={styles.photoLoadingStatus}
        role="status"
        aria-live="polite"
      >
        <span className={styles.photoLoadingPulse} aria-hidden="true" />
        <div>
          <strong>{copy.photos.loadingProgress}</strong>
          <span>{copy.photos.loadingHint}</span>
        </div>
        <span className={styles.photoLoadingCount}>01—40</span>
      </div>

      <div className={styles.librarySummary} aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className={styles.libraryMetric} key={index}>
            <div className={`${styles.skeletonBlock} h-3 w-16`} />
            <div className={`${styles.skeletonBlock} mt-3 h-7 w-10`} />
          </div>
        ))}
      </div>

      <div className={styles.photoWorkspaceToolbar} aria-hidden="true">
        <div className={styles.photoControlBar}>
          <div
            className={`${styles.photoLoadingControl} ${styles.photoLoadingSearch}`}
          />
          <div className={styles.photoLoadingControl} />
          <div className={styles.photoLoadingControl} />
          <div className={styles.photoLoadingControl} />
          <div
            className={`${styles.photoLoadingControl} ${styles.photoLoadingDensity}`}
          />
        </div>
        <div className={styles.photoLoadingSelection} />
      </div>

      <div className={styles.photoListViewport} aria-hidden="true">
        <div className={`${styles.photoList} ${styles.photoLoadingList}`}>
          <div className={styles.photoListHeader}>
            <span />
            <span />
            <span>{copy.photos.columnPhoto}</span>
            <span>{copy.photos.columnLocation}</span>
            <span>{copy.photos.columnCaptured}</span>
            <span>{copy.photos.columnCamera}</span>
            <span>{copy.photos.columnPortfolio}</span>
            <span>{copy.photos.columnHomepage}</span>
            <span />
          </div>

          {loadingRows.map((_, index) => (
            <div
              className={`${styles.photoListRow} ${styles.photoLoadingRow}`}
              key={index}
              style={{ "--loading-row": index } as CSSProperties}
            >
              <div className={styles.photoLoadingCheckbox} />
              <div
                className={`${styles.photoListThumb} ${styles.photoLoadingThumb}`}
              />
              <div className={styles.photoLoadingPrimary}>
                <span />
                <span />
              </div>
              <div className={styles.photoLoadingText} />
              <div className={styles.photoLoadingText} />
              <div className={styles.photoLoadingText} />
              <div className={styles.photoLoadingBadge} />
              <div className={styles.photoLoadingText} />
              <div className={styles.photoLoadingAction} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const PhotosRouteLoading = () => {
  const { copy } = useStudioLocale();

  return (
    <div className={`${styles.page} ${styles.photoPage}`}>
      <StudioPageHeader
        index="02"
        eyebrow={copy.photos.eyebrow}
        title={copy.photos.title}
        description={copy.photos.description}
        compact
        actions={
          <div className={styles.photoLoadingActionBadge}>
            <span aria-hidden="true" />
            {copy.photos.loadingAction}
          </div>
        }
      />
      <PhotosLibraryLoading />
    </div>
  );
};
