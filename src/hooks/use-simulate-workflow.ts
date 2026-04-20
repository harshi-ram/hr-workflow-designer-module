"use client";

import { useState } from "react";
import { SerializedWorkflow } from "@/types/workflow";
import { simulateWorkflowApi } from "@/lib/api/workflow-api";

export function useSimulateWorkflow() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async (workflow: SerializedWorkflow) => {
    try {
      setIsRunning(true);
      setError(null);
      const result = await simulateWorkflowApi(workflow);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Simulation failed.";
      setError(message);
      return { steps: [], warnings: [message] };
    } finally {
      setIsRunning(false);
    }
  };

  return { runSimulation, isRunning, error };
}
