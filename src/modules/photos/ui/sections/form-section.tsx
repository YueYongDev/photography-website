"use client";

import { z } from "zod";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { formatGPSCoordinates, parseLatLngText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CopyCheckIcon,
  CopyIcon,
  MoreVerticalIcon,
  SparklesIcon,
  TrashIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExposureTimeInput } from "@/components/ui/exposure-time-input";
import BlurImage from "@/components/blur-image";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { photosUpdateSchema } from "@/db/schema/photos";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import styles from "@/modules/dashboard/ui/studio.module.css";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";

const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-md border flex items-center justify-center bg-muted">
      <Skeleton className="h-full w-full" />
    </div>
  ),
});

export const FormSection = ({ photoId }: { photoId: string }) => {
  const { copy } = useStudioLocale();
  return (
    <Suspense fallback={<p>{copy.common.loading}</p>}>
      <ErrorBoundary fallback={<p>{copy.overview.error}</p>}>
        <FormSectionSuspense photoId={photoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSuspense = ({ photoId }: { photoId: string }) => {
  const router = useRouter();
  const { copy } = useStudioLocale();
  const utils = trpc.useUtils();
  const [photo] = trpc.photos.getOne.useSuspenseQuery({ id: photoId });
  const photoAspectRatio =
    photo.width > 0 && photo.height > 0
      ? photo.width / photo.height
      : photo.aspectRatio > 0
        ? photo.aspectRatio
        : 1.5;
  const [currentLocation, setCurrentLocation] = useState({
    lat: photo.latitude,
    lng: photo.longitude,
  });
  const [cameraInfoOpen, setCameraInfoOpen] = useState(false);
  const [exposureInfoOpen, setExposureInfoOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [photoId]);

  const update = trpc.photos.update.useMutation({
    onSuccess: async () => {
      toast.success("Photo updated");
      await Promise.all([
        utils.photos.getMany.invalidate(),
        utils.photos.getManyWithPrivate.invalidate(),
        utils.photos.getOne.invalidate({ id: photoId }),
        utils.photos.getStudioStats.invalidate(),
      ]);
      // 保存成功后跳转回Photo页面
      router.push("/studio/photos");
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = trpc.photos.remove.useMutation({
    onSuccess: async () => {
      toast.success("Photo removed");
      await Promise.all([
        utils.photos.getMany.invalidate(),
        utils.photos.getManyWithPrivate.invalidate(),
        utils.photos.getStudioStats.invalidate(),
      ]);
      router.push("/studio/photos");
    },
    onError: (error) => toast.error(error.message),
  });

  // 创建一个新的mutation用于AI生成描述
  const generateAIDescription = trpc.photos.generateDescription.useMutation({
    onSuccess: (data) => {
      form.setValue("title", data.title);
      form.setValue("description", data.description);
      toast.success("AI description generated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate AI description");
    },
  });

  const form = useForm<z.infer<typeof photosUpdateSchema>>({
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

  // 当 latitude 或 longitude 字段变化时，更新 currentLocation 状态
  useEffect(() => {
    const lat = form.watch("latitude");
    const lng = form.watch("longitude");

    // 只有当 lat 和 lng 都有效时才更新 currentLocation
    if (lat !== undefined && lng !== undefined && lat !== null && lng !== null) {
      setCurrentLocation({ lat, lng });
    }
  }, [form]);

  const mapValues = useMemo(() => {
    const longitude = currentLocation?.lng ?? photo.longitude ?? 0;
    const latitude = currentLocation?.lat ?? photo.latitude ?? 0;
    return {
      markers:
        longitude === 0 && latitude === 0
          ? []
          : [{ id: "location", longitude, latitude }],
    };
  }, [
    currentLocation?.lat,
    currentLocation?.lng,
    photo.latitude,
    photo.longitude,
  ]);

  const onSubmit = (data: z.infer<typeof photosUpdateSchema>) => {
    update.mutateAsync(data);
  };

  const [isCopied, setIsCopied] = useState(false);
  const photoPath = `/photograph/${photoId}`;

  const onCopy = async () => {
    const fullUrl = `${window.location.origin}${photoPath}`;
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const onPasteCoordinates = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const coordinates = parseLatLngText(clipboardText);

      if (!coordinates) {
        toast.error("Invalid coordinates format. Use: latitude, longitude");
        return;
      }

      form.setValue("latitude", coordinates.lat);
      form.setValue("longitude", coordinates.lng);
      setCurrentLocation({ lat: coordinates.lat, lng: coordinates.lng });
      toast.success("Coordinates pasted");
    } catch {
      toast.error("Failed to read clipboard");
    }
  };

  return (
    <div className="py-2.5 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className={styles.editorHeader}>
            <div className={styles.editorHeaderCopy}>
              <h1 className={styles.editorTitle}>{copy.editor.photoDetails}</h1>
              <p className={styles.editorDescription}>
                {copy.editor.photoDescription}
              </p>
            </div>
            <div className={styles.editorActions}>
              <Button
                type="button"
                variant="default"
                onClick={() => generateAIDescription.mutate({ id: photoId })}
                disabled={generateAIDescription.isPending}
                className={`${styles.editorSecondaryButton} whitespace-nowrap`}
              >
                {generateAIDescription.isPending ? (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4 animate-pulse" />
                    <span className="hidden sm:inline">{copy.editor.generating}</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{copy.editor.aiDescription}</span>
                    <span className="sm:hidden">AI</span>
                  </>
                )}
              </Button>
              <Button
                type="submit"
                className={styles.editorPrimaryButton}
                disabled={update.isPending}
              >
                {copy.editor.save}
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ id: photoId })}
                  >
                    <TrashIcon className="size-4 mr-2" />
                    {copy.editor.delete}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Preview Image and Camera Info - Left side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preview Image */}
              <div className={`${styles.editorMediaCard} flex h-fit flex-col gap-4`}>
                <div className={styles.editorPhotoStage}>
                  <div
                    className={styles.editorPhotoPreview}
                    style={{
                      aspectRatio: photoAspectRatio,
                      width: `min(100%, ${Math.round(68 * photoAspectRatio)}vh)`,
                    }}
                  >
                    <BlurImage
                      src={photo.url}
                      alt={photo.title}
                      fill
                      quality={35}
                      className="object-contain"
                      blurhash={photo.blurData}
                    />
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-sm text-muted-foreground">
                        {copy.editor.photoLink}
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link href={photoPath}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {photoPath}
                          </p>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={onCopy}
                          className="shrink-0"
                          disabled={isCopied}
                        >
                          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Camera Info and Exposure Info */}
              <div className="flex flex-col gap-y-6">
                {/* Camera Info Collapsible */}
                <Collapsible
                  className={styles.editorSectionDisclosure}
                  open={cameraInfoOpen}
                  onOpenChange={setCameraInfoOpen}
                >
                  <div className={styles.editorSectionHead}>
                    <h3 className="text-lg font-semibold">{copy.editor.cameraInfo}</h3>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {cameraInfoOpen ? <ChevronDown /> : <ChevronRight />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className={`${styles.editorSectionBody} space-y-4 p-4`}>
                      <FormField
                        name="make"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{copy.editor.cameraMake}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder="e.g. Sony"
                              />
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
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder="e.g. A6700"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="lensModel"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{copy.editor.lens}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder="e.g. Viltrox 27mm f1.2"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Exposure Info Collapsible */}
                <Collapsible
                  className={styles.editorSectionDisclosure}
                  open={exposureInfoOpen}
                  onOpenChange={setExposureInfoOpen}
                >
                  <div className={styles.editorSectionHead}>
                    <h3 className="text-lg font-semibold">{copy.editor.exposureInfo}</h3>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {exposureInfoOpen ? <ChevronDown /> : <ChevronRight />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className={`${styles.editorSectionBody} space-y-4 p-4`}>
                      <FormField
                        name="focalLength"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{copy.editor.focalLength}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                value={field.value ?? ""}
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
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.1"
                                value={field.value ?? ""}
                              />
                            </FormControl>
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
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                value={field.value ?? ""}
                              />
                            </FormControl>
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
                            <FormControl>
                              <ExposureTimeInput
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
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
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.1"
                                value={field.value ?? ""}
                              />
                            </FormControl>
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
                              <Input
                                type="datetime-local"
                                value={
                                  field.value
                                    ? new Date(field.value).toISOString().slice(0, 16)
                                    : ""
                                }
                                onChange={(e) =>
                                  field.onChange(new Date(e.target.value).toISOString())
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>

            {/* Form fields - Right side */}
            <div className="lg:col-span-2 space-y-6">
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{copy.editor.title}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={copy.editor.photoTitle} />
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
                      <Textarea {...field} rows={5} className="resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Favorite and Visibility as Radio Buttons */}
              <div className="space-y-4">
                <FormField
                  name="visibility"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormLabel className="font-medium">{copy.editor.visibility}</FormLabel>
                      <FormControl>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="visibility-public"
                              value="public"
                              checked={field.value === "public"}
                              onChange={() => field.onChange("public")}
                              className="h-4 w-4"
                            />
                            <label htmlFor="visibility-public" className="text-sm">{copy.editor.public}</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="visibility-private"
                              value="private"
                              checked={field.value === "private"}
                              onChange={() => field.onChange("private")}
                              className="h-4 w-4"
                            />
                            <label htmlFor="visibility-private" className="text-sm">{copy.editor.private}</label>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="isFavorite"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormLabel className="font-medium">{copy.editor.favorite}</FormLabel>
                      <FormControl>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="favorite-yes"
                              value="true"
                              checked={field.value === true}
                              onChange={() => field.onChange(true)}
                              className="h-4 w-4"
                            />
                            <label htmlFor="favorite-yes" className="text-sm">{copy.editor.yes}</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="favorite-no"
                              value="false"
                              checked={field.value === false}
                              onChange={() => field.onChange(false)}
                              className="h-4 w-4"
                            />
                            <label htmlFor="favorite-no" className="text-sm">{copy.editor.no}</label>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="gpsCoordinates"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-2 flex items-center justify-between">
                      <FormLabel className="mb-0">{copy.editor.gps}</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onPasteCoordinates}
                      >
                        {copy.editor.pasteCoordinates}
                      </Button>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        value={
                          form.getValues("latitude") && form.getValues("longitude")
                            ? `${form.getValues("latitude")}, ${form.getValues("longitude")}`
                            : ""
                        }
                        placeholder="e.g. 34.68747764987201, 135.52585996441778"
                        onChange={(e) => {
                          field.onChange(e);
                          const value = e.target.value;
                          const [lat, lng] = value.split(",").map((str) => parseFloat(str.trim()));
                          if (!isNaN(lat) && !isNaN(lng)) {
                            form.setValue("latitude", lat);
                            form.setValue("longitude", lng);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>{copy.editor.location}</FormLabel>
                <FormControl>
                  <div className="h-[200px] w-full rounded-md overflow-hidden border">
                    <Suspense fallback={<Skeleton className="h-full w-full" />}>
                      <MapComponent
                        draggableMarker
                        markers={mapValues.markers}
                        initialViewState={{
                          longitude: photo.longitude!,
                          latitude: photo.latitude!,
                          zoom: 10,
                        }}
                        onMarkerDragEnd={(data) => {
                          setCurrentLocation({ lat: data.lat, lng: data.lng });
                          form.setValue("latitude", data.lat);
                          form.setValue("longitude", data.lng);
                        }}
                      />
                    </Suspense>
                  </div>
                </FormControl>
                <FormDescription>
                  {currentLocation.lat !== null && currentLocation.lng !== null
                    ? formatGPSCoordinates(
                      currentLocation.lat,
                      currentLocation.lng
                    )
                    : copy.editor.noCoordinates}
                </FormDescription>
              </FormItem>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
