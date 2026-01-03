import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

export const memoryAgent = new Agent({
    id: "memory-agent",
    name: "Memory Agent",
    instructions: "",
    model: "",
    tools: {},
    memory: new Memory({
        options: {
            lastMessages: 20,
        },
    }),
});