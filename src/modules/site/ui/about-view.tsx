"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useSiteLocale } from "@/modules/site/i18n/site-locale";
import styles from "./public-site.module.css";

export const AboutView = () => {
  const { copy } = useSiteLocale();

  return (
    <section className={`${styles.page} ${styles.aboutPage}`}>
      <div className={styles.aboutHero}>
        <figure className={styles.aboutPortrait}>
          <Image
            src="/about-yueyong.jpg"
            alt={copy.about.portraitAlt}
            fill
            priority
            sizes="(min-width: 900px) 38vw, 90vw"
            className={`${styles.imageCover} ${styles.aboutPortraitImage}`}
          />
          <figcaption>{copy.about.portraitCaption}</figcaption>
        </figure>

        <div className={styles.aboutCopy}>
          <p className={styles.eyebrow}>{copy.about.eyebrow}</p>
          <h1>{copy.about.title}</h1>
          <div className={styles.aboutIntro}>
            <p>{copy.about.paragraphOne}</p>
            <p>{copy.about.paragraphTwo}</p>
          </div>

          <dl className={styles.aboutIdentity}>
            <div>
              <dt>{copy.about.nameLabel}</dt>
              <dd>YueYong</dd>
            </div>
            <div>
              <dt>{copy.about.roleLabel}</dt>
              <dd>{copy.about.roleValue}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className={styles.aboutColumns}>
        <div className={styles.aboutColumn}>
          <span>01</span>
          <h2>{copy.about.practice}</h2>
          <nav className={styles.aboutSiteLinks} aria-label={copy.about.practice}>
            {[
              {
                href: "/work",
                label: copy.navigation.work,
                note: copy.about.workNote,
              },
              {
                href: "/places",
                label: copy.navigation.travel,
                note: copy.about.placesNote,
              },
              {
                href: "/journeys",
                label: copy.navigation.journeys,
                note: copy.about.journeysNote,
              },
            ].map((item) => (
              <Link href={item.href} key={item.href}>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </span>
                <ArrowUpRight size={15} strokeWidth={1.4} />
              </Link>
            ))}
          </nav>
        </div>
        <div className={styles.aboutColumn}>
          <span>02</span>
          <h2>{copy.about.tools}</h2>
          <ul>
            <li>Sony Alpha ILCE-6700</li>
            <li>Tamron 18–300mm</li>
            <li>Sigma 18–50mm F2.8</li>
            <li>Viltrox 27mm F1.2</li>
            <li>DJI Mini 4 Pro</li>
          </ul>
        </div>
        <div className={styles.aboutColumn}>
          <span>03</span>
          <h2>{copy.about.contact}</h2>
          <ul>
            <li>
              <a href="mailto:yueyong1030@outlook.com">{copy.shell.email}</a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/yueyong.lyy"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://github.com/YueYongDev"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.xiaohongshu.com/user/profile/5c1313b60000000007003641"
                target="_blank"
                rel="noreferrer"
              >
                {copy.about.xiaohongshu}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
