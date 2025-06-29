
'use server';

/**
 * @fileOverview Generates insights from KPI data using AI.
 *
 * - generateInsights - A function that generates insights from KPI data.
 * - GenerateInsightsInput - The input type for the generateInsights function.
 * - GenerateInsightsOutput - The return type for the generateInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInsightsInputSchema = z.object({
  kpis: z
    .string()
    .describe('A string containing the KPI data to analyze.'),
  dateRange: z
    .string()
    .describe('The date range for the KPI data being analyzed, or a general description like "Datos generales" if no specific range is selected.'),
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

const GenerateInsightsOutputSchema = z.object({
  insights: z
    .string()
    .describe('The insights generated from the KPI data.'),
});
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  return generateInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInsightsPrompt',
  input: {schema: GenerateInsightsInputSchema},
  output: {schema: GenerateInsightsOutputSchema},
  prompt: `You are an AI assistant that analyzes KPI data and provides key insights.

  Analyze the following KPI data. The data corresponds to the period: {{{dateRange}}}.

  KPI Data: {{{kpis}}}

  Provide a summary of the key trends and patterns found in the data. Focus on what is most important and interesting.
  Make sure the result is human readable.`,
});

const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsightsFlow',
    inputSchema: GenerateInsightsInputSchema,
    outputSchema: GenerateInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
