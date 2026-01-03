import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

export const weatherTool = createTool({
    id: "get-weather-forecast",
    description: "Fetch weather forecast for farming location",

    inputSchema: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        location: z.string().optional(),
    }),

    outputSchema: z.object({
        rainForecast: z.string(),
        temperatureRange: z.string(),
        riskLevel: z.enum(["low", "medium", "high"]),
        summary: z.string(),
    }),

    // non‑v1: use `execute({ context, abortSignal, ... })`
    execute: async ({ context }) => {
        const { latitude, longitude, location } = context;

        try {
            const response = await axios.post(
                `${process.env.BACKEND_URL}/api/internal/weather`,
                { latitude, longitude, location },
                // axios doesn’t natively take AbortSignal without an adapter,
                // but this is where you’d wire `abortSignal` if you add one.
            );

            return {
                rainForecast: response.data.rainForecast ?? "Unknown",
                temperatureRange: response.data.temperatureRange ?? "Unknown",
                riskLevel: response.data.riskLevel ?? "medium",
                summary: response.data.summary ?? "No summary available",
            };
        } catch (error: any) {
            console.error("Weather tool error:", error);

            // Still return something that matches outputSchema
            return {
                rainForecast: "Unable to fetch forecast",
                temperatureRange: "N/A",
                riskLevel: "medium",
                summary: "Weather data temporarily unavailable",
            };
        }
    },
});