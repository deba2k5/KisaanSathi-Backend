import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { plantDiseaseTool } from "../tools/plantDisease.tool";
import { insuranceGuideTool } from "../tools/insuranceGuide.tool";
import { dbTool } from "../tools/db.tool";

/* -------------------- Step 1: Detect Disease -------------------- */
const detectDiseaseStep = createStep({
    id: "detect-disease",
    inputSchema: z.object({
        imageUrl: z.string(),
        crop: z.string(),
        userId: z.string(),
    }),
    outputSchema: z.object({
        diseaseResult: plantDiseaseTool.outputSchema,
        userContext: z.object({
            imageUrl: z.string(),
            crop: z.string(),
            userId: z.string(),
        }),
    }),
    execute: async ({ inputData }) => {
        const diseaseResult = await plantDiseaseTool.execute({
            context: {
                imageUrl: inputData.imageUrl,
                crop: inputData.crop,
            },
        } as any); // `as any` only if needed to satisfy TS

        return {
            diseaseResult,
            userContext: {
                imageUrl: inputData.imageUrl,
                crop: inputData.crop,
                userId: inputData.userId,
            },
        };
    },
});

/* -------------------- Step 2: Check Insurance Eligibility -------------------- */
const checkInsuranceStep = createStep({
    id: "check-insurance",
    inputSchema: z.object({
        diseaseResult: plantDiseaseTool.outputSchema,
        userContext: z.object({
            imageUrl: z.string(),
            crop: z.string(),
        }),
    }),
    outputSchema: z.object({
        diseaseResult: plantDiseaseTool.outputSchema,
        insuranceResult: insuranceGuideTool.outputSchema,
        userContext: z.object({
            imageUrl: z.string(),
            crop: z.string()
        }),
    }),
    execute: async ({ inputData }) => {
        const { diseaseResult, userContext } = inputData;

        const insuranceResult = await insuranceGuideTool.execute({
            context: {
                disease: diseaseResult.disease,
                severity: diseaseResult.severity,
                crop: userContext.crop,
            },
        } as any);

        return {
            diseaseResult,
            insuranceResult,
            userContext,
        };
    },
});

/* -------------------- Step 3: Save Report & Format Output -------------------- */
const saveReportStep = createStep({
    id: "save-report",
    inputSchema: z.object({
        diseaseResult: plantDiseaseTool.outputSchema,
        insuranceResult: insuranceGuideTool.outputSchema,
        userContext: z.object({
            imageUrl: z.string(),
            crop: z.string(),
        }),
    }),
    outputSchema: z.object({
        message: z.string(),
    }),
    execute: async ({ inputData }) => {
        const { diseaseResult, insuranceResult, userContext } = inputData;

        await dbTool.execute({
            collection: "disease_reports",
            data: {
                crop: userContext.crop,
                imageUrl: userContext.imageUrl,
                detectedDisease: diseaseResult.disease,
                confidence: diseaseResult.confidence,
                severity: diseaseResult.severity,
                remedy: diseaseResult.remedy,
                insuranceSuggested: insuranceResult.claimPossible || false,
                createdAt: new Date().toISOString(),
            },
        } as any);

        let response = `🌾 Disease Analysis:
Disease: ${diseaseResult.disease}
Severity: ${diseaseResult.severity.toUpperCase()}
Confidence: ${diseaseResult.confidence}%

💊 Treatment:
${diseaseResult.remedy}`;

        if (insuranceResult.claimPossible) {
            response += `

🛡️ Insurance Claim Recommended:
This is a ${diseaseResult.severity} severity case. You may be eligible for crop insurance claim.

Required Documents:
${insuranceResult.requiredDocuments?.map((doc: string) => `- ${doc}`).join('\n') || 'None'}

Steps:
${insuranceResult.steps?.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') || 'None'}`;
        }

        return {
            message: response,
        };
    },
});

/* -------------------- Workflow Definition -------------------- */
export const diseaseWorkflow = createWorkflow({
    id: "plant-disease-detection-workflow",
    inputSchema: z.object({
        imageUrl: z.string().describe("URL of the plant image"),
        crop: z.string().describe("Type of crop (e.g., wheat, rice, tomato)"),
        userId: z.string(),
    }),
    outputSchema: z.object({
        message: z.string(),
    }),
})
    .then(detectDiseaseStep)
    .then(checkInsuranceStep)
    .then(saveReportStep)
    .commit();
