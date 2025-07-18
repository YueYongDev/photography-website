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
import { Checkbox } from "@/components/ui/checkbox";
import BlurImage from "@/components/blur-image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyCheckIcon, CopyIcon, ChevronDown, ChevronRight } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    lat: exif?.latitude ?? 39.9042,
    lng: exif?.longitude ?? 116.4074,
  });

  useEffect(() => {
    if (!exif) setOpen(true);
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
      visibility: "private",
      isFavorite: false,
      url,
      aspectRatio: imageInfo.aspectRatio,
      width: imageInfo.width,
      height: imageInfo.height,
      blurData: imageInfo.blurhash,
      latitude: exif?.latitude ?? currentLocation.lat,
      longitude: exif?.longitude ?? currentLocation.lng,
      ...exif,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="space-y-6 lg:col-span-3">
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

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full p-2 border rounded-md">
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Collapsible: Camera Info */}
            <Collapsible open={open} onOpenChange={setOpen}>
              <div className="flex items-center justify-between px-1 py-2">
                <h3 className="text-lg font-semibold">Camera Info (optional)</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {open ? <ChevronDown /> : <ChevronRight />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {([
                    ["make", "Camera Make", "e.g. Sony"],
                    ["model", "Camera Model", "e.g. A6700"],
                    ["lensModel", "Lens Model", "e.g. Viltrox 27mm F1.2"],
                    ["focalLength", "Focal Length (mm)", "27"],
                    ["focalLength35mm", "Focal Length 35mm", "40"],
                    ["fNumber", "Aperture (f/)", "1.8"],
                    ["exposureTime", "Shutter Speed (s)", "0.004"],
                    ["exposureCompensation", "Exposure Compensation (EV)", "0"],
                    ["iso", "ISO", "100"],
                    ["dateTimeOriginal", "Date Taken", ""]
                  ] as const).map(([name, label, placeholder]) => (
                    <FormField
                      key={name}
                      control={form.control}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      name={name as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            {name === "dateTimeOriginal" ? (
                              <Input
                                type="datetime-local"
                                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                              />
                            ) : (
                              <Input
                                {...field}
                                type={typeof field.value === "number" ? "number" : "text"}
                                placeholder={placeholder}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="flex flex-col gap-y-8 lg:col-span-2">
            <div className="flex flex-col gap-4 bg-muted rounded-md overflow-hidden h-fit">
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
            <FormField
              control={form.control}
              name="isFavorite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Favorite</FormLabel>
                    <FormDescription>Mark this photo as favorite</FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex items-center justify-end mt-6">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}