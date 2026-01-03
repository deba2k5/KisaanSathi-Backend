#!/usr/bin/env node
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const { z } = require("zod");
const mongoose = require("mongoose");
// Load env vars explicitly since we are running standalone
require("dotenv").config();
const connectDB = require("./config/db"); // Reuse existing DB connection
const { searchSimilar, storeDocument } = require("./services/ragService");

// Initialize MCP Server
const server = new Server(
    {
        name: "kisaan-sathi-mcp-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Connect to MongoDB
connectDB();

// List Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "search_knowledge_base",
                description: "Search the agricultural vector database for advice, insurance claims, or farming patterns.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query (e.g., 'treatment for wheat rust' or 'insurance claim for flood')",
                        },
                        type: {
                            type: "string",
                            description: "Type of data to search: 'general', 'insurance_claim', 'chatbot_knowledge'",
                            default: "general"
                        }
                    },
                    required: ["query"],
                },
            },
            {
                name: "add_memory",
                description: "Add a new insight or feedback to the knowledge base.",
                inputSchema: {
                    type: "object",
                    properties: {
                        text: { type: "string", description: "The content to store." },
                        type: { type: "string", description: "Category of memory (e.g., 'chatbot_knowledge')." }
                    },
                    required: ["text"]
                }
            }
        ],
    };
});

// Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name === "search_knowledge_base") {
            const query = request.params.arguments.query;
            const type = request.params.arguments.type || "general";

            const results = await searchSimilar(query, type);

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(results, null, 2),
                    },
                ],
            };
        }

        if (request.params.name === "add_memory") {
            const text = request.params.arguments.text;
            const type = request.params.arguments.type || "general";
            await storeDocument(`MCP_${Date.now()}`, text, {}, type);
            return {
                content: [{ type: "text", text: "Successfully stored in vector database." }]
            }
        }

        throw new Error("Tool not found");
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        }
    }
});

// Start Server
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("KisaanSathi MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
