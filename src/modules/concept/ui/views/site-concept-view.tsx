"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUpRight, Map, Rows3 } from "lucide-react";

import styles from "./site-concept-view.module.css";

type WorkSeries = {
  number: string;
  title: string;
  note: string;
  description: string;
  cover: string;
  secondary: string;
  detail: string;
};

const workSeries: WorkSeries[] = [
  {
    number: "01",
    title: "Quiet Distances",
    note: "Scale, weather, solitude",
    description:
      "Landscapes are not destinations here. They are a way of measuring silence — the space between a person, the horizon, and the moment that passes.",
    cover: "/journeys/newzealand-2026/photos/08-tekapo-quiet.jpg",
    secondary: "/journeys/newzealand-2026/photos/04-glenorchy-peak.jpg",
    detail: "South Island · 2026 · 12 photographs",
  },
  {
    number: "02",
    title: "Passing Through",
    note: "Roads, windows, temporary pauses",
    description:
      "The road is treated as a visual condition rather than an itinerary: interruptions, imperfect viewpoints, borrowed cars, and the landscape seen in transit.",
    cover: "/journeys/newzealand-2026/photos/03-lindis-road.jpg",
    secondary: "/journeys/newzealand-2026/photos/07-wanaka-camera.jpg",
    detail: "On the road · 2024—2026 · 18 photographs",
  },
  {
    number: "03",
    title: "The Observer",
    note: "People looking, making, remembering",
    description:
      "A recurring figure appears inside the landscape: sometimes photographer, sometimes witness. The work turns the camera back toward the act of seeing.",
    cover: "/journeys/newzealand-2026/photos/06-tekapo-portrait.jpg",
    secondary: "/journeys/newzealand-2026/photos/01-cover-mt-cook.jpg",
    detail: "Field studies · Ongoing · 09 photographs",
  },
];

const atlasRows = [
  {
    number: "A01",
    place: "Kyoto",
    country: "Japan",
    years: "2024",
    frames: "48",
    related: "Human Traces",
  },
  {
    number: "A02",
    place: "Samarkand",
    country: "Uzbekistan",
    years: "2026",
    frames: "37",
    related: "Blue Hours",
  },
  {
    number: "A03",
    place: "Tekapo",
    country: "New Zealand",
    years: "2026",
    frames: "26",
    related: "Quiet Distances",
  },
  {
    number: "A04",
    place: "Macau",
    country: "China",
    years: "2023—25",
    frames: "61",
    related: "City Edges",
  },
  {
    number: "A05",
    place: "Istanbul",
    country: "Türkiye",
    years: "2025",
    frames: "31",
    related: "In Between",
  },
];

const coordinates = [
  { x: 175, y: 190, city: "MACAU", coordinate: "22.1987° N" },
  { x: 330, y: 125, city: "KYOTO", coordinate: "35.0116° N" },
  { x: 510, y: 260, city: "SAMARKAND", coordinate: "39.6542° N" },
  { x: 765, y: 155, city: "ISTANBUL", coordinate: "41.0082° N" },
  { x: 1010, y: 390, city: "TEKAPO", coordinate: "44.0047° S" },
];

export const SiteConceptView = () => {
  const [activeWorkIndex, setActiveWorkIndex] = useState(0);
  const [atlasMode, setAtlasMode] = useState<"index" | "map">("index");
  const activeWork = workSeries[activeWorkIndex];

  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <a href="#top" className={styles.wordmark} aria-label="Back to top">
          <span>YUEYONG</span>
          <span className={styles.wordmarkSub}>PHOTO / FIELD NOTES</span>
        </a>

        <nav className={styles.nav} aria-label="Concept navigation">
          <a href="#work">Work</a>
          <a href="#journeys">Journeys</a>
          <a href="#atlas">Atlas</a>
          <a href="#about">About</a>
        </nav>

        <div className={styles.conceptMark}>
          <span>Concept</span>
          <span>01 / 2026</span>
        </div>
      </header>

      <main>
        <section id="top" className={styles.hero}>
          <div className={styles.heroTitleWrap}>
            <p className={styles.eyebrow}>Photography by YueYong</p>
            <h1 className={styles.heroTitle}>
              Photography,
              <br />
              shaped <em>along the way.</em>
            </h1>
          </div>

          <p className={styles.heroIntro}>
            Places become the setting. Attention becomes the work — an
            evolving archive of distance, human traces, and quiet moments in
            motion.
          </p>

          <div className={styles.heroMedia}>
            <figure className={styles.heroPrimary}>
              <Image
                src="/journeys/newzealand-2026/photos/08-tekapo-quiet.jpg"
                alt="A solitary figure beside Lake Tekapo"
                fill
                unoptimized
                priority
                sizes="(min-width: 900px) 52vw, 92vw"
                className={styles.imageCover}
              />
              <figcaption>
                <span>Quiet Distances, No. 04</span>
                <span>Tekapo · 2026</span>
              </figcaption>
            </figure>

            <figure className={styles.heroSecondary}>
              <Image
                src="/journeys/newzealand-2026/photos/06-tekapo-portrait.jpg"
                alt="A photographer making a picture beside Lake Tekapo"
                fill
                unoptimized
                priority
                sizes="(min-width: 900px) 25vw, 46vw"
                className={styles.imageCover}
              />
              <figcaption>The Observer / Study 02</figcaption>
            </figure>

            <div className={styles.heroIndex} aria-hidden="true">
              <span>SELECTED WORK</span>
              <span>01 — 03</span>
            </div>
          </div>

          <a href="#work" className={styles.scrollCue}>
            <span>Enter the work</span>
            <ArrowDown size={16} strokeWidth={1.4} />
          </a>
        </section>

        <section id="work" className={styles.workSection}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionKicker}>01 / Selected Work</p>
            <h2>Recurring ways<br />of seeing.</h2>
            <p>
              A small, edited set of recurring ideas. Places may change; the
              visual questions remain.
            </p>
          </div>

          <div className={styles.workLayout}>
            <div className={styles.workList} role="tablist" aria-label="Selected work series">
              {workSeries.map((work, index) => {
                const isActive = index === activeWorkIndex;

                return (
                  <button
                    key={work.number}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`${styles.workButton} ${
                      isActive ? styles.workButtonActive : ""
                    }`}
                    onClick={() => setActiveWorkIndex(index)}
                  >
                    <span>{work.number}</span>
                    <span className={styles.workButtonTitle}>{work.title}</span>
                    <span>{work.note}</span>
                    <ArrowUpRight size={17} strokeWidth={1.4} />
                  </button>
                );
              })}
            </div>

            <div
              key={activeWork.number}
              className={styles.workPresentation}
              role="tabpanel"
            >
              <figure className={styles.workPrimaryImage}>
                <Image
                  src={activeWork.cover}
                  alt={activeWork.title}
                  fill
                  unoptimized
                  sizes="(min-width: 900px) 42vw, 92vw"
                  className={styles.imageCover}
                />
              </figure>
              <figure className={styles.workSecondaryImage}>
                <Image
                  src={activeWork.secondary}
                  alt="A second frame from the selected series"
                  fill
                  unoptimized
                  sizes="(min-width: 900px) 24vw, 54vw"
                  className={styles.imageCover}
                />
              </figure>

              <div className={styles.workCopy}>
                <p className={styles.workDetail}>{activeWork.detail}</p>
                <h3>{activeWork.title}</h3>
                <p>{activeWork.description}</p>
                <button type="button" className={styles.textLink}>
                  Open the series
                  <ArrowUpRight size={16} strokeWidth={1.4} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="journeys" className={styles.journeySection}>
          <div className={styles.journeyHeading}>
            <p className={styles.sectionKicker}>02 / Journeys</p>
            <h2>Notes from<br />the road.</h2>
            <p>
              Journeys hold the chronology: what happened, who was there, and
              how one frame led to the next.
            </p>
          </div>

          <article className={styles.featuredJourney}>
            <div className={styles.journeyImage}>
              <Image
                src="/journeys/newzealand-2026/photos/01-cover-mt-cook.jpg"
                alt="A cat-shaped pillow facing the mountains of New Zealand"
                fill
                unoptimized
                sizes="100vw"
                className={styles.imageCover}
              />
              <div className={styles.journeyImageShade} />
              <p className={styles.journeyCoordinates}>
                44.0000° S — 170.5000° E
              </p>
              <div className={styles.journeyTitle}>
                <p>FIELD JOURNAL · 26 APR — 02 MAY</p>
                <h3>New Zealand<br />2026</h3>
              </div>
            </div>

            <div className={styles.journeyMeta}>
              <div>
                <p className={styles.metaLabel}>Route / 01</p>
                <p>Queenstown → Glenorchy → Wānaka → Tekapo → Aoraki</p>
              </div>
              <div>
                <p className={styles.metaLabel}>Field note</p>
                <p>
                  Seven days moving north through autumn — a loose record of
                  weather, roadside pauses, and the Southern Alps at dusk.
                </p>
              </div>
              <Link href="/journeys/newzealand-2026" className={styles.journeyLink}>
                Read the journey
                <ArrowUpRight size={17} strokeWidth={1.4} />
              </Link>
            </div>
          </article>

          <div className={styles.filmStrip}>
            {[
              {
                src: "/journeys/newzealand-2026/photos/03-lindis-road.jpg",
                label: "Lindis Pass / Day 03",
              },
              {
                src: "/journeys/newzealand-2026/photos/04-glenorchy-peak.jpg",
                label: "Glenorchy / Day 01",
              },
              {
                src: "/journeys/newzealand-2026/photos/07-wanaka-camera.jpg",
                label: "Wānaka / Day 04",
              },
            ].map((frame, index) => (
              <figure key={frame.src}>
                <div className={styles.filmImage}>
                  <Image
                    src={frame.src}
                    alt={frame.label}
                    fill
                    unoptimized
                    sizes="(min-width: 900px) 33vw, 82vw"
                    className={styles.imageCover}
                  />
                </div>
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{frame.label}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="atlas" className={styles.atlasSection}>
          <div className={styles.atlasIntro}>
            <div>
              <p className={styles.sectionKicker}>03 / Atlas</p>
              <h2>A quiet index<br />of place.</h2>
            </div>
            <div className={styles.atlasStatement}>
              <p>
                The atlas is not another portfolio. It is a geographic way
                back into the work — compact, factual, and deliberately quiet.
              </p>
              <div className={styles.atlasModes} role="group" aria-label="Atlas view">
                <button
                  type="button"
                  aria-pressed={atlasMode === "index"}
                  className={atlasMode === "index" ? styles.modeActive : ""}
                  onClick={() => setAtlasMode("index")}
                >
                  <Rows3 size={15} strokeWidth={1.5} />
                  Index
                </button>
                <button
                  type="button"
                  aria-pressed={atlasMode === "map"}
                  className={atlasMode === "map" ? styles.modeActive : ""}
                  onClick={() => setAtlasMode("map")}
                >
                  <Map size={15} strokeWidth={1.5} />
                  Coordinates
                </button>
              </div>
            </div>
          </div>

          {atlasMode === "index" ? (
            <div className={styles.atlasIndex}>
              <div className={styles.atlasIndexHeader}>
                <span>Ref.</span>
                <span>Place</span>
                <span>Years</span>
                <span>Frames</span>
                <span>Appears in</span>
              </div>
              {atlasRows.map((row) => (
                <button type="button" className={styles.atlasRow} key={row.number}>
                  <span>{row.number}</span>
                  <span className={styles.placeName}>
                    {row.place}
                    <small>{row.country}</small>
                  </span>
                  <span>{row.years}</span>
                  <span>{row.frames}</span>
                  <span className={styles.relatedSeries}>
                    {row.related}
                    <ArrowUpRight size={15} strokeWidth={1.4} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.coordinateMap}>
              <div className={styles.mapLegend}>
                <span>05 active places</span>
                <span>Coordinate study · not to scale</span>
              </div>
              <svg viewBox="0 0 1200 520" role="img" aria-label="A conceptual coordinate map of photographed places">
                <path
                  className={styles.routeLine}
                  d="M175 190 C260 40 410 80 510 260 S680 330 765 155 S915 140 1010 390"
                />
                <path className={styles.gridLine} d="M0 100 H1200 M0 260 H1200 M0 420 H1200" />
                <path className={styles.gridLine} d="M200 0 V520 M600 0 V520 M1000 0 V520" />
                {coordinates.map((point, index) => (
                  <g key={point.city} transform={`translate(${point.x} ${point.y})`}>
                    <circle r="18" className={styles.mapPulse} />
                    <circle r="4.5" className={styles.mapPoint} />
                    <text x="14" y="-10" className={styles.mapCity}>
                      {String(index + 1).padStart(2, "0")} / {point.city}
                    </text>
                    <text x="14" y="10" className={styles.mapCoordinate}>
                      {point.coordinate}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}

          <div className={styles.atlasContactSheet}>
            {[
              "/journeys/newzealand-2026/photos/04-glenorchy-peak.jpg",
              "/journeys/newzealand-2026/photos/06-tekapo-portrait.jpg",
              "/journeys/newzealand-2026/photos/03-lindis-road.jpg",
              "/journeys/newzealand-2026/photos/08-tekapo-quiet.jpg",
            ].map((src, index) => (
              <figure key={src}>
                <Image
                  src={src}
                  alt="A frame from the geographic archive"
                  fill
                  unoptimized
                  sizes="(min-width: 900px) 25vw, 50vw"
                  className={styles.imageCover}
                />
                <figcaption>{String(index + 21).padStart(3, "0")}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="about" className={styles.aboutSection}>
          <p className={styles.sectionKicker}>A single archive / Three ways in</p>
          <h2>
            One archive.
            <br />
            <em>Three paths through it.</em>
          </h2>

          <div className={styles.aboutGrid}>
            <div>
              <span>01</span>
              <h3>Work</h3>
              <p>What I see — edited into recurring photographic ideas.</p>
            </div>
            <div>
              <span>02</span>
              <h3>Journeys</h3>
              <p>What I experienced — chronology, route, people, and field notes.</p>
            </div>
            <div>
              <span>03</span>
              <h3>Atlas</h3>
              <p>Where it happened — a factual index connecting place back to work.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div>
          <span>YUEYONG</span>
          <span>Photographer / Software Engineer</span>
        </div>
        <p>Concept preview — no production pages have been replaced.</p>
        <Link href="/">
          Return to current site
          <ArrowUpRight size={16} strokeWidth={1.4} />
        </Link>
      </footer>
    </div>
  );
};
