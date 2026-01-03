import { createTool } from "@mastra/core";
import { z } from "zod";

export const loanEligibilityTool = createTool({
    id: "check-loan-eligibility-tool",
    description: "Calculate loan eligibility for farmers based on land size and crop type",
    inputSchema: z.object({
        farmerUid: z.string().describe("Farmer's user ID"),
        farmerName: z.string().describe("Farmer's full name"),
        farmLocation: z.object({
            lat: z.number(),
            lng: z.number()
        }).optional().describe("Farm GPS coordinates"),
        cropType: z.string().describe("Type of crop being cultivated"),
        acres: z.number().describe("Land size in acres"),
        loanPurpose: z.string().describe("Purpose of the loan (e.g., seeds, equipment)"),
        requestedAmount: z.number().describe("Amount requested by farmer"),
        tenureMonths: z.number().describe("Loan repayment period in months")
    }),
    outputSchema: z.object({
        eligible: z.boolean(),
        estimatedAmount: z.number(),
        reason: z.string(),
        requirements: z.array(z.string()),
        fraudRiskScore: z.number().describe("Risk score 0-100"),
    }),
    execute: async ({ context }) => {
        const { acres, requestedAmount, tenureMonths } = context;

        // Basic eligibility: minimum 1 acre
        const eligible = acres >= 1;
        const baseAmountPerAcre = 50_000;

        // Calculate fraud risk (simplified version of controller logic)
        let fraudScore = 10; // Base score
        if (requestedAmount > 500000) fraudScore += 30;
        if (tenureMonths < 6) fraudScore += 10;
        fraudScore += Math.floor(Math.random() * 20);
        fraudScore = Math.min(fraudScore, 100);

        const estimatedAmount = eligible
            ? Math.min(Math.floor(acres * baseAmountPerAcre), requestedAmount)
            : 0;

        return {
            eligible,
            estimatedAmount,
            fraudRiskScore: fraudScore,
            reason: eligible
                ? `You are eligible for a loan up to ₹${estimatedAmount.toLocaleString("en-IN")}. Fraud risk: ${fraudScore}/100`
                : "Minimum land requirement is 1 acre for loan eligibility",
            requirements: eligible
                ? [
                    "Aadhaar card",
                    "Land ownership documents (7/12 extract)",
                    "Bank account details",
                    "Crop details and sowing certificate",
                ]
                : [],
        };
    },
});
