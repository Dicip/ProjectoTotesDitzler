
"use client";

import * as React from "react";
import { generateInsights, type GenerateInsightsInput } from "@/ai/flows/generate-insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Zap } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface AiInsightsProps {
  kpiDataString: string;
  dateRangeString: string;
}

export function AiInsights({ kpiDataString, dateRangeString }: AiInsightsProps) {
  const [insights, setInsights] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchInsights() {
      if (!kpiDataString || !dateRangeString) {
        // Don't fetch if essential data is missing, or set to a default state
        setInsights("Proporcione datos y un rango de fechas para generar insights.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        const input: GenerateInsightsInput = {
          kpis: kpiDataString,
          dateRange: dateRangeString,
        };
        const result = await generateInsights(input);
        setInsights(result.insights);
      } catch (err) {
        console.error("Error generating insights:", err);
        setError("No se pudieron generar los insights. Inténtelo de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInsights();
  }, [kpiDataString, dateRangeString]);

  return (
    <Card className="bg-accent/20 border-accent">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Zap className="h-6 w-6 text-accent" />
        <CardTitle className="text-accent">Insights Inteligentes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && insights && (
          <p className="text-sm text-foreground/80 whitespace-pre-line">{insights}</p>
        )}
      </CardContent>
    </Card>
  );
}
