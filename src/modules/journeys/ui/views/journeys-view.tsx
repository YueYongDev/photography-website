import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { journeys } from "../../data/journeys";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const formatRange = (startDate: string, endDate?: string) => {
  const start = dateFormatter.format(new Date(`${startDate}T00:00:00`));

  if (!endDate) {
    return start;
  }

  return `${start} - ${dateFormatter.format(new Date(`${endDate}T00:00:00`))}`;
};

export const JourneysView = () => {
  return (
    <div className="min-h-screen overflow-x-hidden rounded-xl bg-background text-foreground">
      <section className="relative flex min-h-[62vh] items-center overflow-hidden rounded-xl">
        <Image
          src="/bg.webp"
          alt="A shrine gate photographed in a quiet green travel scene"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-background/10" />
        <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/20 to-transparent" />

        <div className="relative z-10 flex w-full px-5 pb-10 pt-24 md:px-10 md:pb-12 md:pt-28 lg:px-16">
          <div className="flex max-w-5xl flex-col gap-5">
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal md:text-7xl lg:text-8xl">
              Journeys live here first, then branch into their own worlds.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Each journey keeps its own visual language, build pipeline and
              Vercel deployment, while the public URL stays under the main site
              domain.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 lg:px-16">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="flex flex-col gap-2">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                Active Routes
              </p>
              <h2 className="text-3xl font-semibold tracking-normal md:text-4xl">
                Independent journey sites
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              The cards below link to paths such as
              <span className="text-foreground"> /journeys/uzbekistan-2026</span>.
              The main site rewrites those paths to the matching standalone Vercel
              project.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {journeys.map((journey) => (
              <Card key={journey.slug} className="overflow-hidden rounded-lg lg:col-span-2">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={journey.coverImage}
                    alt={`${journey.title} cover image`}
                    fill
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                    <Badge variant="secondary">{journey.status}</Badge>
                    <Badge variant="outline" className="bg-background/80 backdrop-blur">
                      {journey.theme}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="gap-3">
                  <div className="flex flex-col gap-2">
                    <CardTitle className="text-3xl tracking-normal">
                      {journey.title}
                    </CardTitle>
                    <p className="text-lg text-muted-foreground">{journey.subtitle}</p>
                  </div>
                  <p className="max-w-2xl leading-7 text-muted-foreground">
                    {journey.description}
                  </p>
                </CardHeader>

                <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-4" aria-hidden />
                    <span>{formatRange(journey.startDate, journey.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" aria-hidden />
                    <span>{journey.locations.join(" / ")}</span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button asChild>
                    <Link href={journey.href}>
                      Open Journey
                      <ArrowUpRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
