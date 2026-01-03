import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { insuranceGuideTool } from "../tools/insuranceGuide.tool";
import { dbTool } from "../tools/db.tool";

/* -------------------- Step 1: Get Insurance Guidance -------------------- */

const getInsuranceGuidanceStep = createStep({
    id: "get-insurance-guidance",
    inputSchema: insuranceGuideTool.inputSchema,
    outputSchema: insuranceGuideTool.outputSchema,
    execute: async ({ inputData }) => {
        // Direct tool invocation (undocumented but commonly used)
        return insuranceGuideTool.execute(inputData as any);
    },
});

/* -------------------- Shared Final Output -------------------- */

const insuranceResponseSchema = z.object({
    message: z.string(),
});

/* -------------------- Step 2A: Eligible → Create Claim Draft -------------------- */

const createClaimDraftStep = createStep({
    id: "create-claim-draft",
    inputSchema: insuranceGuideTool.outputSchema,
    outputSchema: insuranceResponseSchema,
    execute: async ({ inputData, getInitData }) => {
        const { userId, diseaseReportId } = getInitData();

        await dbTool.execute({
            context: {
                collection: "insurance_claims",
                data: {
                    userId,
                    diseaseReportId,
                    status: "draft",
                    documents: [],
                    createdAt: new Date().toISOString(),
                },
            },
        } as any);

        const documents = inputData.requiredDocuments
            .map((d: string) => `- ${d}`)
            .join("\n");

        const steps = inputData.steps
            .map((s: string, i: number) => `${i + 1}. ${s}`)
            .join("\n");

        return {
            message: `🛡️ Insurance Claim Guidance

You are eligible to file a crop insurance claim.

📄 Required Documents:
${documents}

📋 Steps:
${steps}

⏱️ Timeline:
${inputData.timeline}

A draft claim has been created.`,
        };
    },
});

/* -------------------- Step 2B: Not Eligible -------------------- */

const noClaimStep = createStep({
    id: "no-claim-response",
    inputSchema: insuranceGuideTool.outputSchema,
    outputSchema: insuranceResponseSchema,
    execute: async ({ inputData }) => {
        const steps = inputData.steps
            .map((s: string) => `- ${s}`)
            .join("\n");

        return {
            message: `ℹ️ Insurance Claim Update

${inputData.timeline}

${steps}

Focus on treatment and recovery. Keep documenting damage.`,
        };
    },
});

/* -------------------- Workflow -------------------- */

export const insuranceWorkflow = createWorkflow({
    id: "insurance-claim-workflow",
    inputSchema: z.object({
        disease: z.string(),
        severity: z.enum(["low", "medium", "high"]),
        crop: z.string(),
        userId: z.string(),
        diseaseReportId: z.string(),
    }),
    outputSchema: insuranceResponseSchema,
})
    .then(getInsuranceGuidanceStep)
    .branch([
        [
            async ({ inputData }) => inputData.claimPossible === true,
            createClaimDraftStep,
        ],
        [
            async ({ inputData }) => inputData.claimPossible === false,
            noClaimStep,
        ],
    ])
    .commit();
