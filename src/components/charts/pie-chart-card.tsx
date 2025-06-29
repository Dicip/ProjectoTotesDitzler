
"use client";

import * as React from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent
} from "@/components/ui/chart";
import type { PieDataPoint } from "@/data/kpi-data";

interface PieChartCardProps {
  data: PieDataPoint[];
  chartConfig: ChartConfig;
  nameKey?: keyof PieDataPoint;
  valueKey?: keyof PieDataPoint;
}

export function PieChartCard({ data, chartConfig, nameKey = "name", valueKey = "value" }: PieChartCardProps) {
   if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[220px] text-muted-foreground">No hay datos disponibles.</div>;
  }
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full h-[250px]" // Altura fija, ancho completo
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <RechartsTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            dataKey={valueKey as string}
            nameKey={nameKey as string}
            innerRadius={50} // Puedes ajustar esto si es necesario
            outerRadius={80} // Puedes ajustar esto si es necesario
            strokeWidth={4}
            cy="45%" // Centrar el gráfico un poco más arriba si la leyenda se quita/mueve
          />
          <Legend content={<ChartLegendContent nameKey={nameKey as string} />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

