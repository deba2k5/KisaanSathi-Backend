import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { loanEligibilityTool } from "../tools/loanEligibility.tool";
import { dbTool } from "../tools/db.tool";

/* -------------------- Step 1: Check Eligibility -------------------- */

const checkEligibilityStep = createStep({
    id: "check-loan-eligibility",
    inputSchema: z.object({
        farmerName: z.string(),
        farmLocation: z.object({
            lat: z.number(),
            lng: z.number()
        }).optional(),
        cropType: z.string(),
        acres: z.number().describe("Land size in acres"),
        loanPurpose: z.string().describe("Purpose of the loan (e.g., seeds, equipment)"),
        requestedAmount: z.number().describe("Amount requested by farmer"),
        tenureMonths: z.number(),
    }),
    outputSchema: z.object({
        eligibility: loanEligibilityTool.outputSchema,
        loanData: z.object({
            farmerName: z.string(),
            farmLocation: z.object({
                lat: z.number(),
                lng: z.number()
            }).optional(),
            cropType: z.string(),
            acres: z.number(),
            loanPurpose: z.string(),
            requestedAmount: z.number(),
            tenureMonths: z.number(),
        }),
    }),
    execute: async ({ inputData }) => {
        const eligibility = await loanEligibilityTool.execute({
            context: {
                farmerName: inputData.farmerName,
                farmLocation: inputData.farmLocation,
                cropType: inputData.cropType,
                acres: inputData.acres,
                loanPurpose: inputData.loanPurpose,
                requestedAmount: inputData.requestedAmount,
                tenureMonths: inputData.tenureMonths,
            },
        } as any);

        return {
            eligibility,
            loanData: {
                farmerName: inputData.farmerName,
                farmLocation: inputData.farmLocation,
                cropType: inputData.cropType,
                acres: inputData.acres,
                loanPurpose: inputData.loanPurpose,
                requestedAmount: inputData.requestedAmount,
                tenureMonths: inputData.tenureMonths,
            },
        };
    },
});

/* -------------------- Step 2: Persist if Eligible -------------------- */

const persistLoanApplicationStep = createStep({
    id: "persist-loan-application",
    inputSchema: z.object({
        eligibility: loanEligibilityTool.outputSchema,
        loanData: z.object({
            farmerName: z.string(),
            farmLocation: z.object({
                lat: z.number(),
                lng: z.number()
            }).optional(),
            cropType: z.string(),
            acres: z.number(),
            loanPurpose: z.string(),
            requestedAmount: z.number(),
            tenureMonths: z.number(),
        }),
    }),
    outputSchema: z.object({
        eligibility: loanEligibilityTool.outputSchema,
        saved: z.boolean(),
        loanId: z.string().optional(),
    }),
    execute: async ({ inputData }) => {
        const { eligibility, loanData } = inputData;

        if (!eligibility.eligible) {
            return {
                eligibility,
                saved: false,
            };
        }

        // Save to database via controller endpoint
        const dbResult = await dbTool.execute({
            context: {
                collection: "loanApplication",
                data: {
                    farmerName: loanData.farmerName,
                    farmLocation: loanData.farmLocation,
                    cropType: loanData.cropType,
                    acres: loanData.acres,
                    loanPurpose: loanData.loanPurpose,
                    requestedAmount: loanData.requestedAmount,
                    tenureMonths: loanData.tenureMonths,
                    fraudRiskScore: eligibility.fraudRiskScore,
                    status: eligibility.fraudRiskScore < 30 ? 'APPROVED' : 'PENDING',
                },
            },
        } as any);

        return {
            eligibility,
            saved: dbResult.success,
            loanId: dbResult.id,
        };
    },
});

/* -------------------- Step 3: Format Final Response -------------------- */

const formatResponseStep = createStep({
    id: "format-loan-response",
    inputSchema: z.object({
        eligibility: loanEligibilityTool.outputSchema,
        saved: z.boolean(),
        loanId: z.string().optional(),
    }),
    outputSchema: z.object({
        message: z.string(),
    }),
    execute: async ({ inputData }) => {
        const { eligibility, saved, loanId } = inputData;

        let message = eligibility.reason;

        if (saved && loanId) {
            message += `\n\n✅ Application saved successfully (ID: ${loanId})`;
            if (eligibility.fraudRiskScore < 30) {
                message += `\n🎉 Your loan has been auto-approved! Low risk score detected.`;
            } else {
                message += `\n⏳ Your application is under review.`;
            }
        } else if (!eligibility.eligible) {
            message += `\n\n❌ Unfortunately, you don't meet the minimum requirements.`;
        }

        return { message };
    },
});

/* -------------------- Workflow -------------------- */

export const loanWorkflow = createWorkflow({
    id: "loan-eligibility-workflow",
    inputSchema: z.object({
        farmerName: z.string(),
        farmLocation: z.object({
            lat: z.number(),
            lng: z.number()
        }).optional(),
        cropType: z.string(),
        acres: z.number(),
        loanPurpose: z.string(),
        requestedAmount: z.number(),
        tenureMonths: z.number(),
    }),
    outputSchema: z.object({
        message: z.string(),
    }),
})
    .then(checkEligibilityStep)
    .then(persistLoanApplicationStep)
    .then(formatResponseStep)
    .commit();
