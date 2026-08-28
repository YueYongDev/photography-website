"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import styles from "../studio.module.css";
import { useStudioLocale } from "../../i18n/studio-locale";

interface LineChartProps {
  data: Record<number, number>;
}

export function PhotosByYearLineChart({ data }: LineChartProps) {
  const { copy } = useStudioLocale();
  const chartData = Object.entries(data)
    .map(([year, count]) => ({
      year,
      photos: count,
    }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  const chartConfig = {
    photos: {
      label: copy.overview.photos,
      color: "var(--studio-accent)",
    },
  } satisfies ChartConfig;

  return (
    <section className={styles.chartPanel}>
      <header className={styles.chartHeader}>
        <div>
          <h2>{copy.overview.photographsOverTime}</h2>
          <p>{copy.overview.framesByYear}</p>
        </div>
        <span className={styles.chartIndex}>A / 01</span>
      </header>
      <div className={styles.chartBody}>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -25,
              right: 10,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--studio-muted)", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--studio-muted)", fontSize: 11 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="photos"
              type="natural"
              fill="var(--studio-accent)"
              fillOpacity={0.24}
              stroke="var(--studio-accent)"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </section>
  );
}
