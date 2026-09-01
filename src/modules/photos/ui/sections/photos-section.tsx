"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  CheckIcon,
  Clock3Icon,
  Grid2X2Icon,
  Grid3X3Icon,
  ListIcon,
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
import { PhotosLibraryLoading } from "@/modules/photos/ui/components/photos-library-loading";
import {
  DEFAULT_CAPTURE_TIMEZONE_OFFSET,
  formatCaptureDate,
} from "@/modules/photos/lib/camera-metadata";
import { trpc } from "@/trpc/client";

type SelectionFilter = "all" | "selected" | "unselected";
type SortOrder = "newest" | "oldest";
type PhotoViewMode = "list" | "comfortable" | "compact";

type PhotoLibrarySessionState = {
  search: string;
  selection: SelectionFilter;
  sort: SortOrder;
  viewMode: PhotoViewMode;
  scrollY: number;
  restoreScroll: boolean;
};

const photoLibrarySessionKey = "studio:photo-library:v2";
const defaultPhotoLibrarySession: PhotoLibrarySessionState = {
  search: "",
  selection: "all",
  sort: "newest",
  viewMode: "list",
  scrollY: 0,
  restoreScroll: false,
};

const readPhotoLibrarySession = (): PhotoLibrarySessionState => {
  if (typeof window === "undefined") return defaultPhotoLibrarySession;

  try {
    const value = JSON.parse(
      window.sessionStorage.getItem(photoLibrarySessionKey) ?? "{}",
    ) as Partial<PhotoLibrarySessionState>;

    return {
      search: typeof value.search === "string" ? value.search : "",
      selection: ["all", "selected", "unselected"].includes(
        value.selection ?? "",
      )
        ? (value.selection as SelectionFilter)
        : "all",
      sort: value.sort === "oldest" ? "oldest" : "newest",
      viewMode: ["list", "comfortable", "compact"].includes(
        value.viewMode ?? "",
      )
        ? (value.viewMode as PhotoViewMode)
        : "list",
      scrollY:
        typeof value.scrollY === "number" && Number.isFinite(value.scrollY)
          ? Math.max(0, value.scrollY)
          : 0,
      restoreScroll: value.restoreScroll === true,
    };
  } catch {
    return defaultPhotoLibrarySession;
  }
};

const updatePhotoLibrarySession = (
  changes: Partial<PhotoLibrarySessionState>,
) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      photoLibrarySessionKey,
      JSON.stringify({ ...readPhotoLibrarySession(), ...changes }),
    );
  } catch {
    // Navigation still works when storage is unavailable; only restoration is skipped.
  }
};

type StudioPhoto = {
  id: string;
  url: string;
  title: string;
  description: string;
  dateTimeOriginal: Date | null;
  captureTimezoneOffset: number;
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

const PhotosSectionContent = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return <PhotosLibraryLoading />;

  return <PhotosSectionReady />;
};

const PhotosSectionReady = () => {
  const { copy } = useStudioLocale();
  const pathname = usePathname();
  const utils = trpc.useUtils();
  const [initialSession] = useState(readPhotoLibrarySession);
  const [search, setSearch] = useState(initialSession.search);
  const deferredSearch = useDeferredValue(search.trim());
  const [selection, setSelection] = useState<SelectionFilter>(
    initialSession.selection,
  );
  const [sort, setSort] = useState<SortOrder>(initialSession.sort);
  const [viewMode, setViewMode] = useState<PhotoViewMode>(
    initialSession.viewMode,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [updatingFavoriteIds, setUpdatingFavoriteIds] = useState<Set<string>>(
    () => new Set(),
  );
  const hasRestoredScroll = useRef(false);

  const { data: stats } = trpc.photos.getStudioStats.useQuery();
  const { data: photos, ...query } =
    trpc.photos.getManyWithPrivate.useInfiniteQuery(
      {
        limit: 40,
        search: deferredSearch || undefined,
        selection,
        sort,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const bulkUpdate = trpc.photos.bulkUpdate.useMutation();
  const items = useMemo(
    () => photos?.pages.flatMap((page) => page.items) ?? [],
    [photos],
  );
  const rememberLibraryPosition = useCallback(() => {
    updatePhotoLibrarySession({
      scrollY: window.scrollY,
      restoreScroll: true,
    });
  }, []);

  useEffect(() => {
    updatePhotoLibrarySession({
      search,
      selection,
      sort,
      viewMode,
    });
  }, [search, selection, sort, viewMode]);

  useEffect(() => {
    if (!photos || pathname !== "/studio/photos" || hasRestoredScroll.current) {
      return;
    }

    const session = readPhotoLibrarySession();
    if (!session.restoreScroll) return;

    hasRestoredScroll.current = true;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        window.scrollTo({
          top: session.scrollY,
          left: 0,
          behavior: "auto",
        });
        updatePhotoLibrarySession({ restoreScroll: false });
        hasRestoredScroll.current = false;
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      hasRestoredScroll.current = false;
    };
  }, [pathname, photos]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [deferredSearch, selection, sort]);

  if (!photos) return <PhotosLibraryLoading />;

  const allLoadedSelected =
    items.length > 0 && items.every((photo) => selectedIds.has(photo.id));
  const someLoadedSelected =
    !allLoadedSelected && items.some((photo) => selectedIds.has(photo.id));
  const hasActiveFilters =
    Boolean(deferredSearch) || selection !== "all";

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
    setSelection("all");
  };

  const invalidateSelectionQueries = async () => {
    await Promise.all([
      utils.photos.getManyWithPrivate.invalidate(),
      utils.photos.getMany.invalidate(),
      utils.photos.getSelectedPhotos.invalidate(),
      utils.photos.getStudioStats.invalidate(),
      utils.summary.getSummary.invalidate(),
    ]);
  };

  const applyBulkUpdate = async (isFavorite: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      await bulkUpdate.mutateAsync({ ids, isFavorite });
      await invalidateSelectionQueries();
      setSelectedIds(new Set());
      toast.success(copy.photos.batchUpdated(ids.length));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : copy.photos.batchError,
      );
    }
  };

  const toggleFavorite = async (photo: StudioPhoto) => {
    setUpdatingFavoriteIds((current) => new Set(current).add(photo.id));

    try {
      const isFavorite = !photo.isFavorite;
      await bulkUpdate.mutateAsync({ ids: [photo.id], isFavorite });
      await invalidateSelectionQueries();
      toast.success(
        isFavorite
          ? copy.photos.selectionAdded(photo.title || copy.photos.untitled)
          : copy.photos.selectionRemoved(photo.title || copy.photos.untitled),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : copy.photos.batchError,
      );
    } finally {
      setUpdatingFavoriteIds((current) => {
        const next = new Set(current);
        next.delete(photo.id);
        return next;
      });
    }
  };

  return (
    <section className={styles.photoLibrary} aria-label={copy.photos.libraryLabel}>
      <div className={styles.librarySummary}>
        <LibraryMetric label={copy.photos.totalStat} value={stats?.total} />
        <LibraryMetric
          label={copy.photos.selectedStat}
          value={stats?.selected}
        />
        <LibraryMetric
          label={copy.photos.unselectedStat}
          value={stats?.unselected}
        />
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
            <StarIcon size={14} aria-hidden="true" />
            <span className="sr-only">{copy.photos.selectionFilter}</span>
            <select
              value={selection}
              onChange={(event) =>
                setSelection(event.target.value as SelectionFilter)
              }
            >
              <option value="all">{copy.photos.allSelections}</option>
              <option value="selected">{copy.photos.selectedOnly}</option>
              <option value="unselected">{copy.photos.unselectedOnly}</option>
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
                onClick={() => applyBulkUpdate(true)}
              >
                <StarIcon size={13} />
                {copy.photos.addFavorite}
              </button>
              <button
                type="button"
                disabled={bulkUpdate.isPending}
                onClick={() => applyBulkUpdate(false)}
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
              <span role="columnheader">{copy.photos.columnLocation}</span>
              <span role="columnheader">{copy.photos.columnCaptured}</span>
              <span role="columnheader">{copy.photos.columnCamera}</span>
              <span role="columnheader">{copy.photos.columnSelected}</span>
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
                onFavoriteToggle={() => toggleFavorite(photo)}
                favoritePending={updatingFavoriteIds.has(photo.id)}
                onEdit={rememberLibraryPosition}
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
              onFavoriteToggle={() => toggleFavorite(photo)}
              favoritePending={updatingFavoriteIds.has(photo.id)}
              onEdit={rememberLibraryPosition}
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
    onFavoriteToggle,
    favoritePending,
    onEdit,
  }: {
    photo: StudioPhoto;
    selected: boolean;
    onToggle: () => void;
    onFavoriteToggle: () => void;
    favoritePending: boolean;
    onEdit: () => void;
  }) => {
    const { copy, locale } = useStudioLocale();
    const href = `/studio/photos/${photo.id}`;
    const [prefetchEditor, setPrefetchEditor] = useState(false);
    const registerEditorIntent = () => setPrefetchEditor(true);
    const captured = photo.dateTimeOriginal
      ? formatCaptureDate(
          photo.dateTimeOriginal,
          photo.captureTimezoneOffset ?? DEFAULT_CAPTURE_TIMEZONE_OFFSET,
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
        onPointerEnter={registerEditorIntent}
        onFocusCapture={registerEditorIntent}
        onTouchStart={registerEditorIntent}
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
          prefetch={prefetchEditor}
          onClick={onEdit}
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
          <Link href={href} prefetch={prefetchEditor} onClick={onEdit}>
            {photo.title || copy.photos.untitled}
          </Link>
          <p>{photo.description}</p>
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
          <button
            type="button"
            className={styles.photoListFavorite}
            data-active={photo.isFavorite || undefined}
            disabled={favoritePending}
            aria-pressed={photo.isFavorite}
            aria-label={
              photo.isFavorite
                ? copy.photos.removeFavoriteFrom(photo.title || copy.photos.untitled)
                : copy.photos.addFavoriteTo(photo.title || copy.photos.untitled)
            }
            title={
              photo.isFavorite ? copy.photos.selected : copy.photos.notSelected
            }
            onClick={onFavoriteToggle}
          >
            <StarIcon size={13} fill={photo.isFavorite ? "currentColor" : "none"} />
            <span>
              {photo.isFavorite ? copy.photos.selectedShort : copy.photos.notSelected}
            </span>
          </button>
        </div>

        <div className={styles.photoListActions} role="cell">
          <Link
            href={href}
            prefetch={prefetchEditor}
            onClick={onEdit}
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
    onFavoriteToggle,
    favoritePending,
    onEdit,
  }: {
    photo: StudioPhoto;
    selected: boolean;
    onToggle: () => void;
    onFavoriteToggle: () => void;
    favoritePending: boolean;
    onEdit: () => void;
  }) => {
    const { copy, locale } = useStudioLocale();
    const captured = photo.dateTimeOriginal
      ? formatCaptureDate(
          photo.dateTimeOriginal,
          photo.captureTimezoneOffset ?? DEFAULT_CAPTURE_TIMEZONE_OFFSET,
          locale === "zh-CN" ? "zh-CN" : "en-US",
          { year: "numeric", month: "short", day: "2-digit" },
        )
      : copy.photos.unknownDate;
    const location = [photo.city, photo.countryCode].filter(Boolean).join(", ");
    const href = `/studio/photos/${photo.id}`;
    const [prefetchEditor, setPrefetchEditor] = useState(false);
    const registerEditorIntent = () => setPrefetchEditor(true);

    return (
      <article
        className={styles.photoManagerCard}
        data-selected={selected || undefined}
        onPointerEnter={registerEditorIntent}
        onFocusCapture={registerEditorIntent}
        onTouchStart={registerEditorIntent}
      >
        <div className={styles.photoManagerImage}>
          <Link
            href={href}
            prefetch={prefetchEditor}
            onClick={onEdit}
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

          <button
            type="button"
            className={styles.photoFavoriteMark}
            data-active={photo.isFavorite || undefined}
            disabled={favoritePending}
            aria-pressed={photo.isFavorite}
            aria-label={
              photo.isFavorite
                ? copy.photos.removeFavoriteFrom(photo.title || copy.photos.untitled)
                : copy.photos.addFavoriteTo(photo.title || copy.photos.untitled)
            }
            title={
              photo.isFavorite ? copy.photos.selected : copy.photos.notSelected
            }
            onClick={onFavoriteToggle}
          >
            <StarIcon size={13} fill={photo.isFavorite ? "currentColor" : "none"} />
          </button>

          <Link
            href={href}
            prefetch={prefetchEditor}
            onClick={onEdit}
            className={styles.photoQuickEdit}
            aria-label={copy.photos.editPhoto(photo.title || copy.photos.untitled)}
          >
            <PencilIcon size={13} />
            <span>{copy.photos.edit}</span>
          </Link>
        </div>

        <div className={styles.photoManagerMeta}>
          <Link href={href} prefetch={prefetchEditor} onClick={onEdit}>
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
              {copy.photos.checkedShort}
            </span>
          ) : null}
        </div>
      </article>
    );
  },
);

PhotoCard.displayName = "PhotoCard";
