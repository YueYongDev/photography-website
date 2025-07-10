"use client";

import { z } from "zod";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
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
  TrashIcon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BlurImage from "@/components/blur-image";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { photosUpdateSchema } from "@/db/schema/photos";
import { toast } from "sonner";

const MapboxComponent = dynamic(() => import("@/components/map"), {
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

  const update = trpc.photos.update.useMutation({
    onSuccess: () => {
      toast.success("Photo updated");
      utils.photos.getMany.invalidate();
      utils.photos.getOne.invalidate({ id: photoId });
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
      dateTimeOriginal: photo.dateTimeOriginal
        ? new Date(photo.dateTimeOriginal)
        : undefined,
    },
  });

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

  const fullUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
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

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="space-y-6 lg:col-span-3">
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
                        type="number"
                        step="0.001"
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

              <FormField
                name="isFavorite"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favorite</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      defaultValue={String(field.value ?? false)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a favorite" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="visibility"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
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
                        markers={mapValues.markers}
                        initialViewState={{
                          longitude: photo.longitude!,
                          latitude: photo.latitude!,
                          zoom: 10,
                        }}
                        onMarkerDragEnd={(data) =>
                          setCurrentLocation({ lat: data.lat, lng: data.lng })
                        }
                      />
                    </Suspense>
                  </div>
                </FormControl>
                <FormDescription>
                  {formatGPSCoordinates(
                    currentLocation.lat,
                    currentLocation.lng
                  )}
                </FormDescription>
              </FormItem>
            </div>

            <div className="flex flex-col gap-y-8 lg:col-span-2">
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
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
