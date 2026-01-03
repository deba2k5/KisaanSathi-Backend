// src/mastra/index.ts (or src/index.ts depending on your layout)
import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";

// Import from your AI barrel
import {
  farmerAssistantAgent,
  // diseaseWorkflow,
  // weatherWorkflow,
  // loanWorkflow,
  // insuranceWorkflow,
} from "./agents/farmerAssistant.agent";
import { loanWorkflow } from "./workflows/loan.workflow";
export const mastra = new Mastra({
  workflows: {
    // diseaseWorkflow,
    // weatherWorkflow,
    loanWorkflow,
    // insuranceWorkflow,
  },
  agents: {
    farmerAssistantAgent,
  },
  storage: new LibSQLStore({
    url: ":memory:", // or 'file:../mastra.db' for persistence
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  telemetry: {
    enabled: false, // if you're on a version where OTEL telemetry is deprecated
  },
  observability: {
    default: { enabled: true },
  },
});