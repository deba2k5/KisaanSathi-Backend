import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const cropAdvisoryTool = createTool({
    id: "crop-advisory",
    description: "Provide crop-specific farming advice based on season and weather",

    inputSchema: z.object({
        crop: z.string(),
        season: z.string(),
        weatherRisk: z.enum(["low", "medium", "high"]).optional(),
        location: z.record(z.string(), z.any()).optional(),
    }),

    outputSchema: z.object({
        advice: z.string(),
        actionItems: z.array(z.string()),
    }),

    // non‑v1: inputs come from `context`
    execute: async ({ context }) => {
        const { crop, season, weatherRisk } = context;

        const riskLevel = weatherRisk ?? "low";

        let advice = "";
        const actionItems: string[] = [];

        if (riskLevel === "high") {
            advice = `Delay sowing of ${crop} for 5–7 days due to unfavorable weather conditions.`;
            actionItems.push(
                "Monitor weather daily",
                "Prepare drainage systems",
                "Keep seeds in dry storage"
            );
        } else if (riskLevel === "medium") {
            advice = `Proceed with caution for ${crop} sowing. Weather is partially favorable.`;
            actionItems.push(
                "Ensure good drainage",
                "Keep pesticides ready",
                "Monitor crop regularly"
            );
        } else {
            advice = `Weather conditions are favorable for ${crop} sowing in the ${season} season.`;
            actionItems.push(
                "Proceed with sowing as planned",
                "Ensure proper seed treatment",
                "Follow recommended fertilizer schedule"
            );
        }

        return {
            advice,
            actionItems,
        };
    },
});