import type { ReactNode } from "react";

import styles from "../studio.module.css";

export const StudioPageHeader = ({
  index,
  eyebrow,
  title,
  description,
  actions,
  compact = false,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
}) => {
  return (
    <header
      className={`${styles.pageHeader} ${compact ? styles.pageHeaderCompact : ""}`}
    >
      <div className={styles.pageHeaderCopy}>
        <p className={styles.eyebrow}>
          {index} / {eyebrow}
        </p>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageDescription}>{description}</p>
      </div>
      {actions ? <div className={styles.pageActions}>{actions}</div> : null}
    </header>
  );
};
