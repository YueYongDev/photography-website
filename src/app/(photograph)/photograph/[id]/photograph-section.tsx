"use client";

import BlurImage from "@/components/blur-image";
import { Separator } from "@/components/ui/separator";
import { cn, formatExposureTime } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { ArrowLeft, Aperture, Clock, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { motion } from "framer-motion";
import Mapbox from "@/components/map";
import { BrandsLogo } from "@/components/brands-logo";

interface Props {
  id: string;
}

export const PhotographSection = ({ id }: Props) => {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ErrorBoundary fallback={<ErrorState />}>
        <PhotographSectionSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
};

const LoadingSkeleton = () => (
  <div className="relative size-full bg-gray-950">
    <div className="flex flex-col items-center justify-center h-screen gap-6 sm:gap-8 md:gap-10 px-3 sm:px-4">
      <div className="w-full text-center space-y-1 sm:space-y-2 animate-pulse">
        <div className="h-6 sm:h-7 md:h-8 lg:h-10 bg-gray-800 rounded-md w-full sm:w-4/5 md:w-3/4 mx-auto max-w-3xl"></div>
        <div className="h-3 sm:h-4 md:h-5 bg-gray-800/40 rounded-md w-4/5 sm:w-3/5 md:w-1/2 mx-auto max-w-xl mt-2"></div>
      </div>
      <div className="p-4 pb-0 bg-white/95 relative w-[90%] sm:w-[85%] md:w-[80%] h-[50vh] sm:h-[55vh] md:h-[60vh] animate-pulse shadow-2xl">
        <div className="w-full h-full bg-gray-200"></div>
      </div>
    </div>
  </div>
);

const ErrorState = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
    <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
    <p className="mb-6 text-gray-300">We could&apos;nt load this photograph</p>
    <button
      onClick={() => (window.location.href = "/")}
      className="px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-200 transition-colors"
    >
      Return Home
    </button>
  </div>
);

const PhotographSectionSuspense = ({ id }: Props) => {
  const router = useRouter();
  const [data] = trpc.photos.getOne.useSuspenseQuery({ id });
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative size-full"
      >
        {/* Back button */}
        <button
          className="fixed top-4 left-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>

        {/* Blurhash background layer */}
        <div className="fixed inset-0 -z-10 after:fixed after:inset-0 after:bg-black/40">
          <BlurImage
            src={data.url}
            alt={data.title}
            fill
            blurhash={data.blurData}
            className="object-cover blur-sm"
            priority
          />
        </div>

        {/* Content layer */}
        <div className="flex flex-col items-center justify-start h-screen gap-6 sm:gap-8 md:gap-10 px-3 sm:px-4 pt-14">
          {/* Title  */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full text-center space-y-1 max-w-4xl mx-auto"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white drop-shadow-lg tracking-tight leading-tight px-2 line-clamp-1">
              {data.title}
            </h1>
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-yellow-50 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] font-normal mt-1 sm:mt-2 px-4 bg-black/20 py-1 rounded-full mx-auto inline-block">
              {data.city}, {data.countryCode}
            </h2>
          </motion.div>

          {/* Image  */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pb-0 bg-white/95 relative w-auto max-h-[70dvh] shadow-2xl"
          >
            <BlurImage
              src={data.url}
              alt={data.title}
              width={data.width}
              height={data.height}
              blurhash={data.blurData}
              className="w-auto max-h-[65dvh]"
              priority={false}
            />

            <div className="absolute -bottom-10 left-0 px-6 py-2 w-full bg-white/95 flex justify-between items-center select-none text-gray-900 shadow-md">
              <div className="flex flex-col text-center">
                <h1
                  className={cn(
                    "font-semibold text-xs sm:text-sm lg:text-lg",
                    data.aspectRatio < 1 ? "lg:text-sm" : "lg:text-lg"
                  )}
                >
                  <span className="flex items-center justify-center gap-1">
                    {data.make} {data.model}
                  </span>
                </h1>
                <p className="text-xs text-gray-500">{data.lensModel}</p>
              </div>
              <div className="flex items-center gap-2">
                <BrandsLogo brand={data.make || ""} />
                {data.aspectRatio >= 1 && (
                  <>
                    <Separator
                      orientation="vertical"
                      className="hidden sm:block h-10 bg-gray-300"
                    />
                    <div className="hidden sm:flex flex-col gap-[2px]">
                      <div className="space-x-[6px] text-xs lg:text-sm font-mono text-gray-800">
                        <span>{data.focalLength35mm + "mm"}</span>
                        <span>{"ƒ/" + data.fNumber}</span>
                        <span>
                          {data.exposureTime &&
                            formatExposureTime(data.exposureTime)}
                        </span>
                        <span>{"ISO" + data.iso}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <p>
                          {data.dateTimeOriginal &&
                            new Date(data.dateTimeOriginal).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white"
          >
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
              <motion.div
                animate={{
                  y: [0, 12, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="w-2 h-2 bg-white rounded-full mt-2"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Apple-style Grid Section */}
      <div
        ref={gridRef}
        className="min-h-screen relative text-white py-12 px-4 sm:px-6 lg:px-8"
      >
        {/* Blurhash background layer */}

        <div className="max-w-7xl mx-auto">
          {/* Grid Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              {data.title}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {data.description}
            </p>
          </div>

          {/* Apple-style Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Hero Image - 2 columns + 2 rows */}
            <div className="md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md relative group h-[560px]">
              <div className="w-full h-full overflow-hidden">
                <BlurImage
                  src={data.url}
                  alt={data.title}
                  width={data.width < 1200 ? data.width : 1200}
                  height={data.height < 1600 ? data.height : 1600}
                  blurhash={data.blurData}
                  className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-500"
                  style={{ objectPosition: "center" }}
                />
              </div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold mb-1">{data.title}</h3>
                <p className="text-gray-300">Masterpiece captured</p>
              </div>
            </div>

            {/* Camera Specs */}
            <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md p-6 flex flex-col justify-between">
              <h3 className="text-2xl font-bold mb-1">{data.make}</h3>
              <div>
                <p className="text-gray-300 text-sm">Camera</p>
                <p className="text-xl font-semibold mt-1">{data.model}</p>
              </div>
            </div>

            {/* Lens Specs */}
            <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md p-6 flex flex-col justify-between">
              <div className="text-2xl font-bold mb-1">Lens</div>
              <div>
                <p className="text-gray-300 text-sm">Premium Glass</p>
                <p className="text-lg font-semibold mt-1">
                  {data.lensModel || "Professional Lens"}
                </p>
              </div>
            </div>

            {/* Aperture */}
            <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md p-6 flex flex-col justify-between group relative">
              <Aperture className="absolute right-6 top-6 w-12 h-12 text-gray-600 group-hover:text-white transition-colors duration-300" />
              <div className="text-2xl font-bold mb-1">ƒ/{data.fNumber}</div>
              <div>
                <p className="text-gray-300 text-sm">Aperture</p>
                <p className="text-lg mt-1">Depth of field control</p>
              </div>
            </div>

            {/* Exposure */}
            <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md p-6 flex flex-col justify-between group relative">
              <Clock className="absolute right-6 top-6 w-12 h-12 text-gray-600 group-hover:text-white transition-colors duration-300" />
              <div className="text-2xl font-bold mb-1">
                {data.exposureTime && formatExposureTime(data.exposureTime)}
              </div>
              <div>
                <p className="text-gray-300 text-sm">Exposure</p>
                <p className="text-lg mt-1">Perfect timing</p>
              </div>
            </div>

            {/* Left side 2x2 grid */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {/* ISO - Top Left */}
              <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md p-6 flex flex-col justify-between">
                <div className="text-2xl font-bold mb-1">ISO {data.iso}</div>
                <div>
                  <p className="text-gray-300 text-sm">Sensitivity</p>
                  <p className="text-lg mt-1">
                    {Number(data.iso) <= 400 ? "Low noise" : "High sensitivity"}
                  </p>
                </div>
              </div>

              {/* Focal Length - Top Right */}
              <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md p-6 flex flex-col justify-between">
                <div className="text-2xl font-bold mb-1">
                  {data.focalLength35mm}mm
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Focal Length</p>
                  <p className="text-lg mt-1">
                    {Number(data.focalLength35mm) < 35
                      ? "Wide angle"
                      : Number(data.focalLength35mm) > 70
                      ? "Telephoto"
                      : "Standard"}
                  </p>
                </div>
              </div>

              {/* Date/Time - Bottom Left */}
              <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md p-6 flex flex-col justify-between">
                <div className="text-xl font-bold mb-1">
                  {data.dateTimeOriginal &&
                    new Date(data.dateTimeOriginal).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Captured on</p>
                  <p className="text-lg mt-1">A moment preserved</p>
                </div>
              </div>

              {/* Resolution - Bottom Right */}
              <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md p-6 flex flex-col justify-between group relative">
                <ImageIcon className="absolute right-6 top-6 w-12 h-12 text-gray-600 group-hover:text-white transition-colors duration-300" />
                <div className="text-2xl font-bold mb-1">
                  {data.width} × {data.height}
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Resolution</p>
                  <p className="text-lg mt-1">
                    {data.width * data.height > 20000000
                      ? "Ultra high definition"
                      : "High definition"}
                  </p>
                </div>
              </div>
            </div>

            {/* Location - Large panel on right */}
            <div className="md:col-span-2 rounded-3xl overflow-hidden flex flex-col justify-between group relative h-full">
              <Mapbox
                markers={[
                  {
                    latitude: data.latitude || 0,
                    longitude: data.longitude || 0,
                    id: data.city || "",
                  },
                ]}
                initialViewState={{
                  longitude: data.longitude || 0,
                  latitude: data.latitude || 0,
                  zoom: 14,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
