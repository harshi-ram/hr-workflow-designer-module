import { Edge, Node } from "reactflow";
import {
  SerializedWorkflow,
  WorkflowNodeConfigByType,
  WorkflowNodeData,
  WorkflowNodeType,
} from "@/types/workflow";

let nodeCounter = 1;

export const createDefaultConfig = (
  type: WorkflowNodeType,
): WorkflowNodeConfigByType[WorkflowNodeType] => {
  switch (type) {
    case "start":
      return { title: "New workflow start", metadata: [] };
    case "task":
      return {
        title: "New task",
        description: "",
        assignee: "",
        dueDate: "",
        customFields: [],
      };
    case "approval":
      return {
        title: "Approval step",
        approverRole: "Manager",
        autoApproveThreshold: 0,
      };
    case "automated":
      return {
        title: "Automated action",
        actionId: "",
        actionParams: {},
      };
    case "end":
      return { message: "Workflow completed successfully." };
  }
};

export const createNodeLabel = (type: WorkflowNodeType) => {
  const id = nodeCounter++;
  return `${type[0].toUpperCase()}${type.slice(1)} ${id}`;
};

export const validateWorkflow = (
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
): string[] => {
  const errors: string[] = [];
  const startNodes = nodes.filter((node) => node.type === "start");
  const endNodes = nodes.filter((node) => node.type === "end");

  if (startNodes.length === 0) errors.push("Add exactly one Start node.");
  if (startNodes.length > 1) errors.push("Only one Start node is allowed.");
  if (endNodes.length === 0) errors.push("At least one End node is required.");

  if (startNodes.length === 1) {
    const incomingToStart = edges.filter((edge) => edge.target === startNodes[0].id);
    if (incomingToStart.length > 0) {
      errors.push("Start node cannot have incoming connections.");
    }
  }

  nodes.forEach((node) => {
    const incoming = edges.filter((edge) => edge.target === node.id);
    const outgoing = edges.filter((edge) => edge.source === node.id);

    if (node.type !== "start" && incoming.length === 0) {
      errors.push(`Node "${node.data.label}" has no incoming connection.`);
    }

    if (node.type !== "end" && outgoing.length === 0) {
      errors.push(`Node "${node.data.label}" has no outgoing connection.`);
    }

    if (node.type === "end") {
      if (outgoing.length > 0) {
        errors.push(`End node "${node.data.label}" cannot have outgoing connections.`);
      }
    }
  });

  if (hasCycle(nodes, edges)) {
    errors.push("Workflow contains a cycle. Use a directed acyclic flow for simulation.");
  }

  return errors;
};

export const hasCycle = (nodes: Node<WorkflowNodeData>[], edges: Edge[]) => {
  const outgoing = new Map<string, string[]>();
  nodes.forEach((node) => outgoing.set(node.id, []));
  edges.forEach((edge) => {
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge.target]);
  });

  const visited = new Set<string>();
  const inStack = new Set<string>();

  const dfs = (nodeId: string): boolean => {
    if (inStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    inStack.add(nodeId);
    for (const child of outgoing.get(nodeId) ?? []) {
      if (dfs(child)) return true;
    }
    inStack.delete(nodeId);
    return false;
  };

  for (const node of nodes) {
    if (dfs(node.id)) return true;
  }
  return false;
};

export const serializeWorkflow = (
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
): SerializedWorkflow => ({
  nodes: nodes.map((node) => ({
    id: node.id,
    type: node.type as WorkflowNodeType,
    label: node.data.label,
    config: node.data.config,
  })),
  edges: edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  })),
});

export const simulateWorkflow = (
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
) => {
  const startNode = nodes.find((node) => node.type === "start");
  if (!startNode) return ["Cannot simulate: workflow has no Start node."];

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, string[]>();
  edges.forEach((edge) => {
    const existing = outgoing.get(edge.source) ?? [];
    existing.push(edge.target);
    outgoing.set(edge.source, existing);
  });

  const log: string[] = [];
  const queue: string[] = [startNode.id];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (seen.has(currentId)) continue;
    seen.add(currentId);

    const node = nodeMap.get(currentId);
    if (!node) continue;

    switch (node.type) {
      case "start":
        log.push(`[Start] ${node.data.config.title}`);
        break;
      case "task":
        log.push(
          `[Task] ${node.data.config.title} (assignee: ${node.data.config.assignee || "unassigned"})`,
        );
        break;
      case "approval":
        log.push(
          `[Approval] ${node.data.config.title} (role: ${node.data.config.approverRole}, threshold: ${node.data.config.autoApproveThreshold})`,
        );
        break;
      case "automated":
        log.push(
          `[Automated] ${node.data.config.title} (action: ${node.data.config.actionId || "none selected"})`,
        );
        break;
      case "end":
        log.push(`[End] ${node.data.config.message}`);
        break;
      default:
        log.push(`[Unknown] ${node.data.label}`);
    }

    (outgoing.get(currentId) ?? []).forEach((target) => {
      if (!seen.has(target)) queue.push(target);
    });
  }

  if (log.length === 0) {
    return ["Simulation produced no steps. Connect nodes from Start onward."];
  }

  return log;
};
