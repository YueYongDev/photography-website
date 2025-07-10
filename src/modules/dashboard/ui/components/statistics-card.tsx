import { NumberTicker } from "@/components/number-ticker";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: number;
  direction?: "up" | "down";
  percentage?: number;
}

export const StatisticsCard = ({ 
  title, 
  value, 
  direction,
  percentage = 0 
}: StatisticsCardProps) => {
  return (
    <div className="flex flex-col justify-between w-full h-[120px] border p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-light">{title}</h2>
        {direction && percentage !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-light ${direction === "up" ? "text-green-500" : "text-red-500"}`}>
            {direction === "up" ? (
              <>
                <TrendingUp className="h-4 w-4" />
                <span>+{percentage}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4" />
                <span>-{Math.abs(percentage)}%</span>
              </>
            )}
          </div>
        )}
      </div>

      <NumberTicker value={value} className="text-2xl" />
    </div>
  );
};
