
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { TimeSeriesDataPoint } from "@/data/kpi-data";

interface LineChartCardProps {
  data: TimeSeriesDataPoint[];
  dataKey: keyof TimeSeriesDataPoint;
  chartConfig: ChartConfig;
  title?: string;
  valueFormatter?: (value: number) => string;
}

export function LineChartCard({ data, dataKey, chartConfig, title, valueFormatter = (value) => value.toString() }: LineChartCardProps) {
  const formattedData = React.useMemo(() => {
    return data.map(item => ({
      ...item,
      date: format(parseISO(item.date), "MMM d", { locale: es }),
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[220px] text-muted-foreground">No hay datos disponibles para este período.</div>;
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formattedData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={valueFormatter}
          />
          <RechartsTooltip 
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />} 
          />
          <Area
            dataKey={dataKey as string}
            type="natural"
            fill={`var(--color-${dataKey as string})`}
            fillOpacity={0.4}
            stroke={`var(--color-${dataKey as string})`}
            stackId="a"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

