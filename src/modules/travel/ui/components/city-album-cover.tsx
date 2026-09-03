"use client";

import Image from "next/image";
import { useState } from "react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import { getCoverCandidates } from "@/modules/travel/lib/cover-candidates";
import styles from "@/modules/site/ui/public-site.module.css";

export const CityAlbumCover = ({
  urls,
  cityName,
  priority,
}: {
  urls: string[];
  cityName: string;
  priority: boolean;
}) => {
  const [attempt, setAttempt] = useState(0);
  const candidates = getCoverCandidates(urls);
  const candidate = candidates[attempt];

  if (!candidate) return null;

  return (
    <Image
      key={`${candidate.src}-${candidate.unoptimized}`}
      src={candidate.src}
      alt={cityName}
      fill
      loader={getArchiveImageLoader(candidate.src)}
      unoptimized={candidate.unoptimized}
      priority={priority}
      sizes="(max-width: 600px) 92vw, (max-width: 900px) 46vw, 31vw"
      className={styles.imageCover}
      onError={() => setAttempt((current) => current + 1)}
    />
  );
};
