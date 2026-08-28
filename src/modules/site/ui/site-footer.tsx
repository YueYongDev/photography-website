"use client";

import Link from "next/link";

import { useSiteLocale } from "@/modules/site/i18n/site-locale";
import styles from "./public-site.module.css";

export const SiteFooter = () => {
  const { copy } = useSiteLocale();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerLead}>
        <h2>{copy.shell.footerTitle}</h2>
        <p>{copy.shell.footerDescription}</p>
      </div>

      <nav className={styles.footerNav} aria-label={copy.navigation.label}>
        <Link href="/">{copy.navigation.home}</Link>
        <Link href="/work">{copy.navigation.work}</Link>
        <Link href="/places">{copy.navigation.travel}</Link>
        <Link href="/map">{copy.navigation.map}</Link>
        <Link href="/journeys">{copy.navigation.journeys}</Link>
        <Link href="/about">{copy.navigation.about}</Link>
        <Link href="/studio/overview">{copy.navigation.studio}</Link>
      </nav>

      <div className={styles.footerMeta}>
        <p>{copy.shell.role}</p>
        <a href="mailto:yueyong1030@outlook.com">{copy.shell.email}</a>
        <a href="https://www.instagram.com/yueyong.lyy" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a href="https://github.com/YueYongDev" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>

      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} YueYong</span>
        <span>{copy.shell.brandDetail}</span>
      </div>
    </footer>
  );
};
