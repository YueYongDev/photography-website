"use client";

import { useRouter } from "next/navigation";
import BlurImage from "@/components/blur-image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import VectorTopLeftAnimation from "@/components/vector-top-left-animation";

interface Props {
  title: string;
  coverPhoto: {
    id: string;
    url: string;
    title: string;
    blurData: string;
    width: number;
    height: number;
    aspectRatio: number;
  };
}

const CityCard = ({ title, coverPhoto }: Props) => {
  const router = useRouter();
  const fallbackRatio = 3 / 4;
  const aspectRatio =
    coverPhoto?.aspectRatio && coverPhoto.aspectRatio > 0
      ? coverPhoto.aspectRatio
      : coverPhoto?.width && coverPhoto?.height
        ? coverPhoto.width / coverPhoto.height
        : fallbackRatio;

  return (
    <div
      className="w-full relative group cursor-pointer"
      onClick={() => router.push(`/travel/${title}`)}
    >
      <AspectRatio
        ratio={aspectRatio}
        className="overflow-hidden rounded-lg relative"
      >
        <BlurImage
          src={coverPhoto?.url || "/placeholder.svg"}
          alt={coverPhoto?.title || ""}
          fill
          quality={25}
          priority
          sizes="(min-width: 1536px) calc(100vw / 3), (min-width: 768px) 50vw, 100vw"
          className="object-cover lg:group-hover:blur-xs lg:transition-[filter] lg:duration-300 lg:ease-out"
          blurhash={coverPhoto?.blurData || ""}
        />
      </AspectRatio>

      <div className="absolute top-0 left-0 z-20">
        <VectorTopLeftAnimation title={title} />
      </div>
    </div>
  );
};

export default CityCard;
