import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { loanEligibilityTool } from "../tools/loanEligibility.tool";
import { dbTool } from "../tools/db.tool";

/* -------------------- Step 1: Check Eligibility -------------------- */

const checkEligibilityStep = createStep({
    id: "check-loan-eligibility",
    inputSchema: z.object({
        landSizeAcres: z.number(),
        crop: z.string(),
        location: z.string().optional(),
        userId: z.string(),
    }),
    outputSchema: z.object({
        eligibility: loanEligibilityTool.outputSchema,
        userContext: z.object({
            userId: z.string(),
            crop: z.string(),
            landSizeAcres: z.number(),
        }),
    }),
    execute: async ({ inputData }) => {
        const eligibility = await loanEligibilityTool.execute({
            context: {
                landSizeAcres: inputData.landSizeAcres,
                crop: inputData.crop,
                location: inputData.location,
            },
        } as any);

        return {
            eligibility,
            userContext: {
                userId: inputData.userId,
                crop: inputData.crop,
                landSizeAcres: inputData.landSizeAcres,
            },
        };
    },
});

/* -------------------- Step 2: Persist if Eligible -------------------- */

const persistLoanApplicationStep = createStep({
    id: "persist-loan-application",
    inputSchema: z.object({
        eligibility: loanEligibilityTool.outputSchema,
        userContext: z.object({
            userId: z.string(),
            crop: z.string(),
            landSizeAcres: z.number(),
        }),
    }),
    outputSchema: loanEligibilityTool.outputSchema,
    execute: async ({ inputData }) => {
        const { eligibility, userContext } = inputData;

        if (!eligibility.eligible) {
            return eligibility;
        }

        await dbTool.execute({
            context: {
                collection: "loan_applications",
                data: {
                    userId: userContext.userId,
                    crop: userContext.crop,
                    landSizeAcres: userContext.landSizeAcres,
                    estimatedAmount: eligibility.estimatedAmount,
                    eligible: true,
                    appliedAt: new Date().toISOString(),
                },
            },
        } as any);

        return eligibility;
    },
});

/* -------------------- Step 3: Format Final Response -------------------- */

const formatResponseStep = createStep({
    id: "format-loan-response",
    inputSchema: loanEligibilityTool.outputSchema,
    outputSchema: z.object({
        message: z.string(),
    }),
    execute: async ({ inputData }) => {
        return {
            message: inputData.reason,
        };
    },
});

/* -------------------- Workflow -------------------- */

export const loanWorkflow = createWorkflow({
    id: "loan-eligibility-workflow",
    inputSchema: z.object({
        landSizeAcres: z.number(),
        crop: z.string(),
        location: z.string().optional(),
        userId: z.string(),
    }),
    outputSchema: z.object({
        message: z.string(),
    }),
})
    .then(checkEligibilityStep)
    .then(persistLoanApplicationStep)
    .then(formatResponseStep)
    .commit();
