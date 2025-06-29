
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { CategoricalDataPoint } from "@/data/kpi-data";

interface BarChartCardProps {
  data: CategoricalDataPoint[];
  dataKey: keyof CategoricalDataPoint;
  categoryKey: keyof CategoricalDataPoint;
  chartConfig: ChartConfig;
  layout?: "horizontal" | "vertical";
  valueFormatter?: (value: number) => string;
}

export function BarChartCard({ data, dataKey, categoryKey, chartConfig, layout = "vertical", valueFormatter = (value) => value.toString() }: BarChartCardProps) {
   if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No hay datos disponibles.</div>;
  }
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout={layout} margin={{ top: 5, right: layout === 'vertical' ? 0 : 30, left: layout === 'vertical' ? -25 : 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={layout === 'vertical'} horizontal={layout === 'horizontal'} />
          {layout === "vertical" ? (
            <>
              <XAxis dataKey={categoryKey as string} tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={valueFormatter}/>
            </>
          ) : (
            <>
              <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={valueFormatter} />
              <YAxis dataKey={categoryKey as string} type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
            </>
          )}
          <RechartsTooltip 
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey={dataKey as string} fill={`var(--color-${dataKey as string})`} radius={layout === 'vertical' ? [4, 4, 0, 0] : [0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
