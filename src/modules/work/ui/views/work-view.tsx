import Image from "next/image";
import Link from "next/link";

import styles from "@/modules/site/ui/public-site.module.css";

export type WorkPhoto = {
  id: string | null;
  url: string;
  title: string | null;
  city: string | null;
  countryCode: string | null;
  dateTimeOriginal: Date | string | null;
  sequence: number;
};

const photoYear = (value: WorkPhoto["dateTimeOriginal"]) => {
  if (!value) return "Archive";
  const year = new Date(value).getFullYear();
  return Number.isNaN(year) ? "Archive" : String(year);
};

export const WorkView = ({ photos }: { photos: WorkPhoto[] }) => {
  return (
    <section className={styles.page}>
      <p className={styles.eyebrow}>01 / Selected Work</p>
      <h1 className={styles.displayTitle}>
        Recurring ways
        <br />
        <em>of seeing.</em>
      </h1>
      <p className={styles.lede}>
        Photographs selected for what they notice rather than where they were
        made — distance, passing time, human traces, and the act of looking.
      </p>

      <div className={styles.workGrid}>
        {photos.map((photo) => {
          const frame = (
            <>
              <div className={styles.workFrameImage}>
                <Image
                  src={photo.url}
                  alt={photo.title || "Selected photograph"}
                  fill
                  unoptimized
                  sizes="(min-width: 900px) 46vw, 92vw"
                  className={styles.imageCover}
                />
              </div>
              <div className={styles.workFrameMeta}>
                <strong>{String(photo.sequence).padStart(2, "0")} / {photo.title || "Untitled"}</strong>
                <span>{photo.city || "Field study"} · {photoYear(photo.dateTimeOriginal)}</span>
              </div>
            </>
          );

          return photo.id ? (
            <Link href={`/photograph/${photo.id}`} className={styles.workFrame} key={photo.id}>
              {frame}
            </Link>
          ) : (
            <div className={styles.workFrame} key={`${photo.url}-${photo.sequence}`}>
              {frame}
            </div>
          );
        })}
      </div>
    </section>
  );
};
