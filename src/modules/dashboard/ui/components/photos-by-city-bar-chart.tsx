"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import styles from "../studio.module.css";
import { useStudioLocale } from "../../i18n/studio-locale";

interface PhotosByCityBarChartProps {
  data: {
    city: string;
    photoCount: number;
    countryCode: string;
  }[];
}

export function PhotosByCityBarChart({ data }: PhotosByCityBarChartProps) {
  const { copy } = useStudioLocale();
  const chartData =
    data?.map((item) => ({
      city: item.city,
      photos: item.photoCount,
      countryCode: item.countryCode,
      fill: "var(--studio-accent)",
    })) || [];

  const chartConfig = {
    photos: {
      label: copy.overview.photos,
    },
    ...Object.fromEntries(
      chartData.map((item) => [
        item.city,
        {
          label: `${item.city} (${item.countryCode})`,
          color: "var(--studio-accent)",
        },
      ])
    ),
  } satisfies ChartConfig;

  return (
    <section className={styles.chartPanel}>
      <header className={styles.chartHeader}>
        <div>
          <h2>{copy.overview.mostObserved}</h2>
          <p>{copy.overview.topCities}</p>
        </div>
        <span className={styles.chartIndex}>A / 02</span>
      </header>
      <div className={styles.chartBody}>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: -15,
              right: 20,
              top: 0,
              bottom: 0,
            }}
          >
            <YAxis
              dataKey="city"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={120}
              tick={({ x, y, payload }) => {
                const city = payload.value;
                const label =
                  chartConfig[city as keyof typeof chartConfig]?.label || "";
                const [cityName, countryCode] = label.split(" (");
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={-4}
                      textAnchor="end"
                      fill="currentColor"
                      className="text-xs font-medium truncate"
                      style={{ maxWidth: "100px" }}
                    >
                      {cityName}
                    </text>
                    <text
                      x={0}
                      y={0}
                      dy={12}
                      textAnchor="end"
                      fill="currentColor"
                      className="text-[10px] text-muted-foreground"
                    >
                      {countryCode?.replace(")", "")}
                    </text>
                  </g>
                );
              }}
            />
            <XAxis dataKey="photos" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="photos" layout="vertical" radius={8} />
          </BarChart>
        </ChartContainer>
      </div>
    </section>
  );
}
