import Link from "next/link";

import styles from "./public-site.module.css";

export const SiteFooter = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLead}>
        <h2>One archive. Three paths through it.</h2>
        <p>
          Photography arranged by recurring ideas, lived journeys, and the
          places that hold them together.
        </p>
      </div>

      <nav className={styles.footerNav} aria-label="Footer navigation">
        <Link href="/">Home</Link>
        <Link href="/work">Work</Link>
        <Link href="/journeys">Journeys</Link>
        <Link href="/travel">Atlas</Link>
        <Link href="/discover">Map</Link>
        <Link href="/about">About</Link>
      </nav>

      <div className={styles.footerMeta}>
        <p>Photographer / Software Engineer</p>
        <a href="mailto:yueyong1030@outlook.com">Email</a>
        <a href="https://www.instagram.com/yueyong.lyy" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a href="https://github.com/YueYongDev" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>

      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} YueYong</span>
        <span>Photography / Field Notes</span>
      </div>
    </footer>
  );
};
