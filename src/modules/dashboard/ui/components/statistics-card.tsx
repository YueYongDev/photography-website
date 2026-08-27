import { NumberTicker } from "@/components/number-ticker";
import styles from "../studio.module.css";

interface StatisticsCardProps {
  index: string;
  title: string;
  value: number;
  direction?: "up" | "down";
  percentage?: number;
}

export const StatisticsCard = ({ 
  index,
  title, 
  value, 
  direction,
  percentage = 0 
}: StatisticsCardProps) => {
  return (
    <div className={styles.stat}>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{index} / {title}</span>
        {direction && percentage !== 0 && (
          <span className={styles.statDelta}>
            {direction === "up" ? "+" : "−"}{Math.abs(percentage)}% YoY
          </span>
        )}
      </div>

      <NumberTicker value={value} className={styles.statValue} />
    </div>
  );
};
