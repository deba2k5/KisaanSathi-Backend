import { createTool } from "@mastra/core";
import { z } from "zod";

export const loanEligibilityTool = createTool({
    id: "check-loan-eligibility-tool",
    description: "Calculate loan eligibility for farmers",
    inputSchema: z.object({
        landSizeAcres: z.number(),
        crop: z.string(),
        location: z.string().optional(),
    }),
    outputSchema: z.object({
        eligible: z.boolean(),
        estimatedAmount: z.number(),
        reason: z.string(),
        requirements: z.array(z.string()),
    }),
    execute: async ({ context }) => {
        const { landSizeAcres, crop } = context;

        const eligible = landSizeAcres >= 1;
        const baseAmountPerAcre = 50_000;

        const estimatedAmount = eligible
            ? Math.floor(landSizeAcres * baseAmountPerAcre)
            : 0;

        return {
            eligible,
            estimatedAmount,
            reason: eligible
                ? `You are eligible for a loan up to ₹${estimatedAmount.toLocaleString("en-IN")}`
                : "Minimum land requirement is 1 acre for loan eligibility",
            requirements: eligible
                ? [
                    "Aadhaar card",
                    "Land ownership documents",
                    "Bank account details",
                    "Crop details",
                ]
                : [],
        };
    },
});
