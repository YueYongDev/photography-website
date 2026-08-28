"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useSiteLocale } from "@/modules/site/i18n/site-locale";
import styles from "./public-site.module.css";

const navigation = [
  { key: "work", href: "/work" },
  { key: "travel", href: "/places" },
  { key: "map", href: "/map" },
  { key: "journeys", href: "/journeys" },
  { key: "about", href: "/about" },
] as const;

export const SiteHeader = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { copy, locale, setLocale } = useSiteLocale();

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label={copy.shell.homeLabel}>
          YUEYONG <span>{copy.shell.brandDetail}</span>
        </Link>

        <div className={styles.headerActions}>
          <nav className={styles.nav} aria-label={copy.navigation.label}>
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                >
                  {copy.navigation[item.key]}
                </Link>
              );
            })}
          </nav>

          <div className={styles.languageSwitch} aria-label={copy.language.label} role="group">
            <button
              type="button"
              aria-pressed={locale === "en"}
              className={locale === "en" ? styles.languageActive : ""}
              onClick={() => setLocale("en")}
            >
              {copy.language.english}
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              aria-pressed={locale === "zh-CN"}
              className={locale === "zh-CN" ? styles.languageActive : ""}
              onClick={() => setLocale("zh-CN")}
            >
              {copy.language.chinese}
            </button>
          </div>

          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? copy.navigation.close : copy.navigation.menu}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav id="site-mobile-menu" className={styles.mobilePanel} aria-label={copy.navigation.label}>
          {navigation.map((item, index) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
              >
                {copy.navigation[item.key]}
                <span>{String(index + 1).padStart(2, "0")}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
};
