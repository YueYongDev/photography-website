import styles from "@/modules/dashboard/ui/studio.module.css";

export default function Loading() {
  return (
    <div className={styles.page} aria-label="Loading Studio">
      <div className={styles.pageHeader}>
        <div>
          <div className={`${styles.skeletonBlock} h-3 w-28`} />
          <div className={`${styles.skeletonBlock} mt-6 h-24 w-[min(34rem,75vw)]`} />
          <div className={`${styles.skeletonBlock} mt-5 h-4 w-[min(30rem,70vw)]`} />
        </div>
        <div className={`${styles.skeletonBlock} h-11 w-36`} />
      </div>
      <div className={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${styles.stat} ${styles.skeletonBlock}`} />
        ))}
      </div>
      <div className={styles.chartsGrid}>
        <div className={`${styles.chartPanel} ${styles.skeletonBlock} h-[24rem]`} />
        <div className={`${styles.chartPanel} ${styles.skeletonBlock} h-[24rem]`} />
      </div>
    </div>
  );
}
