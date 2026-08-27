"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "./public-site.module.css";

const navigation = [
  { label: "Work", href: "/work" },
  { label: "Journeys", href: "/journeys" },
  { label: "Atlas", href: "/travel" },
  { label: "About", href: "/about" },
];

export const SiteHeader = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
        <Link href="/" className={styles.brand} aria-label="YueYong Photography home">
          YUEYONG <span>Photography / Field Notes</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary navigation">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="site-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {menuOpen && (
        <nav id="site-mobile-menu" className={styles.mobilePanel} aria-label="Mobile navigation">
          {navigation.map((item, index) => (
            <Link key={item.href} href={item.href}>
              {item.label}
              <span>{String(index + 1).padStart(2, "0")}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
};
