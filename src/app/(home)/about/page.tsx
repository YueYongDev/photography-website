import type { Metadata } from "next";
import Image from "next/image";

import styles from "@/modules/site/ui/public-site.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "About YueYong — photographer, traveler, and software engineer.",
};

const AboutPage = () => {
  return (
    <section className={styles.page}>
      <div className={styles.aboutHero}>
        <div className={styles.aboutPortrait}>
          <Image
            src="/about-yueyong.jpg"
            alt="YueYong standing in front of the University of Sydney Quadrangle"
            fill
            unoptimized
            priority
            sizes="(min-width: 900px) 38vw, 90vw"
            className={`${styles.imageCover} ${styles.aboutPortraitImage}`}
          />
        </div>

        <div className={styles.aboutCopy}>
          <p className={styles.eyebrow}>05 / About</p>
          <h1>A life observed through photographs.</h1>
          <p>
            I&apos;m YueYong, a photographer and software engineer. I make images
            while moving through cities, roads, and open landscapes — looking
            for the quiet structures that connect a place to the people inside it.
          </p>
          <p>
            Travel gives the work its circumstances, but attention gives it its
            subject: distance, weather, memory, and the small human gestures that
            make a scene feel lived in.
          </p>
        </div>
      </div>

      <div className={styles.aboutColumns}>
        <div className={styles.aboutColumn}>
          <span>01</span>
          <h2>Practice</h2>
          <p>
            Candid moments, road studies, and landscapes shaped into recurring
            photographic ideas rather than separated only by destination.
          </p>
        </div>
        <div className={styles.aboutColumn}>
          <span>02</span>
          <h2>Tools</h2>
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
          <h2>Contact</h2>
          <ul>
            <li><a href="mailto:yueyong1030@outlook.com">Email</a></li>
            <li><a href="https://www.instagram.com/yueyong.lyy" target="_blank" rel="noreferrer">Instagram</a></li>
            <li><a href="https://github.com/YueYongDev" target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a href="https://www.xiaohongshu.com/user/profile/5c1313b60000000007003641" target="_blank" rel="noreferrer">Xiaohongshu</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
