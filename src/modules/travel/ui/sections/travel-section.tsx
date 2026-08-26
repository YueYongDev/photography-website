import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Camera, Compass, MapPin } from "lucide-react";
import Footer from "@/modules/home/ui/components/footer";
import type { TravelArchive } from "../views/travel-view";

type ArchiveItem = TravelArchive["items"][number];

const editorialSerif = {
  fontFamily:
    '"Bodoni 72", "Iowan Old Style", "Baskerville", "Times New Roman", serif',
};

const countryFlag = (code: string) =>
  code.length === 2
    ? String.fromCodePoint(
        ...code
          .toUpperCase()
          .split("")
          .map((character) => 127397 + character.charCodeAt(0))
      )
    : "·";

const itemYear = (item: ArchiveItem) =>
  new Date(
    item.coverPhoto?.dateTimeOriginal ?? item.updatedAt ?? item.createdAt
  ).getFullYear();

const countryAnchor = (countryCode: string) =>
  `country-${countryCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

export const TravelSection = ({ archive }: { archive: TravelArchive }) => {
  const items = archive.items.filter((item) => item.coverPhoto);
  const featured = items[0];

  const countries = Array.from(
    items.reduce((groups, item) => {
      const existing = groups.get(item.countryCode);
      if (existing) {
        existing.items.push(item);
        existing.photoCount += item.photoCount;
      } else {
        groups.set(item.countryCode, {
          country: item.country,
          countryCode: item.countryCode,
          photoCount: item.photoCount,
          items: [item],
        });
      }
      return groups;
    }, new Map<string, { country: string; countryCode: string; photoCount: number; items: ArchiveItem[] }>())
  );

  const totalPhotos = items.reduce((total, item) => total + item.photoCount, 0);

  if (!featured) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center rounded-3xl border border-dashed bg-muted/40 px-6 text-center">
        <div className="max-w-md space-y-3">
          <Compass className="mx-auto size-8" />
          <h1 className="text-3xl" style={editorialSerif}>
            The travel archive is being prepared.
          </h1>
          <p className="text-sm text-muted-foreground">
            New field notes will appear here after the next journey.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-[#eeeae1] text-[#171714] dark:bg-[#11110f] dark:text-[#f1eee7]">
      <section className="px-5 pb-8 pt-24 sm:px-8 lg:px-12 lg:pb-12 lg:pt-28">
        <div className="grid gap-8 border-b border-current/20 pb-8 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:pb-12">
          <div>
            <div className="mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.28em] opacity-60">
              <Compass className="size-3.5" />
              Field archive · {String(items.length).padStart(2, "0")} destinations
            </div>
            <h1
              className="max-w-4xl text-[clamp(4.25rem,12vw,10.5rem)] leading-[0.72] tracking-[-0.065em]"
              style={editorialSerif}
            >
              Travel
              <span className="ml-[0.08em] align-top text-[0.22em] italic tracking-normal opacity-50">
                index
              </span>
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-5 border-t border-current/20 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <ArchiveStat label="Territories" value={countries.length} />
            <ArchiveStat label="Cities" value={items.length} />
            <ArchiveStat label="Frames" value={totalPhotos} />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {countries.map(([, group]) => (
            <a
              key={group.countryCode}
              href={`#${countryAnchor(group.countryCode)}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-current/20 px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-current hover:text-[#eeeae1] dark:hover:text-[#11110f]"
            >
              <span className="text-sm" aria-hidden>
                {countryFlag(group.countryCode)}
              </span>
              {group.country}
            </a>
          ))}
        </div>

        <Link
          href={`/travel/${encodeURIComponent(featured.city)}`}
          className="group relative block min-h-[62vh] overflow-hidden rounded-[1.4rem] bg-black text-white"
        >
          <Image
            src={featured.coverPhoto!.url}
            alt={featured.coverPhoto!.title || featured.city}
            fill
            priority
            quality={50}
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_20%,rgba(0,0,0,0.78)_100%)]" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-8">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-white/75">
              <MapPin className="size-3.5" />
              {featured.countryCode} / {itemYear(featured)}
            </div>
            <div className="flex size-11 items-center justify-center rounded-full border border-white/40 bg-black/10 backdrop-blur-sm transition-transform group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_20rem] lg:items-end">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#e86d2b]">
                Latest dispatch · {String(featured.photoCount).padStart(3, "0")} frames
              </p>
              <h2
                className="text-[clamp(3.75rem,10vw,8.5rem)] leading-[0.72] tracking-[-0.055em]"
                style={editorialSerif}
              >
                {featured.city}
              </h2>
            </div>
            <p className="max-w-sm border-l border-white/35 pl-5 text-sm font-light leading-6 text-white/78">
              {featured.description ||
                `A photographic field note from ${featured.city}, ${featured.country} — observed slowly, one street at a time.`}
            </p>
          </div>
        </Link>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:px-12 lg:pb-16">
        <div className="mb-2 flex items-end justify-between border-b border-current/20 pb-5">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.28em] opacity-55">
              Browse by geography
            </p>
            <h2 className="text-4xl sm:text-5xl" style={editorialSerif}>
              The destination ledger
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-xs leading-5 opacity-55 md:block">
            Every city is grouped by territory, then ordered by the most recent
            field note.
          </p>
        </div>

        {countries.map(([, group], countryIndex) => (
          <section
            id={countryAnchor(group.countryCode)}
            key={group.countryCode}
            className="scroll-mt-28 border-b border-current/20 py-8 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10 lg:py-12"
          >
            <div className="mb-6 lg:mb-0">
              <div className="lg:sticky lg:top-28">
                <p className="mb-4 text-[10px] uppercase tracking-[0.24em] opacity-45">
                  Territory {String(countryIndex + 1).padStart(2, "0")}
                </p>
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {countryFlag(group.countryCode)}
                  </span>
                  <div>
                    <h3 className="text-3xl leading-none" style={editorialSerif}>
                      {group.country}
                    </h3>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] opacity-50">
                      {group.items.length} stops · {group.photoCount} frames
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-current/15 border-t border-current/15">
              {group.items.map((item, itemIndex) => (
                <DestinationRow
                  key={item.id}
                  item={item}
                  index={itemIndex + 1}
                />
              ))}
            </div>
          </section>
        ))}
      </section>

      <div className="bg-background p-3 text-foreground">
        <Footer />
      </div>
    </div>
  );
};

const ArchiveStat = ({ label, value }: { label: string; value: number }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">{label}</p>
    <p className="mt-2 text-2xl tabular-nums sm:text-3xl" style={editorialSerif}>
      {String(value).padStart(2, "0")}
    </p>
  </div>
);

const DestinationRow = ({
  item,
  index,
}: {
  item: ArchiveItem;
  index: number;
}) => (
  <Link
    href={`/travel/${encodeURIComponent(item.city)}`}
    className="group grid gap-5 py-5 sm:grid-cols-[9rem_1fr_auto] sm:items-center lg:grid-cols-[12rem_1fr_auto]"
  >
    <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-current/10">
      {item.coverPhoto && (
        <Image
          src={item.coverPhoto.url}
          alt={item.coverPhoto.title || item.city}
          fill
          quality={25}
          sizes="(min-width: 1024px) 192px, (min-width: 640px) 144px, 100vw"
          className="object-cover transition-[filter,transform] duration-500 group-hover:scale-105 group-hover:saturate-50"
        />
      )}
      <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[9px] tracking-[0.15em] text-white backdrop-blur-sm">
        {String(index).padStart(2, "0")}
      </span>
    </div>

    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] opacity-45">
        <Camera className="size-3" />
        {itemYear(item)} · {item.photoCount} frames
      </div>
      <h4
        className="truncate text-4xl leading-none tracking-[-0.035em] sm:text-5xl"
        style={editorialSerif}
      >
        {item.city}
      </h4>
      {item.description && (
        <p className="mt-2 line-clamp-1 max-w-2xl text-xs opacity-50">
          {item.description}
        </p>
      )}
    </div>

    <div className="flex items-center justify-between gap-5 sm:justify-end">
      <span className="text-[10px] uppercase tracking-[0.22em] opacity-45 sm:hidden">
        Open field note
      </span>
      <span className="flex size-10 items-center justify-center rounded-full border border-current/25 transition-all duration-300 group-hover:border-current group-hover:bg-current group-hover:text-[#eeeae1] dark:group-hover:text-[#11110f]">
        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
      </span>
    </div>
  </Link>
);
