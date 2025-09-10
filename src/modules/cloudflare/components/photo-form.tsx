"use client";

import { z } from "zod";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import BlurImage from "@/components/blur-image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyCheckIcon, CopyIcon, ChevronDown, ChevronRight, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetAddress } from "../hooks/use-get-address";
import { photosInsertSchema } from "@/db/schema/photos";
import type { TExifData, TImageInfo } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

const MapboxComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-md border flex items-center justify-center bg-muted">
      <Skeleton className="h-full w-full" />
    </div>
  ),
});

interface PhotoFormProps {
  exif: TExifData | null;
  imageInfo: TImageInfo;
  url: string;
  onCreateSuccess?: () => void;
}

export function PhotoForm({ exif, imageInfo, url, onCreateSuccess }: PhotoFormProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [cameraInfoOpen, setCameraInfoOpen] = useState(true);
  const [exposureInfoOpen, setExposureInfoOpen] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({
    lat: exif?.latitude ?? 39.9042,
    lng: exif?.longitude ?? 116.4074,
  });

  useEffect(() => {
    if (!exif) setCameraInfoOpen(true);
  }, [exif]);

  const { data: address } = useGetAddress({
    lat: currentLocation.lat,
    lng: currentLocation.lng,
  });

  const utils = trpc.useUtils();
  const create = trpc.photos.create.useMutation({
    onSuccess: () => {
      toast.success("Photo created");
      utils.photos.getMany.invalidate();
      onCreateSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof photosInsertSchema>>({
    resolver: zodResolver(photosInsertSchema),
    defaultValues: {
      title: "",
      description: "",
      visibility: "public",
      isFavorite: false,
      url,
      aspectRatio: imageInfo.aspectRatio,
      width: imageInfo.width,
      height: imageInfo.height,
      blurData: imageInfo.blurhash,
      latitude: exif?.latitude ?? currentLocation.lat,
      longitude: exif?.longitude ?? currentLocation.lng,
      ...exif,
      // 将dateTimeOriginal从字符串转换为Date对象
      dateTimeOriginal: exif?.dateTimeOriginal ? new Date(exif.dateTimeOriginal) : undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof photosInsertSchema>) => {
    const formData = {
      ...values,
      country: address?.features[0].properties.context.country?.name,
      countryCode: address?.features[0].properties.context.country?.country_code,
      region: address?.features[0].properties.context.region?.name,
      city:
        address?.features[0].properties.context.country?.country_code === "JP" ||
        address?.features[0].properties.context.country?.country_code === "TW"
          ? address?.features[0].properties.context.region?.name
          : address?.features[0].properties.context.place?.name,
      district: address?.features[0].properties.context.locality?.name,
      fullAddress: address?.features[0].properties.full_address,
      placeFormatted: address?.features[0].properties.place_formatted,
    };
    console.log(formData);
    create.mutate(formData);
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 创建一个新的mutation用于AI生成描述
  const generateAIDescription = trpc.ai.generatePhotoDescriptionFromUrl.useMutation({
    onSuccess: (data) => {
      form.setValue("title", data.title);
      form.setValue("description", data.description);
      toast.success("AI description generated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate AI description");
    },
  });

  return (
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
              onClick={() => generateAIDescription.mutate({
                imageUrl: url
              })}
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
            <Button type="submit" disabled={create.isPending}>
              Save
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Preview Image and Camera Info - Left side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Image */}
            <div className="flex flex-col gap-4 bg-muted rounded-xl overflow-hidden h-fit">
              <div className="aspect-video overflow-hidden relative">
                <BlurImage
                  src={url}
                  alt="photo"
                  fill
                  blurhash={imageInfo.blurhash}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4 flex flex-col gap-y-6">
                <div className="flex justify-between items-center gap-x-2">
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground">Photo link</p>
                    <div className="flex items-center gap-x-2">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <p className="line-clamp-1 text-sm text-blue-500">{url}</p>
                      </a>
                      <Button type="button" variant="ghost" size="icon" onClick={onCopy} className="shrink-0" disabled={isCopied}>
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
                            <Input
                              {...field}
                              type="text"
                              value={field.value ?? ""}
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
              control={form.control}
              name="title"
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
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} className="resize-none" placeholder="Photo description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <div className="h-[300px] w-full rounded-md overflow-hidden border">
                  <Suspense fallback={<Skeleton className="h-full w-full" />}>
                    <MapboxComponent
                      draggableMarker
                      markers={[
                        { id: "location", longitude: currentLocation.lng, latitude: currentLocation.lat },
                      ]}
                      onMarkerDragEnd={(data) => {
                        setCurrentLocation({ lat: data.lat, lng: data.lng });
                        form.setValue("latitude", data.lat);
                        form.setValue("longitude", data.lng);
                      }}
                      initialViewState={{ longitude: currentLocation.lng, latitude: currentLocation.lat, zoom: 14 }}
                    />
                  </Suspense>
                </div>
              </FormControl>
              <FormDescription>
                {address?.features?.[0]?.properties?.full_address}
              </FormDescription>
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              {(["latitude", "longitude"] as const).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{key === "latitude" ? "Latitude" : "Longitude"}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="any"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(value);
                            setCurrentLocation((prev) => ({ ...prev, [key === "latitude" ? "lat" : "lng"]: value }));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

          </div>
        </div>
        <div className="flex items-center justify-end mt-6">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}