"use client";

import type { ReactNode } from "react";

import {
  SiteLocaleProvider,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { SiteMotion } from "./site-motion";
import styles from "./public-site.module.css";

const SiteShellContent = ({ children }: { children: ReactNode }) => {
  const { locale } = useSiteLocale();

  return (
    <div className={styles.shell} data-locale={locale}>
      <SiteHeader />
      <main className={styles.main}>{children}</main>
      <SiteFooter />
    </div>
  );
};

export const SiteShell = ({ children }: { children: ReactNode }) => (
  <SiteLocaleProvider>
    <SiteMotion>
      <SiteShellContent>{children}</SiteShellContent>
    </SiteMotion>
  </SiteLocaleProvider>
);
