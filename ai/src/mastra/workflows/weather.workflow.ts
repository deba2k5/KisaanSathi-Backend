import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { weatherTool } from "../tools/weather.tool";
import { cropAdvisoryTool } from "../tools/cropAdvisory.tool";
import { dbTool } from "../tools/db.tool";

/* -------------------- Step 1: Get Weather -------------------- */
const getWeatherStep = createStep({
    id: "get-weather",
    inputSchema: z.object({
        location: z.string(),
        userId: z.string(),
        crop: z.string(),
        season: z.string(),
    }),
    outputSchema: z.object({
        weatherResult: weatherTool.outputSchema,
        userContext: z.object({
            location: z.string(),
            userId: z.string(),
            crop: z.string(),
            season: z.string(),
        }),
    }),
    execute: async ({ inputData }) => {
        const weatherResult = await weatherTool.execute({
            context: {
                location: inputData.location,
                // latitude/longitude can be added here if you use them
            },
        } as any);

        return {
            weatherResult,
            userContext: {
                location: inputData.location,
                userId: inputData.userId,
                crop: inputData.crop,
                season: inputData.season,
            },
        };
    },
});

/* -------------------- Step 2: Generate Advisory -------------------- */
const generateAdvisoryStep = createStep({
    id: "generate-advisory",
    inputSchema: z.object({
        weatherResult: weatherTool.outputSchema,
        userContext: z.object({
            location: z.string(),
            userId: z.string(),
            crop: z.string(),
            season: z.string(),
        }),
    }),
    outputSchema: z.object({
        weatherResult: weatherTool.outputSchema,
        advisoryResult: cropAdvisoryTool.outputSchema,
        userContext: z.object({
            location: z.string(),
            userId: z.string(),
            crop: z.string(),
            season: z.string(),
        }),
    }),
    execute: async ({ inputData }) => {
        const { weatherResult, userContext } = inputData;

        const advisoryResult = await cropAdvisoryTool.execute({
            context: {
                crop: userContext.crop,
                season: userContext.season,
                weatherRisk: weatherResult.riskLevel,
                location: { name: userContext.location },
            },
        } as any);

        return {
            weatherResult,
            advisoryResult,
            userContext,
        };
    },
});

/* -------------------- Step 3: Save Advisory & Format Output -------------------- */
const saveAdvisoryStep = createStep({
    id: "save-advisory",
    inputSchema: z.object({
        weatherResult: weatherTool.outputSchema,
        advisoryResult: cropAdvisoryTool.outputSchema,
        userContext: z.object({
            location: z.string(),
            userId: z.string(),
            crop: z.string(),
            season: z.string(),
        }),
    }),
    outputSchema: z.object({
        message: z.string(),
    }),
    execute: async ({ inputData }) => {
        const { weatherResult, advisoryResult, userContext } = inputData;

        await dbTool.execute({
            context: {
                collection: "crop_records",
                data: {
                    userId: userContext.userId,
                    crop: userContext.crop,
                    season: userContext.season,
                    advisory: advisoryResult.advice,
                    weatherRisk: weatherResult.riskLevel,
                    createdAt: new Date().toISOString(),
                },
            },
        } as any
        );

        const actionItemsList =
            advisoryResult.actionItems
                ?.map((item: string, i: number) => `${i + 1}. ${item}`)
                .join("\n") || "None";

        const message = `
🌤️ Weather Update:
${weatherResult.summary}
Risk Level: ${weatherResult.riskLevel.toUpperCase()}

🌾 Crop Advisory:
${advisoryResult.advice}

📋 Action Items:
${actionItemsList}
`;

        return { message };
    },
});

/* -------------------- Workflow Definition -------------------- */
export const weatherWorkflow = createWorkflow({
    id: "weather-crop-advisory-workflow",
    inputSchema: z.object({
        location: z.string(),
        userId: z.string(),
        crop: z.string(),
        season: z.string(),
    }),
    outputSchema: z.object({
        message: z.string(),
    }),
})
    .then(getWeatherStep)
    .then(generateAdvisoryStep)
    .then(saveAdvisoryStep)
    .commit();