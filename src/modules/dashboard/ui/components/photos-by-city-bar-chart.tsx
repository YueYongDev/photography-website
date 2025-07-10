"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface PhotosByCityBarChartProps {
  data: {
    city: string;
    photoCount: number;
    countryCode: string;
  }[];
}

export function PhotosByCityBarChart({ data }: PhotosByCityBarChartProps) {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const chartData =
    data?.map((item, index) => ({
      city: item.city,
      photos: item.photoCount,
      countryCode: item.countryCode,
      fill: colors[index % colors.length],
    })) || [];

  const chartConfig = {
    photos: {
      label: "Photos",
    },
    ...Object.fromEntries(
      chartData.map((item) => [
        item.city,
        {
          label: `${item.city} (${item.countryCode})`,
          color: "hsl(var(--chart-2))",
        },
      ])
    ),
  } satisfies ChartConfig;

  return (
    <Card className="rounded-none shadow-none">
      <CardHeader>
        <CardTitle>Top Cities by Photos</CardTitle>
        <CardDescription>Top 5 cities with most photos</CardDescription>
      </CardHeader>
      <CardContent>
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
            <Bar dataKey="photos" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
