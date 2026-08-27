import type { ReactNode } from "react";

import styles from "../studio.module.css";

export const StudioPageHeader = ({
  index,
  eyebrow,
  title,
  description,
  actions,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
}) => {
  return (
    <header className={styles.pageHeader}>
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
