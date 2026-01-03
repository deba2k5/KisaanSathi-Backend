import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

export const plantDiseaseTool = createTool({
    id: "plant-disease-detection",
    description:
        "Analyze a crop image to detect disease, severity, and recommend treatment",

    inputSchema: z.object({
        imageUrl: z.string(),
        crop: z.string(),
    }),

    outputSchema: z.object({
        disease: z.string(),
        confidence: z.number(),
        severity: z.enum(["low", "medium", "high"]),
        remedy: z.string(),
        insuranceSuggested: z.boolean(),
    }),

    execute: async ({ context, mastra }) => {
        const { imageUrl, crop } = context;

        try {
            const res = await axios.post(
                `${process.env.AI_BACKEND_URL}/vision/plant-disease`,
                { imageUrl, crop },
                // optional: wire abortSignal into axios if you adapt it
            );

            const data = res.data;

            return {
                disease: data.disease ?? "Unknown",
                confidence: data.confidence ?? 0,
                severity: data.severity ?? "low",
                remedy: data.remedy ?? "Consult local agriculture expert",
                insuranceSuggested: Boolean(data.insuranceSuggested),
            };
        } catch (err: any) {
            const logger = mastra?.getLogger();
            logger?.error("Plant disease detection failed", { error: err });
            throw new Error("Plant disease detection failed");
        }
    },
});