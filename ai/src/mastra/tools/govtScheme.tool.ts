import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const govtSchemeTool = createTool({
    id: "govt-scheme-explainer",
    description: "Explain government farming schemes in simple language",
    inputSchema: z.object({
        schemeName: z.string(),
        state: z.string(),
    }),
    outputSchema: z.object({
        explanation: z.string(),
        eligibility: z.string(),
        benefits: z.array(z.string()),
        howToApply: z.string(),
    }),
    execute: async ({ context }) => {
        const { schemeName } = context;

        // Simplified scheme database
        const schemes: any = {
            "PM-KISAN": {
                explanation:
                    "Pradhan Mantri Kisan Samman Nidhi provides ₹6000 per year directly to farmers' bank accounts in three installments",
                eligibility: "All landholding farmers regardless of land size",
                benefits: [
                    "₹2000 every 4 months",
                    "Direct bank transfer",
                    "No paperwork hassle",
                ],
                howToApply:
                    "Register at pmkisan.gov.in or visit nearest Common Service Center",
            },
            "PMFBY": {
                explanation:
                    "Pradhan Mantri Fasal Bima Yojana provides comprehensive crop insurance against natural calamities",
                eligibility:
                    "All farmers including sharecroppers and tenant farmers",
                benefits: [
                    "Low premium (1.5-2% of sum insured)",
                    "Coverage for all natural risks",
                    "Quick claim settlement",
                ],
                howToApply:
                    "Contact your bank or insurance company during crop season",
            },
        };

        const scheme = schemes[schemeName] || {
            explanation: `Information about ${schemeName} scheme`,
            eligibility: "Please contact local agriculture office",
            benefits: ["Varies by scheme"],
            howToApply:
                "Visit nearest agriculture office or Jan Seva Kendra",
        };

        return scheme;
    },
});