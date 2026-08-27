"use client";

import Image from "next/image";

import { useSiteLocale } from "@/modules/site/i18n/site-locale";
import styles from "./public-site.module.css";

export const AboutView = () => {
  const { copy } = useSiteLocale();

  return (
    <section className={styles.page}>
      <div className={styles.aboutHero}>
        <div className={styles.aboutPortrait}>
          <Image
            src="/about-yueyong.jpg"
            alt={copy.about.portraitAlt}
            fill
            priority
            sizes="(min-width: 900px) 38vw, 90vw"
            className={`${styles.imageCover} ${styles.aboutPortraitImage}`}
          />
        </div>

        <div className={styles.aboutCopy}>
          <p className={styles.eyebrow}>{copy.about.eyebrow}</p>
          <h1>{copy.about.title}</h1>
          <p>{copy.about.paragraphOne}</p>
          <p>{copy.about.paragraphTwo}</p>
        </div>
      </div>

      <div className={styles.aboutColumns}>
        <div className={styles.aboutColumn}>
          <span>01</span>
          <h2>{copy.about.practice}</h2>
          <p>{copy.about.practiceDescription}</p>
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
