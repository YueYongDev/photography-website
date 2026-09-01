"use client";

import { z } from "zod";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  CopyCheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  Globe2Icon,
  HouseIcon,
  ImagesIcon,
  LoaderCircleIcon,
  MapPinIcon,
  MinusIcon,
  MoreVerticalIcon,
  PlusIcon,
  ScanIcon,
  SearchIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import BlurImage from "@/components/blur-image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { photosUpdateSchema } from "@/db/schema/photos";
import { formatGPSCoordinates, parseLatLngText } from "@/lib/utils";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";
import {
  APERTURE_PRESETS,
  EXPOSURE_COMPENSATION_PRESETS,
  formatAperture,
  formatExposureCompensation,
  formatIso,
  formatShutterSpeed,
  ISO_PRESETS,
  SHUTTER_FRACTION_PRESETS,
  SHUTTER_SECONDS_PRESETS,
} from "@/modules/photos/lib/camera-metadata";
import {
  CameraPresetSelect,
  CaptureDateTimeInput,
  FocalLengthInput,
} from "@/modules/photos/ui/components/camera-metadata-fields";
import { toPlaceSlug } from "@/modules/travel/lib/country-groups";
import { trpc } from "@/trpc/client";
import styles from "../photo-editor.module.css";

const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <Skeleton className={styles.mapSkeleton} />,
});

type PhotoFormValues = z.infer<typeof photosUpdateSchema>;
type InspectorSection = "content" | "display" | "location" | "technical";

type AddressSearchResult = {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  district: string | null;
  fullAddress: string;
  placeFormatted: string;
};

export const FormSection = ({ photoId }: { photoId: string }) => {
  const { copy } = useStudioLocale();

  return (
    <Suspense
      fallback={<div className={styles.loadingState}>{copy.common.loading}</div>}
    >
      <ErrorBoundary
        fallback={<div className={styles.errorState}>{copy.overview.error}</div>}
      >
        <FormSectionSuspense photoId={photoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSuspense = ({ photoId }: { photoId: string }) => {
  const router = useRouter();
  const { isMobile, state: sidebarState } = useSidebar();
  const { copy, locale } = useStudioLocale();
  const utils = trpc.useUtils();
  const [photo] = trpc.photos.getOne.useSuspenseQuery({ id: photoId });
  const [isCopied, setIsCopied] = useState(false);
  const [isReturningToLibrary, setIsReturningToLibrary] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [activeInspectorSection, setActiveInspectorSection] =
    useState<InspectorSection>("content");
  const inspectorScrollRef = useRef<HTMLDivElement>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState<AddressSearchResult[]>([]);
  const [isAddressSearching, setIsAddressSearching] = useState(false);
  const [addressSearchMessage, setAddressSearchMessage] = useState<
    string | null
  >(null);
  const [mapRevision, setMapRevision] = useState(0);
  const [coordinateText, setCoordinateText] = useState(() =>
    photo.latitude !== null && photo.longitude !== null
      ? `${photo.latitude}, ${photo.longitude}`
      : "",
  );

  const photoAspectRatio =
    photo.width > 0 && photo.height > 0
      ? photo.width / photo.height
      : photo.aspectRatio > 0
        ? photo.aspectRatio
        : 1.5;

  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photosUpdateSchema),
    defaultValues: {
      id: photo.id,
      title: photo.title,
      description: photo.description,
      isFavorite: photo.isFavorite,
      visibility: photo.visibility,
      make: photo.make ?? "",
      model: photo.model ?? "",
      lensModel: photo.lensModel ?? "",
      focalLength: photo.focalLength ?? undefined,
      focalLength35mm: photo.focalLength35mm ?? undefined,
      fNumber: photo.fNumber ?? undefined,
      iso: photo.iso ?? undefined,
      exposureTime: photo.exposureTime ?? undefined,
      exposureCompensation: photo.exposureCompensation ?? undefined,
      latitude: photo.latitude ?? undefined,
      longitude: photo.longitude ?? undefined,
      country: photo.country ?? undefined,
      countryCode: photo.countryCode ?? undefined,
      region: photo.region ?? undefined,
      city: photo.city ?? undefined,
      district: photo.district ?? undefined,
      fullAddress: photo.fullAddress ?? undefined,
      placeFormatted: photo.placeFormatted ?? undefined,
      gpsAltitude: photo.gpsAltitude ?? undefined,
      dateTimeOriginal: photo.dateTimeOriginal
        ? new Date(photo.dateTimeOriginal)
        : undefined,
    },
  });

  const currentTitle = useWatch({ control: form.control, name: "title" });
  const latitude = useWatch({ control: form.control, name: "latitude" });
  const longitude = useWatch({ control: form.control, name: "longitude" });
  const country = useWatch({ control: form.control, name: "country" });
  const countryCode = useWatch({ control: form.control, name: "countryCode" });
  const region = useWatch({ control: form.control, name: "region" });
  const city = useWatch({ control: form.control, name: "city" });
  const fullAddress = useWatch({ control: form.control, name: "fullAddress" });
  const placeFormatted = useWatch({
    control: form.control,
    name: "placeFormatted",
  });
  const cameraMake = useWatch({ control: form.control, name: "make" });
  const cameraModel = useWatch({ control: form.control, name: "model" });
  const hasCoordinates =
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [photoId]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!form.formState.isDirty) return;
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty]);

  const update = trpc.photos.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.photos.getMany.invalidate(),
        utils.photos.getManyWithPrivate.invalidate(),
        utils.photos.getOne.invalidate({ id: photoId }),
        utils.photos.getLikedPhotos.invalidate(),
        utils.photos.getPortfolioPhotos.invalidate(),
        utils.photos.getStudioStats.invalidate(),
      ]);
      setIsReturningToLibrary(true);
      toast.success(copy.editor.updateSuccess);
      router.push("/studio/photos", { scroll: false });
    },
    onError: (error) => {
      setIsReturningToLibrary(false);
      toast.error(error.message);
    },
  });

  const remove = trpc.photos.remove.useMutation({
    onSuccess: async () => {
      toast.success(copy.editor.removeSuccess);
      await Promise.all([
        utils.photos.getMany.invalidate(),
        utils.photos.getManyWithPrivate.invalidate(),
        utils.photos.getLikedPhotos.invalidate(),
        utils.photos.getPortfolioPhotos.invalidate(),
        utils.photos.getStudioStats.invalidate(),
      ]);
      router.push("/studio/photos", { scroll: false });
    },
    onError: (error) => toast.error(error.message),
  });

  const generateAIDescription = trpc.photos.generateDescription.useMutation({
    onSuccess: (data) => {
      form.setValue("title", data.title, { shouldDirty: true });
      form.setValue("description", data.description, { shouldDirty: true });
      toast.success(copy.editor.aiSuccess);
    },
    onError: (error) => {
      toast.error(error.message || copy.editor.aiError);
    },
  });

  const mapValues = useMemo(
    () => ({
      markers: hasCoordinates
        ? [{ id: "location", longitude, latitude }]
        : [],
    }),
    [hasCoordinates, latitude, longitude],
  );

  const cityLevelLocation =
    photo.countryCode?.toUpperCase() === "JP" ||
    photo.countryCode?.toUpperCase() === "TW"
      ? photo.region ?? photo.city
      : photo.city ?? photo.region;
  const photoPath =
    photo.countryCode && cityLevelLocation
      ? `/places/${photo.countryCode.toLowerCase()}/${toPlaceSlug(cityLevelLocation)}`
      : "/map";
  const cameraLabel = [cameraMake, cameraModel].filter(Boolean).join(" ");
  const locationLabel = [city ?? region, countryCode]
    .filter(Boolean)
    .join(" · ");
  const locationDetail =
    placeFormatted ??
    fullAddress ??
    [city ?? region, country].filter(Boolean).join(", ");
  const capturedLabel = photo.dateTimeOriginal
    ? new Intl.DateTimeFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(new Date(photo.dateTimeOriginal))
    : copy.editor.notRecorded;

  const setCoordinates = (lat: number, lng: number) => {
    form.setValue("latitude", lat, { shouldDirty: true });
    form.setValue("longitude", lng, { shouldDirty: true });
    setCoordinateText(`${lat}, ${lng}`);
  };

  const searchAddress = async () => {
    if (isAddressSearching) return;

    const query = addressQuery.trim();

    if (query.length < 2) {
      setAddressResults([]);
      setAddressSearchMessage(copy.editor.addressSearchMinimum);
      return;
    }

    setIsAddressSearching(true);
    setAddressSearchMessage(null);

    try {
      const response = await fetch(
        `/api/geocoding/search?q=${encodeURIComponent(query)}&lang=${locale}`,
      );
      const payload = (await response.json()) as {
        results?: AddressSearchResult[];
      };

      if (!response.ok) throw new Error("Address search failed");

      const results = payload.results ?? [];
      setAddressResults(results);
      setAddressSearchMessage(
        results.length === 0 ? copy.editor.addressSearchEmpty : null,
      );
    } catch {
      setAddressResults([]);
      setAddressSearchMessage(copy.editor.addressSearchError);
    } finally {
      setIsAddressSearching(false);
    }
  };

  const selectAddress = (result: AddressSearchResult) => {
    setCoordinates(result.latitude, result.longitude);
    form.setValue("country", result.country, { shouldDirty: true });
    form.setValue("countryCode", result.countryCode, { shouldDirty: true });
    form.setValue("region", result.region, { shouldDirty: true });
    form.setValue("city", result.city, { shouldDirty: true });
    form.setValue("district", result.district, { shouldDirty: true });
    form.setValue("fullAddress", result.fullAddress, { shouldDirty: true });
    form.setValue("placeFormatted", result.placeFormatted, {
      shouldDirty: true,
    });
    setAddressQuery(result.displayName);
    setAddressResults([]);
    setAddressSearchMessage(null);
    setMapRevision((revision) => revision + 1);
    toast.success(copy.editor.addressSelected);
  };

  const onCopy = async () => {
    const fullUrl = `${window.location.origin}${photoPath}`;
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  };

  const onPasteCoordinates = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const coordinates = parseLatLngText(clipboardText);

      if (!coordinates) {
        toast.error(copy.editor.coordinatesInvalid);
        return;
      }

      setCoordinates(coordinates.lat, coordinates.lng);
      setMapRevision((revision) => revision + 1);
      toast.success(copy.editor.coordinatesPasted);
    } catch {
      toast.error(copy.editor.coordinatesPasteError);
    }
  };

  const onCoordinateChange = (value: string) => {
    setCoordinateText(value);
    const coordinates = parseLatLngText(value);
    if (!coordinates) return;
    form.setValue("latitude", coordinates.lat, { shouldDirty: true });
    form.setValue("longitude", coordinates.lng, { shouldDirty: true });
  };

  const onSubmit = (data: PhotoFormValues) => {
    update.mutate(data);
  };

  const navigateInspector = (section: InspectorSection) => {
    setActiveInspectorSection(section);
    window.requestAnimationFrame(() => {
      inspectorScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  return (
    <Form {...form}>
      <form
        className={styles.form}
        onSubmit={form.handleSubmit(onSubmit)}
        aria-busy={update.isPending || isReturningToLibrary}
      >
        <header className={styles.header}>
          <div className={styles.headerIdentity}>
            {(isMobile || sidebarState === "collapsed") && (
              <SidebarTrigger
                className={styles.shellTrigger}
                label={copy.shell.toggleSidebar}
              />
            )}
            <Link
              className={styles.backLink}
              href="/studio/photos"
              scroll={false}
              aria-label={copy.editor.backToPhotos}
            >
              <ArrowLeftIcon size={18} />
            </Link>
            <div className={styles.headerCopy}>
              <div className={styles.headerTitleLine}>
                <p className={styles.eyebrow}>{copy.editor.editEyebrow}</p>
                <h1 className={styles.title}>
                  {currentTitle || copy.photos.untitled}
                </h1>
              </div>
              <span
                className={styles.saveState}
                data-dirty={
                  form.formState.isDirty && !update.isPending
                    ? true
                    : undefined
                }
                data-saving={
                  update.isPending || isReturningToLibrary || undefined
                }
              >
                <span className={styles.saveStateDot} />
                {update.isPending || isReturningToLibrary
                  ? copy.editor.saving
                  : form.formState.isDirty
                  ? copy.editor.unsavedChanges
                  : copy.editor.allChangesSaved}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              type="submit"
              className={styles.primaryAction}
              disabled={
                update.isPending ||
                isReturningToLibrary ||
                !form.formState.isDirty
              }
            >
              {update.isPending || isReturningToLibrary ? (
                <LoaderCircleIcon
                  className={styles.saveActionSpinner}
                  size={13}
                  aria-hidden="true"
                />
              ) : null}
              {update.isPending || isReturningToLibrary
                ? copy.editor.saving
                : copy.editor.save}
            </Button>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className={styles.moreAction}
                  aria-label={copy.editor.moreActions}
                >
                  <MoreVerticalIcon size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => remove.mutate({ id: photoId })}
                  disabled={remove.isPending}
                >
                  <TrashIcon className="mr-2 size-4" />
                  {copy.editor.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {update.isPending || isReturningToLibrary ? (
          <div
            className={styles.saveActivity}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={styles.saveActivityIcon} aria-hidden="true">
              <LoaderCircleIcon size={18} />
            </span>
            <span className={styles.saveActivityCopy}>
              <strong>{copy.editor.savingPhoto}</strong>
              <small>{copy.editor.savingHint}</small>
            </span>
            <span className={styles.saveActivityProgress} aria-hidden="true" />
          </div>
        ) : null}

        <div className={styles.workspace}>
          <section className={styles.mediaColumn}>
            <div className={styles.photoStage}>
              <Link
                className={styles.stageAction}
                href={photo.url}
                target="_blank"
                rel="noreferrer"
              >
                {copy.editor.openPhoto}
                <ExternalLinkIcon size={14} />
              </Link>

              <div
                className={styles.photoPreview}
                style={{
                  aspectRatio: photoAspectRatio,
                  width: `min(100%, ${Math.round(72 * photoAspectRatio)}vh)`,
                  transform: `scale(${previewZoom})`,
                }}
              >
                <BlurImage
                  src={photo.url}
                  alt={photo.title}
                  fill
                  priority
                  quality={75}
                  sizes="(max-width: 1100px) 100vw, 65vw"
                  className="object-contain"
                  blurhash={photo.blurData}
                />
              </div>

              <div className={styles.zoomControls}>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((zoom) => Math.min(zoom + 0.1, 1.5))}
                  aria-label={copy.editor.zoomIn}
                  disabled={previewZoom >= 1.5}
                >
                  <PlusIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((zoom) => Math.max(zoom - 0.1, 0.8))}
                  aria-label={copy.editor.zoomOut}
                  disabled={previewZoom <= 0.8}
                >
                  <MinusIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(1)}
                  aria-label={copy.editor.resetZoom}
                >
                  <ScanIcon size={15} />
                </button>
              </div>
            </div>

            <footer className={styles.metadataBar}>
              <span className={styles.publicMeta}>
                <Globe2Icon size={14} />
                {copy.editor.publicPhoto}
              </span>
              <span>{locationLabel || copy.photos.unknownLocation}</span>
              <span>
                {Math.round(photo.width)} × {Math.round(photo.height)}
              </span>
              <span>{cameraLabel || copy.editor.notRecorded}</span>
              <span>{capturedLabel}</span>
              <Button
                type="button"
                variant="ghost"
                className={styles.copyButton}
                onClick={onCopy}
                disabled={isCopied}
                aria-label={copy.editor.copyLink}
              >
                {isCopied ? <CopyCheckIcon size={15} /> : <CopyIcon size={15} />}
              </Button>
            </footer>
          </section>

          <aside className={styles.inspector}>
            <nav
              className={styles.inspectorTabs}
              aria-label={copy.editor.photoDetails}
              role="tablist"
            >
              {(
                [
                  { id: "content", label: copy.editor.contentTab },
                  { id: "display", label: copy.editor.displayTab },
                  { id: "location", label: copy.editor.locationTab },
                  { id: "technical", label: copy.editor.technicalTab },
                ] satisfies Array<{ id: InspectorSection; label: string }>
              ).map((item) => (
                <button
                  key={item.id}
                  id={`photo-editor-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-controls={`photo-editor-${item.id}`}
                  aria-selected={activeInspectorSection === item.id}
                  data-active={activeInspectorSection === item.id || undefined}
                  onClick={() => navigateInspector(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className={styles.inspectorScroll} ref={inspectorScrollRef}>
              {activeInspectorSection === "content" && (
                <section
                  className={styles.inspectorSection}
                  id="photo-editor-content"
                  role="tabpanel"
                  aria-labelledby="photo-editor-tab-content"
                >
                  <div
                    className={`${styles.sectionHeading} ${styles.sectionHeadingWithAction}`}
                  >
                    <div>
                      <span>01</span>
                      <h2>{copy.editor.contentSection}</h2>
                    </div>
                    <button
                      type="button"
                      className={styles.sectionAiAction}
                      onClick={() =>
                        generateAIDescription.mutate({ id: photoId })
                      }
                      disabled={generateAIDescription.isPending}
                    >
                      <SparklesIcon
                        className={
                          generateAIDescription.isPending ? "animate-pulse" : ""
                        }
                        size={14}
                      />
                      <span>
                        {generateAIDescription.isPending
                          ? copy.editor.generating
                          : copy.editor.aiDescription}
                      </span>
                    </button>
                    <p>{copy.editor.contentSectionDescription}</p>
                  </div>
                  <div className={styles.fieldStack}>
                    <FormField
                      name="title"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{copy.editor.title}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={copy.editor.photoTitle}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="description"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{copy.editor.description}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={4}
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              )}

              {activeInspectorSection === "display" && (
                <section
                  className={styles.inspectorSection}
                  id="photo-editor-display"
                  role="tabpanel"
                  aria-labelledby="photo-editor-tab-display"
                >
                  <div className={styles.sectionHeading}>
                    <div>
                      <span>02</span>
                      <h2>{copy.editor.displaySection}</h2>
                    </div>
                    <p>{copy.editor.displaySectionDescription}</p>
                  </div>
                  <div className={styles.switchList}>
                    <FormField
                      name="isFavorite"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem
                          className={styles.switchRow}
                          data-active={field.value || undefined}
                        >
                          <span className={styles.switchIcon}>
                            <HouseIcon size={17} />
                          </span>
                          <div className={styles.switchCopy}>
                            <strong>{copy.editor.homepageDisplay}</strong>
                            <span>{copy.editor.homepageDisplayDescription}</span>
                          </div>
                          <FormControl>
                            <Switch
                              size="large"
                              className={styles.switchControl}
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                              aria-label={copy.editor.homepageDisplay}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="visibility"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem
                          className={styles.switchRow}
                          data-active={field.value === "public" || undefined}
                        >
                          <span className={styles.switchIcon}>
                            <ImagesIcon size={17} />
                          </span>
                          <div className={styles.switchCopy}>
                            <strong>{copy.editor.portfolioDisplay}</strong>
                            <span>{copy.editor.portfolioDisplayDescription}</span>
                          </div>
                          <FormControl>
                            <Switch
                              size="large"
                              className={styles.switchControl}
                              checked={field.value === "public"}
                              onCheckedChange={(checked) =>
                                field.onChange(checked ? "public" : "private")
                              }
                              aria-label={copy.editor.portfolioDisplay}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              )}

              {activeInspectorSection === "location" && (
                <section
                  className={styles.inspectorSection}
                  id="photo-editor-location"
                  role="tabpanel"
                  aria-labelledby="photo-editor-tab-location"
                >
                <div className={styles.sectionHeading}>
                  <div>
                    <span>03</span>
                    <h2>{copy.editor.locationSection}</h2>
                  </div>
                  <p>{copy.editor.locationSectionDescription}</p>
                </div>
                <div className={styles.addressSearch}>
                  <FormLabel htmlFor="photo-address-search">
                    {copy.editor.addressSearch}
                  </FormLabel>
                  <div className={styles.addressSearchControl}>
                    <div className={styles.addressSearchInputWrap}>
                      <SearchIcon size={15} aria-hidden="true" />
                      <Input
                        id="photo-address-search"
                        value={addressQuery}
                        placeholder={copy.editor.addressSearchPlaceholder}
                        autoComplete="off"
                        onChange={(event) => {
                          setAddressQuery(event.target.value);
                          if (addressSearchMessage) {
                            setAddressSearchMessage(null);
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          void searchAddress();
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      className={styles.addressSearchButton}
                      disabled={
                        isAddressSearching || addressQuery.trim().length < 2
                      }
                      onClick={() => void searchAddress()}
                    >
                      {isAddressSearching ? (
                        <LoaderCircleIcon className="animate-spin" size={14} />
                      ) : (
                        <SearchIcon size={14} />
                      )}
                      <span>
                        {isAddressSearching
                          ? copy.editor.addressSearching
                          : copy.editor.addressSearchAction}
                      </span>
                    </Button>
                  </div>
                  {addressResults.length > 0 && (
                    <div className={styles.addressResults} aria-live="polite">
                      {addressResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          className={styles.addressResult}
                          onClick={() => selectAddress(result)}
                        >
                          <MapPinIcon size={15} aria-hidden="true" />
                          <span>
                            <strong>{result.name}</strong>
                            <span>{result.displayName}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {addressSearchMessage && (
                    <p className={styles.addressSearchMessage} role="status">
                      {addressSearchMessage}
                    </p>
                  )}
                  <a
                    className={styles.addressAttribution}
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {copy.editor.addressSearchHint}
                  </a>
                </div>
                <div className={styles.locationSummary}>
                  <MapPinIcon size={17} />
                  <div>
                    <strong>
                      {locationDetail || copy.photos.unknownLocation}
                    </strong>
                    <span>
                      {hasCoordinates
                        ? formatGPSCoordinates(latitude, longitude)
                        : copy.editor.noCoordinates}
                    </span>
                  </div>
                </div>
                <div className={styles.coordinateHead}>
                  <FormLabel htmlFor="photo-coordinates">
                    {copy.editor.gps}
                  </FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    className={styles.pasteButton}
                    onClick={onPasteCoordinates}
                  >
                    {copy.editor.pasteCoordinates}
                  </Button>
                </div>
                <Input
                  id="photo-coordinates"
                  value={coordinateText}
                  placeholder="34.6875, 135.5259"
                  onChange={(event) => onCoordinateChange(event.target.value)}
                  aria-describedby="photo-coordinate-description"
                />
                <div className={styles.mapFrame}>
                  <Suspense
                    fallback={<Skeleton className={styles.mapSkeleton} />}
                  >
                    <MapComponent
                      key={mapRevision}
                      draggableMarker
                      markers={mapValues.markers}
                      initialViewState={{
                        longitude: hasCoordinates ? longitude : 0,
                        latitude: hasCoordinates ? latitude : 20,
                        zoom: hasCoordinates ? 10 : 1,
                      }}
                      onMarkerDragEnd={(data) =>
                        setCoordinates(data.lat, data.lng)
                      }
                    />
                  </Suspense>
                </div>
                <p className={styles.coordinateDescription} id="photo-coordinate-description">
                  {copy.editor.publicPhotoNote}
                </p>
                </section>
              )}

              {activeInspectorSection === "technical" && (
                <section
                  className={styles.inspectorSection}
                  id="photo-editor-technical"
                  role="tabpanel"
                  aria-labelledby="photo-editor-tab-technical"
                >
                  <div className={styles.sectionHeading}>
                    <div>
                      <span>04</span>
                      <h2>{copy.editor.technicalSection}</h2>
                    </div>
                    <p>{copy.editor.technicalSectionDescription}</p>
                  </div>
                  <div className={styles.technicalStorageNote}>
                    <span>EXIF</span>
                    <p>{copy.editor.cameraMetadataStorageNote}</p>
                  </div>
                  <div className={styles.technicalFields}>
                      <FormField
                        name="make"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{copy.editor.cameraMake}</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="model"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{copy.editor.cameraModel}</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="lensModel"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className={styles.wideField}>
                            <FormLabel>{copy.editor.lens}</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="focalLength"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{copy.editor.focalLength}</FormLabel>
                            <FormControl>
                              <FocalLengthInput
                                ref={field.ref}
                                name={field.name}
                                value={field.value}
                                onBlur={field.onBlur}
                                onChange={field.onChange}
                                placeholder={copy.editor.focalLengthPlaceholder}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="fNumber"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{copy.editor.aperture}</FormLabel>
                            <CameraPresetSelect
                              ariaLabel={copy.editor.aperture}
                              value={field.value}
                              originalValue={photo.fNumber}
                              onChange={field.onChange}
                              groups={[
                                {
                                  label: copy.editor.aperturePresets,
                                  options: APERTURE_PRESETS,
                                },
                              ]}
                              formatValue={formatAperture}
                              notRecordedLabel={copy.editor.notRecorded}
                              originalValueLabel={copy.editor.originalMetadataValue}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="iso"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{copy.editor.iso}</FormLabel>
                            <CameraPresetSelect
                              ariaLabel={copy.editor.iso}
                              value={field.value}
                              originalValue={photo.iso}
                              onChange={field.onChange}
                              groups={[
                                {
                                  label: copy.editor.isoPresets,
                                  options: ISO_PRESETS,
                                },
                              ]}
                              formatValue={formatIso}
                              notRecordedLabel={copy.editor.notRecorded}
                              originalValueLabel={copy.editor.originalMetadataValue}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="exposureCompensation"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{copy.editor.compensation}</FormLabel>
                            <CameraPresetSelect
                              ariaLabel={copy.editor.compensation}
                              value={field.value}
                              originalValue={photo.exposureCompensation}
                              onChange={field.onChange}
                              groups={[
                                {
                                  label: copy.editor.compensationPresets,
                                  options: EXPOSURE_COMPENSATION_PRESETS,
                                },
                              ]}
                              formatValue={formatExposureCompensation}
                              notRecordedLabel={copy.editor.notRecorded}
                              originalValueLabel={copy.editor.originalMetadataValue}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="exposureTime"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{copy.editor.shutter}</FormLabel>
                            <CameraPresetSelect
                              ariaLabel={copy.editor.shutter}
                              value={field.value}
                              originalValue={photo.exposureTime}
                              onChange={field.onChange}
                              groups={[
                                {
                                  label: copy.editor.fractionalSeconds,
                                  options: SHUTTER_FRACTION_PRESETS,
                                },
                                {
                                  label: copy.editor.wholeSeconds,
                                  options: SHUTTER_SECONDS_PRESETS,
                                },
                              ]}
                              formatValue={formatShutterSpeed}
                              notRecordedLabel={copy.editor.notRecorded}
                              originalValueLabel={copy.editor.originalMetadataValue}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="dateTimeOriginal"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{copy.editor.dateTaken}</FormLabel>
                            <FormControl>
                              <CaptureDateTimeInput
                                ref={field.ref}
                                name={field.name}
                                value={field.value}
                                onBlur={field.onBlur}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                </section>
              )}
            </div>

          </aside>
        </div>
      </form>
    </Form>
  );
};
