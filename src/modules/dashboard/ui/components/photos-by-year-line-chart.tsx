"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

interface LineChartProps {
  data: Record<number, number>;
}

export function PhotosByYearLineChart({ data }: LineChartProps) {
  const chartData = Object.entries(data)
    .map(([year, count]) => ({
      year,
      photos: count,
    }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  const chartConfig = {
    photos: {
      label: "Photos",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="rounded-none shadow-none">
      <CardHeader>
        <CardTitle>Photos by Year</CardTitle>
        <CardDescription>Last 5 years statistics</CardDescription>
      </CardHeader>
      <CardContent>
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
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="photos"
              type="natural"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.4}
              stroke="hsl(var(--chart-2))"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
