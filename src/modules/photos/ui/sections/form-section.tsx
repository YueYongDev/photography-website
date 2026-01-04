"use client";

import { z } from "zod";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { formatGPSCoordinates } from "@/lib/utils";
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

const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-md border flex items-center justify-center bg-muted">
      <Skeleton className="h-full w-full" />
    </div>
  ),
});

export const FormSection = ({ photoId }: { photoId: string }) => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <FormSectionSuspense photoId={photoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSuspense = ({ photoId }: { photoId: string }) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [photo] = trpc.photos.getOne.useSuspenseQuery({ id: photoId });
  const [currentLocation, setCurrentLocation] = useState({
    lat: photo.latitude,
    lng: photo.longitude,
  });
  const [cameraInfoOpen, setCameraInfoOpen] = useState(false);
  const [exposureInfoOpen, setExposureInfoOpen] = useState(false);

  const update = trpc.photos.update.useMutation({
    onSuccess: () => {
      toast.success("Photo updated");
      utils.photos.getMany.invalidate();
      utils.photos.getOne.invalidate({ id: photoId });
      // 保存成功后跳转回Photo页面
      router.push("/photos");
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = trpc.photos.remove.useMutation({
    onSuccess: () => {
      toast.success("Photo removed");
      utils.photos.getMany.invalidate();
      router.push("/photos");
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

  const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/photograph/${photoId}`;
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="py-2.5 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Photo details</h1>
              <p className="text-xs text-muted-foreground">
                Manage your photo details
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Button
                type="button"
                variant="default"
                onClick={() => generateAIDescription.mutate({ id: photoId })}
                disabled={generateAIDescription.isPending}
                className="whitespace-nowrap"
              >
                {generateAIDescription.isPending ? (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4 animate-pulse" />
                    <span className="hidden sm:inline">Generating...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">AI Description</span>
                    <span className="sm:hidden">AI</span>
                  </>
                )}
              </Button>
              <Button type="submit" disabled={update.isPending}>
                Save
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
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Preview Image and Camera Info - Left side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preview Image */}
              <div className="flex flex-col gap-4 bg-muted rounded-xl overflow-hidden h-fit">
                <div className="aspect-video overflow-hidden relative">
                  <BlurImage
                    src={photo.url}
                    alt={photo.title}
                    fill
                    quality={20}
                    className="object-cover"
                    blurhash={photo.blurData}
                  />
                </div>
                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-sm text-muted-foreground">
                        Photo link
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link href={`/photograph/${photoId}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {fullUrl}
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
                <Collapsible open={cameraInfoOpen} onOpenChange={setCameraInfoOpen}>
                  <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg">
                    <h3 className="text-lg font-semibold">Camera Info</h3>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {cameraInfoOpen ? <ChevronDown /> : <ChevronRight />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="space-y-4 p-4 bg-muted rounded-b-lg">
                      <FormField
                        name="make"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Camera Make</FormLabel>
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
                            <FormLabel>Camera Model</FormLabel>
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
                            <FormLabel>Lens</FormLabel>
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
                <Collapsible open={exposureInfoOpen} onOpenChange={setExposureInfoOpen}>
                  <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg">
                    <h3 className="text-lg font-semibold">Exposure Info</h3>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {exposureInfoOpen ? <ChevronDown /> : <ChevronRight />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="space-y-4 p-4 bg-muted rounded-b-lg">
                      <FormField
                        name="focalLength"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Focal Length (mm)</FormLabel>
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
                            <FormLabel>f / Number</FormLabel>
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
                            <FormLabel>ISO</FormLabel>
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
                            <FormLabel>Exposure Time (s)</FormLabel>
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
                            <FormLabel>Exposure Compensation</FormLabel>
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
                            <FormLabel>Date Taken</FormLabel>
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
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Photo title" />
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
                    <FormLabel>Description</FormLabel>
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
                      <FormLabel className="font-medium">Visibility</FormLabel>
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
                            <label htmlFor="visibility-public" className="text-sm">Public</label>
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
                            <label htmlFor="visibility-private" className="text-sm">Private</label>
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
                      <FormLabel className="font-medium">Favorite</FormLabel>
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
                            <label htmlFor="favorite-yes" className="text-sm">Yes</label>
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
                            <label htmlFor="favorite-no" className="text-sm">No</label>
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
                    <FormLabel>GPS Coordinates</FormLabel>
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
                <FormLabel>Location</FormLabel>
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
                    : "No GPS coordinates available"}
                </FormDescription>
              </FormItem>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};