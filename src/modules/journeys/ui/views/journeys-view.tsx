import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";

import {
  PageTransitionContainer,
  PageTransitionItem,
} from "@/components/page-transition";
import { journeys } from "../../data/journeys";
import type { JourneyStatus } from "../../data/journeys";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const formatRange = (startDate: string, endDate?: string) => {
  const start = dateFormatter.format(new Date(`${startDate}T00:00:00`));
  if (!endDate) return start;
  return `${start} — ${dateFormatter.format(new Date(`${endDate}T00:00:00`))}`;
};

const statusDot: Record<JourneyStatus, string> = {
  live: "bg-emerald-400",
  planning: "bg-amber-400",
  archived: "bg-neutral-400",
};

const statusLabel: Record<JourneyStatus, string> = {
  live: "open now",
  planning: "in production",
  archived: "archive",
};

export const JourneysView = () => {
  const featuredJourney =
    journeys.find((journey) => journey.featured) ?? journeys[0];

  return (
    <PageTransitionContainer className="h-full overflow-y-auto rounded-xl bg-background text-foreground">
      <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden rounded-xl bg-black text-white">
        <Image
          src={featuredJourney.coverImage}
          alt={`${featuredJourney.title} cover`}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/5" />
        <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/80 to-transparent" />

        <PageTransitionItem className="relative z-10 flex min-h-[calc(100svh-5rem)] flex-col justify-between px-5 pb-8 pt-24 md:px-10 md:pb-8 md:pt-28 lg:px-16">
          <div className="flex items-start justify-between gap-8">
            <p className="max-w-36 text-xs font-medium uppercase leading-5 tracking-[0.28em] text-white/65">
              {journeys.length} field journals
            </p>
            <p className="hidden max-w-xs text-right text-sm leading-6 text-white/65 md:block">
              Standalone visual notebooks, each with its own route, rhythm and
              atmosphere.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.32em] text-white/65">
                {featuredJourney.theme}
              </p>
              <h1 className="max-w-5xl text-6xl font-semibold leading-[0.82] tracking-normal text-white md:text-8xl lg:text-9xl">
                Journeys
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg">
                A rotating atlas of standalone travel sites, built around the
                light, pace and texture of each place.
              </p>
            </div>

            {featuredJourney.status === "live" && (
              <Link
                href={featuredJourney.href}
                className="group/hero inline-flex w-fit items-center justify-between gap-5 border-y border-white/30 py-4 text-sm uppercase tracking-[0.22em] text-white transition-colors hover:border-white/70 lg:w-full"
              >
                <span>
                  Open
                  <span className="block text-white/55">
                    {featuredJourney.title}
                  </span>
                </span>
                <ArrowUpRight
                  className="size-5 shrink-0 transition-transform duration-300 group-hover/hero:-translate-y-1 group-hover/hero:translate-x-1"
                  aria-hidden
                />
              </Link>
            )}
          </div>

          <div className="grid gap-3 border-t border-white/25 pt-5 text-sm text-white/70 md:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                featured route
              </p>
              <p className="mt-1 text-white">{featuredJourney.title}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                field dates
              </p>
              <p className="mt-1">
                {formatRange(featuredJourney.startDate, featuredJourney.endDate)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                locations
              </p>
              <p className="mt-1">{featuredJourney.locations.join(" / ")}</p>
            </div>
          </div>
        </PageTransitionItem>
      </section>

      <section className="px-5 pb-14 pt-6 md:px-10 md:pb-16 md:pt-8 lg:px-16 lg:pb-20 lg:pt-10">
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <PageTransitionItem className="lg:sticky lg:top-24 lg:h-fit">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Route index
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-none tracking-normal md:text-4xl">
              One shelf, separate worlds.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The hub stays quiet so each journey can carry its own visual
              language when opened.
            </p>
          </PageTransitionItem>

          <div className="border-t border-foreground/15">
            {journeys.map((journey, index) => {
              const isLive = journey.status === "live";
              const number = String(index + 1).padStart(2, "0");
              const mediaOrder = index % 2 === 0 ? "md:order-1" : "md:order-2";
              const copyOrder = index % 2 === 0 ? "md:order-2" : "md:order-1";
              const copyPadding =
                index % 2 === 0 ? "md:pl-6 lg:pl-10" : "md:pr-6 lg:pr-10";

              const row = (
                <article className="grid gap-5 border-b border-foreground/15 py-7 transition-colors duration-300 group-hover:border-foreground/30 md:grid-cols-12 md:items-center md:py-9 lg:min-h-[23rem]">
                  <div
                    className={`relative h-64 overflow-hidden bg-muted md:col-span-5 md:h-80 ${mediaOrder}`}
                  >
                    <Image
                      src={journey.coverImage}
                      alt={`${journey.title} cover`}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 36vw, (min-width: 768px) 42vw, 100vw"
                      className={`object-cover transition duration-700 ${
                        isLive
                          ? "group-hover:scale-[1.04]"
                          : "opacity-55 grayscale"
                      }`}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 text-xs uppercase tracking-[0.24em] text-white/75">
                      {number}
                    </span>
                    {!isLive && (
                      <span className="absolute bottom-4 left-4 border border-white/35 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/70 backdrop-blur-sm">
                        coming soon
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex flex-col md:col-span-7 ${copyOrder} ${copyPadding}`}
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      <span
                        className={`size-1.5 rounded-full ${statusDot[journey.status]}`}
                      />
                      {statusLabel[journey.status]}
                    </div>

                    <h3
                      className={`mt-4 text-4xl font-semibold leading-none tracking-normal transition-opacity duration-300 md:text-5xl lg:text-6xl ${
                        isLive ? "group-hover:opacity-65" : "opacity-70"
                      }`}
                    >
                      {journey.title}
                    </h3>
                    <p className="mt-3 text-lg text-muted-foreground">
                      {journey.subtitle}
                    </p>
                    <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                      {journey.description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="size-4 shrink-0" aria-hidden />
                        {formatRange(journey.startDate, journey.endDate)}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0" aria-hidden />
                        {journey.locations.join(" / ")}
                      </span>
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-4 border-t border-foreground/10 pt-4">
                      <p className="max-w-md text-xs uppercase leading-5 tracking-[0.2em] text-muted-foreground">
                        {journey.theme}
                      </p>
                      {isLive && (
                        <ArrowUpRight
                          className="size-5 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                          aria-hidden
                        />
                      )}
                    </div>
                  </div>
                </article>
              );

              return isLive ? (
                <Link key={journey.slug} href={journey.href} className="group block">
                  {row}
                </Link>
              ) : (
                <div key={journey.slug} className="group cursor-default">
                  {row}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PageTransitionContainer>
  );
};
