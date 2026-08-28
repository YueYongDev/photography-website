"use client";

import type { Session } from "../lib/auth-types";
import SecurityAccessCard from "./security-access-card";
import { StudioPageHeader } from "@/modules/dashboard/ui/components/studio-page-header";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";
import styles from "@/modules/dashboard/ui/studio.module.css";

export const StudioAccountView = ({
  session,
  activeSessions,
}: {
  session: Session | null;
  activeSessions: Session["session"][];
}) => {
  const { copy } = useStudioLocale();

  return (
    <div className={styles.page}>
      <StudioPageHeader
        index="04"
        eyebrow={copy.account.eyebrow}
        title={copy.account.title}
        description={copy.account.description}
      />
      <div className={styles.profileGrid}>
        <aside className={styles.profileAside}>
          <h2>{copy.account.keyTitle}</h2>
          <p>{copy.account.keyDescription}</p>
        </aside>
        <SecurityAccessCard
          session={session}
          activeSessions={activeSessions}
        />
      </div>
    </div>
  );
};
