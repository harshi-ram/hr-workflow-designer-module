import { AutomatedActionDefinition, SerializedWorkflow, SimulateResponse } from "@/types/workflow";

export async function fetchAutomations() {
  const response = await fetch("/api/automations");
  if (!response.ok) {
    throw new Error("Failed to load automations.");
  }
  return (await response.json()) as AutomatedActionDefinition[];
}

export async function simulateWorkflowApi(workflow: SerializedWorkflow) {
  const response = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workflow }),
  });

  const payload = (await response.json()) as SimulateResponse;
  if (!response.ok) {
    throw new Error(payload.warnings[0] ?? "Simulation failed.");
  }
  return payload;
}
