import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

export const dbTool = createTool({
    id: "save-to-database",
    description: "Save structured data to backend database",
    inputSchema: z.object({
        collection: z.string(),
        data: z.record(z.string(), z.any()),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const { collection, data } = context;

        try {
            await axios.post(
                `${process.env.BACKEND_URL}/api/internal/db/${collection}`,
                data
            );

            return { success: true };
        } catch (error: any) {
            console.error("Database tool error:", error);

            return {
                success: false,
                error: error?.message ?? "Unknown database error",
            };
        }
    },
});
