import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { insuranceGuideTool } from "../tools/insuranceGuide.tool";
import { dbTool } from "../tools/db.tool";

/* -------------------- Step 1: Get Insurance Guidance -------------------- */

const getInsuranceGuidanceStep = createStep({
    id: "get-insurance-guidance",
    inputSchema: z.object({
        disease: z.string(),
        severity: z.enum(["low", "medium", "high"]),
        crop: z.string(),
        provider: z.string(),
        uin: z.string().optional(),
        policyNumber: z.string().optional(),
    }),
    outputSchema: z.object({
        guidance: insuranceGuideTool.outputSchema,
        claimData: z.object({
            provider: z.string(),
            uin: z.string().optional(),
            policyNumber: z.string().optional(),
            disease: z.string(),
            severity: z.string(),
            crop: z.string(),
        }),
    }),
    execute: async ({ inputData }) => {
        const guidance = await insuranceGuideTool.execute({
            context: {
                disease: inputData.disease,
                severity: inputData.severity,
                crop: inputData.crop,
            },
        } as any);

        return {
            guidance,
            claimData: {
                provider: inputData.provider,
                uin: inputData.uin,
                policyNumber: inputData.policyNumber,
                disease: inputData.disease,
                severity: inputData.severity,
                crop: inputData.crop,
            },
        };
    },
});

/* -------------------- Step 2: Create Claim if Eligible -------------------- */

const createClaimStep = createStep({
    id: "create-insurance-claim",
    inputSchema: z.object({
        guidance: insuranceGuideTool.outputSchema,
        claimData: z.object({
            provider: z.string(),
            uin: z.string().optional(),
            policyNumber: z.string().optional(),
            disease: z.string(),
            severity: z.string(),
            crop: z.string(),
        }),
    }),
    outputSchema: z.object({
        message: z.string(),
        claimCreated: z.boolean(),
        claimId: z.string().optional(),
    }),
    execute: async ({ inputData }) => {
        const { guidance, claimData } = inputData;

        if (!guidance.claimPossible) {
            return {
                message: `ℹ️ Insurance Claim Update\n\n${guidance.timeline}\n\nFocus on treatment and recovery. Keep documenting damage for future reference.`,
                claimCreated: false,
            };
        }

        // Create claim via controller
        const dbResult = await dbTool.execute({
            context: {
                collection: "insuranceClaim",
                data: {
                    provider: claimData.provider,
                    uin: claimData.uin || "",
                    policyNumber: claimData.policyNumber || "",
                    // Controller will add mock validation scores
                },
            },
        } as any);

        const documents = guidance.requiredDocuments
            ?.map((d: string) => `- ${d}`)
            .join("\n") || "None specified";

        const steps = guidance.steps
            ?.map((s: string, i: number) => `${i + 1}. ${s}`)
            .join("\n") || "Follow standard claim process";

        return {
            message: `🛡️ Insurance Claim Created

✅ Claim ID: ${dbResult.id || "Pending"}

You are eligible to file a crop insurance claim for ${claimData.crop} affected by ${claimData.disease}.

📄 Required Documents:
${documents}

📋 Next Steps:
${steps}

⏱️ Timeline:
${guidance.timeline}

Your claim has been submitted and is under review.`,
            claimCreated: true,
            claimId: dbResult.id,
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
        provider: z.string().describe("Insurance provider name"),
        uin: z.string().optional().describe("Universal Insurance Number"),
        policyNumber: z.string().optional().describe("Policy number"),
    }),
    outputSchema: z.object({
        message: z.string(),
        claimCreated: z.boolean(),
        claimId: z.string().optional(),
    }),
})
    .then(getInsuranceGuidanceStep)
    .then(createClaimStep)
    .commit();
