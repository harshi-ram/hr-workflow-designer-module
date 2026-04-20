import { NextRequest, NextResponse } from "next/server";
import { SimulateRequest, SimulateResponse } from "@/types/workflow";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SimulateRequest;
  const workflow = body.workflow;

  if (!workflow?.nodes?.length) {
    return NextResponse.json<SimulateResponse>(
      {
        steps: [],
        warnings: ["No nodes found in workflow payload."],
      },
      { status: 400 },
    );
  }

  const nodeMap = new Map(workflow.nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, string[]>();
  workflow.edges.forEach((edge) => {
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge.target]);
  });

  const startNode = workflow.nodes.find((node) => node.type === "start");
  if (!startNode) {
    return NextResponse.json<SimulateResponse>(
      {
        steps: [],
        warnings: ["Workflow has no Start node."],
      },
      { status: 400 },
    );
  }

  const steps: string[] = [];
  const queue: string[] = [startNode.id];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);

    const node = nodeMap.get(current);
    if (!node) continue;

    if (node.type === "start") steps.push(`[Start] ${String((node.config as { title?: string }).title ?? node.label)}`);
    if (node.type === "task") steps.push(`[Task] ${String((node.config as { title?: string }).title ?? node.label)}`);
    if (node.type === "approval")
      steps.push(`[Approval] ${String((node.config as { title?: string }).title ?? node.label)}`);
    if (node.type === "automated")
      steps.push(`[Automated] ${String((node.config as { actionId?: string }).actionId ?? "No action selected")}`);
    if (node.type === "end") steps.push(`[End] ${String((node.config as { message?: string }).message ?? "Completed")}`);

    for (const nextId of outgoing.get(current) ?? []) {
      if (!seen.has(nextId)) queue.push(nextId);
    }
  }

  return NextResponse.json<SimulateResponse>({
    steps,
    warnings: [],
  });
}
