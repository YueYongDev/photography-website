"use client";

import Link from "next/link";
import {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  CheckIcon,
  Clock3Icon,
  Globe2Icon,
  Grid2X2Icon,
  Grid3X3Icon,
  ListIcon,
  LockIcon,
  PencilIcon,
  SearchIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import BlurImage from "@/components/blur-image";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Checkbox } from "@/components/ui/checkbox";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";
import styles from "@/modules/dashboard/ui/studio.module.css";
import { trpc } from "@/trpc/client";

type VisibilityFilter = "all" | "public" | "private";
type SortOrder = "newest" | "oldest";
type PhotoViewMode = "list" | "comfortable" | "compact";

type StudioPhoto = {
  id: string;
  url: string;
  title: string;
  description: string;
  visibility: string;
  dateTimeOriginal: Date | null;
  make: string | null;
  model: string | null;
  lensModel: string | null;
  focalLength35mm: number | null;
  city: string | null;
  countryCode: string | null;
  isFavorite: boolean;
  blurData: string;
  width: number;
  height: number;
  aspectRatio: number;
  updatedAt: Date;
};

export const PhotosSection = () => {
  const { copy } = useStudioLocale();

  return (
    <ErrorBoundary
      fallback={<div className={styles.errorState}>{copy.photos.error}</div>}
    >
      <PhotosSectionContent />
    </ErrorBoundary>
  );
};

const PhotosSectionSkeleton = () => {
  const { copy } = useStudioLocale();

  return (
    <div aria-label={copy.photos.loading} aria-busy="true">
      <div className={styles.librarySummary} aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className={styles.libraryMetric} key={index}>
            <div className={`${styles.skeletonBlock} h-3 w-16`} />
            <div className={`${styles.skeletonBlock} mt-3 h-7 w-10`} />
          </div>
        ))}
      </div>
      <div className={styles.photoWorkspaceToolbar} aria-hidden="true">
        <div className={`${styles.skeletonBlock} h-10 w-full max-w-md rounded-full`} />
      </div>
      <div className={styles.photoManagerGrid} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => (
          <div className={styles.photoManagerCard} key={index}>
            <div className={`${styles.photoManagerImage} ${styles.skeletonBlock}`} />
            <div className={styles.photoManagerMeta}>
              <div className={`${styles.skeletonBlock} h-4 w-2/3`} />
              <div className={`${styles.skeletonBlock} mt-2 h-2.5 w-1/2`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PhotosSectionContent = () => {
  const { copy } = useStudioLocale();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [viewMode, setViewMode] = useState<PhotoViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const { data: stats } = trpc.photos.getStudioStats.useQuery();
  const { data: photos, ...query } =
    trpc.photos.getManyWithPrivate.useInfiniteQuery(
      {
        limit: 40,
        search: deferredSearch || undefined,
        visibility,
        favoriteOnly,
        sort,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const bulkUpdate = trpc.photos.bulkUpdate.useMutation();
  const items = useMemo(
    () => photos?.pages.flatMap((page) => page.items) ?? [],
    [photos],
  );

  useEffect(() => {
    setSelectedIds(new Set());
  }, [deferredSearch, favoriteOnly, sort, visibility]);

  useEffect(() => {
    for (let index = 0; index < Math.min(6, items.length); index += 1) {
      const image = new Image();
      image.src = items[index].url;
    }
  }, [items]);

  if (!photos) return <PhotosSectionSkeleton />;

  const allLoadedSelected =
    items.length > 0 && items.every((photo) => selectedIds.has(photo.id));
  const someLoadedSelected =
    !allLoadedSelected && items.some((photo) => selectedIds.has(photo.id));
  const hasActiveFilters =
    Boolean(deferredSearch) || visibility !== "all" || favoriteOnly;

  const togglePhoto = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllLoaded = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allLoadedSelected) {
        items.forEach((photo) => next.delete(photo.id));
      } else {
        items.forEach((photo) => next.add(photo.id));
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setVisibility("all");
    setFavoriteOnly(false);
  };

  const applyBulkUpdate = async (
    changes: { visibility?: "public" | "private"; isFavorite?: boolean },
  ) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      await bulkUpdate.mutateAsync({ ids, changes });
      await Promise.all([
        utils.photos.getManyWithPrivate.invalidate(),
        utils.photos.getMany.invalidate(),
        utils.photos.getLikedPhotos.invalidate(),
        utils.photos.getStudioStats.invalidate(),
      ]);
      setSelectedIds(new Set());
      toast.success(copy.photos.batchUpdated(ids.length));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : copy.photos.batchError,
      );
    }
  };

  return (
    <section className={styles.photoLibrary} aria-label={copy.photos.libraryLabel}>
      <div className={styles.librarySummary}>
        <LibraryMetric label={copy.photos.totalStat} value={stats?.total} />
        <LibraryMetric label={copy.photos.publicStat} value={stats?.public} />
        <LibraryMetric label={copy.photos.privateStat} value={stats?.private} />
        <LibraryMetric label={copy.photos.favoriteStat} value={stats?.favorite} />
      </div>

      <div className={styles.photoWorkspaceToolbar}>
        <div className={styles.photoControlBar}>
          <label className={styles.photoSearch}>
            <SearchIcon size={15} aria-hidden="true" />
            <span className="sr-only">{copy.photos.searchLabel}</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.photos.searchPlaceholder}
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label={copy.photos.clearSearch}
              >
                <XIcon size={14} />
              </button>
            ) : null}
          </label>

          <label className={styles.photoSelectControl}>
            <Globe2Icon size={14} aria-hidden="true" />
            <span className="sr-only">{copy.photos.visibilityFilter}</span>
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as VisibilityFilter)
              }
            >
              <option value="all">{copy.photos.allVisibility}</option>
              <option value="public">{copy.photos.public}</option>
              <option value="private">{copy.photos.private}</option>
            </select>
          </label>

          <label className={styles.photoSelectControl}>
            <Clock3Icon size={14} aria-hidden="true" />
            <span className="sr-only">{copy.photos.sortLabel}</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOrder)}
            >
              <option value="newest">{copy.photos.newest}</option>
              <option value="oldest">{copy.photos.oldest}</option>
            </select>
          </label>

          <button
            type="button"
            className={styles.photoFilterButton}
            data-active={favoriteOnly || undefined}
            aria-pressed={favoriteOnly}
            onClick={() => setFavoriteOnly((current) => !current)}
          >
            <StarIcon size={14} fill={favoriteOnly ? "currentColor" : "none"} />
            {copy.photos.favoriteOnly}
          </button>

          <div className={styles.densitySwitch} aria-label={copy.photos.densityLabel}>
            <button
              type="button"
              data-active={viewMode === "list" || undefined}
              aria-pressed={viewMode === "list"}
              aria-label={copy.photos.listView}
              title={copy.photos.listView}
              onClick={() => setViewMode("list")}
            >
              <ListIcon size={15} />
            </button>
            <button
              type="button"
              data-active={viewMode === "comfortable" || undefined}
              aria-pressed={viewMode === "comfortable"}
              aria-label={copy.photos.comfortable}
              title={copy.photos.comfortable}
              onClick={() => setViewMode("comfortable")}
            >
              <Grid2X2Icon size={15} />
            </button>
            <button
              type="button"
              data-active={viewMode === "compact" || undefined}
              aria-pressed={viewMode === "compact"}
              aria-label={copy.photos.compact}
              title={copy.photos.compact}
              onClick={() => setViewMode("compact")}
            >
              <Grid3X3Icon size={15} />
            </button>
          </div>
        </div>

        <div
          className={styles.selectionBar}
          data-active={selectedIds.size > 0 || undefined}
        >
          <label className={styles.selectAllControl}>
            <Checkbox
              checked={
                allLoadedSelected
                  ? true
                  : someLoadedSelected
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={toggleAllLoaded}
              aria-label={copy.photos.selectAll}
            />
            <span>
              {selectedIds.size > 0
                ? copy.photos.selectedCount(selectedIds.size)
                : copy.photos.resultCount(items.length)}
            </span>
          </label>

          {selectedIds.size > 0 ? (
            <div className={styles.batchActions}>
              <button
                type="button"
                disabled={bulkUpdate.isPending}
                onClick={() => applyBulkUpdate({ visibility: "public" })}
              >
                <Globe2Icon size={13} />
                {copy.photos.makePublic}
              </button>
              <button
                type="button"
                disabled={bulkUpdate.isPending}
                onClick={() => applyBulkUpdate({ visibility: "private" })}
              >
                <LockIcon size={13} />
                {copy.photos.makePrivate}
              </button>
              <button
                type="button"
                disabled={bulkUpdate.isPending}
                onClick={() => applyBulkUpdate({ isFavorite: true })}
              >
                <StarIcon size={13} />
                {copy.photos.addFavorite}
              </button>
              <button
                type="button"
                disabled={bulkUpdate.isPending}
                onClick={() => applyBulkUpdate({ isFavorite: false })}
              >
                {copy.photos.removeFavorite}
              </button>
              <button
                type="button"
                className={styles.clearSelection}
                onClick={() => setSelectedIds(new Set())}
                aria-label={copy.photos.clearSelection}
              >
                <XIcon size={14} />
              </button>
            </div>
          ) : (
            <span className={styles.selectionHint}>{copy.photos.selectionHint}</span>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.photoEmptyState}>
          <div>
            <SearchIcon size={19} aria-hidden="true" />
            <h2>{stats?.total === 0 ? copy.photos.empty : copy.photos.noResults}</h2>
            {hasActiveFilters ? (
              <button type="button" onClick={clearFilters}>
                {copy.photos.clearFilters}
              </button>
            ) : null}
          </div>
        </div>
      ) : viewMode === "list" ? (
        <div className={styles.photoListViewport}>
          <div className={styles.photoList} role="table">
            <div className={styles.photoListHeader} role="row">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span role="columnheader">{copy.photos.columnPhoto}</span>
              <span role="columnheader">{copy.photos.columnVisibility}</span>
              <span role="columnheader">{copy.photos.columnLocation}</span>
              <span role="columnheader">{copy.photos.columnCaptured}</span>
              <span role="columnheader">{copy.photos.columnCamera}</span>
              <span role="columnheader">{copy.photos.columnHomepage}</span>
              <span className="sr-only" role="columnheader">
                {copy.photos.columnActions}
              </span>
            </div>
            {items.map((photo) => (
              <PhotoListRow
                key={photo.id}
                photo={photo}
                selected={selectedIds.has(photo.id)}
                onToggle={() => togglePhoto(photo.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`${styles.photoManagerGrid} ${
            viewMode === "compact" ? styles.photoManagerGridCompact : ""
          }`}
        >
          {items.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              selected={selectedIds.has(photo.id)}
              onToggle={() => togglePhoto(photo.id)}
            />
          ))}
        </div>
      )}

      <InfiniteScroll
        className={styles.loadMore}
        hasNextPage={query.hasNextPage || false}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage || false}
      />
    </section>
  );
};

const LibraryMetric = ({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) => (
  <div className={styles.libraryMetric}>
    <span>{label}</span>
    <strong>{value ?? "—"}</strong>
  </div>
);

const PhotoListRow = memo(
  ({
    photo,
    selected,
    onToggle,
  }: {
    photo: StudioPhoto;
    selected: boolean;
    onToggle: () => void;
  }) => {
    const { copy, locale } = useStudioLocale();
    const href = `/studio/photos/${photo.id}`;
    const captured = photo.dateTimeOriginal
      ? new Date(photo.dateTimeOriginal).toLocaleDateString(
          locale === "zh-CN" ? "zh-CN" : "en-US",
          { year: "numeric", month: "short", day: "2-digit" },
        )
      : copy.photos.unknownDate;
    const location = [photo.city, photo.countryCode].filter(Boolean).join(", ");
    const camera = [photo.make, photo.model].filter(Boolean).join(" ");

    return (
      <div
        className={styles.photoListRow}
        data-selected={selected || undefined}
        role="row"
      >
        <div className={styles.photoListSelect} role="cell">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            aria-label={copy.photos.selectPhoto(
              photo.title || copy.photos.untitled,
            )}
          />
        </div>

        <Link
          href={href}
          prefetch={false}
          className={styles.photoListThumb}
          role="cell"
          aria-label={copy.photos.editPhoto(photo.title || copy.photos.untitled)}
        >
          <BlurImage
            src={photo.url}
            alt={photo.title || copy.photos.untitled}
            fill
            quality={30}
            className="object-cover"
            blurhash={photo.blurData}
            sizes="80px"
          />
        </Link>

        <div className={styles.photoListPrimary} role="cell">
          <Link href={href} prefetch={false}>
            {photo.title || copy.photos.untitled}
          </Link>
          <p>{photo.description}</p>
        </div>

        <div role="cell">
          <span
            className={styles.photoListStatus}
            data-private={photo.visibility === "private" || undefined}
          >
            {photo.visibility === "private" ? (
              <LockIcon size={11} />
            ) : (
              <Globe2Icon size={11} />
            )}
            {photo.visibility === "private"
              ? copy.photos.private
              : copy.photos.public}
          </span>
        </div>

        <div className={styles.photoListTextCell} role="cell">
          {location || copy.photos.unknownLocation}
        </div>

        <div className={styles.photoListTextCell} role="cell">
          {captured}
        </div>

        <div className={styles.photoListTextCell} role="cell">
          <span title={camera || copy.photos.unavailableTechnical}>
            {camera || copy.photos.unavailableTechnical}
          </span>
        </div>

        <div className={styles.photoListFavoriteCell} role="cell">
          <span
            className={styles.photoListFavorite}
            data-active={photo.isFavorite || undefined}
            title={
              photo.isFavorite ? copy.photos.selected : copy.photos.notSelected
            }
          >
            <StarIcon size={13} fill={photo.isFavorite ? "currentColor" : "none"} />
            <span>
              {photo.isFavorite ? copy.photos.selectedShort : copy.photos.notSelected}
            </span>
          </span>
        </div>

        <div className={styles.photoListActions} role="cell">
          <Link
            href={href}
            prefetch={false}
            aria-label={copy.photos.editPhoto(photo.title || copy.photos.untitled)}
          >
            <PencilIcon size={13} />
            <span>{copy.photos.edit}</span>
          </Link>
        </div>
      </div>
    );
  },
);

PhotoListRow.displayName = "PhotoListRow";

const PhotoCard = memo(
  ({
    photo,
    selected,
    onToggle,
  }: {
    photo: StudioPhoto;
    selected: boolean;
    onToggle: () => void;
  }) => {
    const { copy, locale } = useStudioLocale();
    const captured = photo.dateTimeOriginal
      ? new Date(photo.dateTimeOriginal).toLocaleDateString(
          locale === "zh-CN" ? "zh-CN" : "en-US",
          { year: "numeric", month: "short", day: "2-digit" },
        )
      : copy.photos.unknownDate;
    const location = [photo.city, photo.countryCode].filter(Boolean).join(", ");
    const href = `/studio/photos/${photo.id}`;

    return (
      <article
        className={styles.photoManagerCard}
        data-selected={selected || undefined}
      >
        <div className={styles.photoManagerImage}>
          <Link
            href={href}
            prefetch={false}
            className={styles.photoManagerImageLink}
            aria-label={copy.photos.editPhoto(photo.title || copy.photos.untitled)}
          >
            <BlurImage
              src={photo.url}
              alt={photo.title || copy.photos.untitled}
              fill
              quality={35}
              className="object-cover"
              blurhash={photo.blurData}
              sizes="(max-width: 620px) 50vw, (max-width: 1100px) 33vw, 20vw"
            />
          </Link>

          <div className={styles.photoSelectBox}>
            <Checkbox
              checked={selected}
              onCheckedChange={onToggle}
              aria-label={copy.photos.selectPhoto(
                photo.title || copy.photos.untitled,
              )}
            />
          </div>

          <span
            className={styles.photoStatusBadge}
            data-private={photo.visibility === "private" || undefined}
          >
            {photo.visibility === "private" ? (
              <LockIcon size={10} />
            ) : (
              <Globe2Icon size={10} />
            )}
            {photo.visibility === "private"
              ? copy.photos.private
              : copy.photos.public}
          </span>

          {photo.isFavorite ? (
            <span
              className={styles.photoFavoriteMark}
              aria-label={copy.photos.selected}
              title={copy.photos.selected}
            >
              <StarIcon size={12} fill="currentColor" />
            </span>
          ) : null}

          <Link
            href={href}
            prefetch={false}
            className={styles.photoQuickEdit}
            aria-label={copy.photos.editPhoto(photo.title || copy.photos.untitled)}
          >
            <PencilIcon size={13} />
            <span>{copy.photos.edit}</span>
          </Link>
        </div>

        <div className={styles.photoManagerMeta}>
          <Link href={href} prefetch={false}>
            {photo.title || copy.photos.untitled}
          </Link>
          <p>
            <span>{location || copy.photos.unknownLocation}</span>
            <span aria-hidden="true">·</span>
            <span>{captured}</span>
          </p>
          {selected ? (
            <span className={styles.selectedIndicator}>
              <CheckIcon size={11} />
              {copy.photos.selectedShort}
            </span>
          ) : null}
        </div>
      </article>
    );
  },
);

PhotoCard.displayName = "PhotoCard";
