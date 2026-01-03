import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const insuranceGuideTool = createTool({
    id: "insurance-claim-guide",
    description: "Guide farmers through crop insurance claim process",

    inputSchema: z.object({
        disease: z.string().optional(),
        severity: z.enum(["low", "medium", "high"]).optional(),
        crop: z.string().optional(),
    }),

    outputSchema: z.object({
        claimPossible: z.boolean(),
        requiredDocuments: z.array(z.string()),
        steps: z.array(z.string()),
        timeline: z.string(),
    }),

    execute: async ({ context }) => {
        const { crop, disease, severity } = context;

        const claimPossible = severity === "high" || severity === "medium";

        const requiredDocuments = [
            "Aadhaar card",
            "Land ownership document (7/12 extract)",
            "Crop photographs showing damage",
            "Policy number",
            "Bank account details",
        ];

        const steps = claimPossible
            ? [
                "Report crop loss within 72 hours",
                "Contact insurance company toll-free number",
                "Submit required documents",
                "Wait for field inspection by insurance surveyor",
                "Claim settlement within 30 days",
            ]
            : [
                "Document the damage for future reference",
                "Focus on treatment and recovery",
                "Contact insurance company for guidance",
            ];

        const timeline = claimPossible
            ? "Claims are typically processed within 30–45 days"
            : "Not eligible for immediate claim";

        return {
            claimPossible,
            requiredDocuments: claimPossible ? requiredDocuments : [],
            steps,
            timeline,
        };
    },
});