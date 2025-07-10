import { AspectRatio } from "./ui/aspect-ratio";
import { Skeleton } from "./ui/skeleton";
import VectorTopLeftAnimation from "./vector-top-left-animation";

export const CityCardLoadingSkeleton = () => {
  return (
    <div className="mt-3 w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="w-full relative group cursor-pointer">
          <AspectRatio
            ratio={0.75 / 1}
            className="overflow-hidden rounded-lg relative"
          >
            <Skeleton className="w-full h-full" />
          </AspectRatio>

          <div className="absolute top-0 left-0 z-20">
            <VectorTopLeftAnimation title="Loading..." />
          </div>
        </div>
      ))}
    </div>
  );
};
