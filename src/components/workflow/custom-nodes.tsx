"use client";

import { Handle, NodeProps, Position } from "reactflow";
import { WorkflowNodeData } from "@/types/workflow";

type ColorScheme = {
  border: string;
  bg: string;
  title: string;
};

const colorsByType: Record<string, ColorScheme> = {
  start: { border: "#059669", bg: "#ecfdf5", title: "Start" },
  task: { border: "#2563eb", bg: "#eff6ff", title: "Task" },
  approval: { border: "#7c3aed", bg: "#f5f3ff", title: "Approval" },
  automated: { border: "#ea580c", bg: "#fff7ed", title: "Automated" },
  end: { border: "#be123c", bg: "#fff1f2", title: "End" },
};

function WorkflowNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  const scheme = colorsByType[data.type];
  const showTarget = data.type !== "start";
  const showSource = data.type !== "end";

  return (
    <div
      className="min-w-56 rounded-lg border-2 p-3 shadow-sm"
      style={{
        borderColor: scheme.border,
        background: scheme.bg,
        boxShadow: selected ? "0 0 0 2px rgba(15, 23, 42, 0.2)" : undefined,
      }}
    >
      {showTarget && <Handle type="target" position={Position.Left} />}
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {scheme.title}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{data.label}</div>
      <div className="mt-1 text-xs text-slate-600">
        {data.type === "end"
          ? data.config.message || "No end message"
          : data.type === "start"
            ? data.config.title || "No title"
            : data.config.title || "No title"}
      </div>
      {showSource && <Handle type="source" position={Position.Right} />}
    </div>
  );
}

export const nodeTypes = {
  start: WorkflowNode,
  task: WorkflowNode,
  approval: WorkflowNode,
  automated: WorkflowNode,
  end: WorkflowNode,
};
