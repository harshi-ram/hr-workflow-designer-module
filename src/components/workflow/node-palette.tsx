"use client";

import React from "react";
import { WorkflowNodeType } from "@/types/workflow";

const paletteItems: { type: WorkflowNodeType; label: string; hint: string }[] = [
  { type: "start", label: "Start Node", hint: "Workflow entry point" },
  { type: "task", label: "Task Node", hint: "Human action step" },
  { type: "approval", label: "Approval Node", hint: "Role-based approval" },
  { type: "automated", label: "Automated Step", hint: "System triggered action" },
  { type: "end", label: "End Node", hint: "Workflow completion step" },
];

type NodePaletteProps = {
  onAddNode: (type: WorkflowNodeType) => void;
};

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <aside className="w-64 space-y-3 border-r border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Node Library</h2>
      <p className="text-xs text-slate-500">Click to add nodes to canvas.</p>
      <div className="space-y-2">
        {paletteItems.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => onAddNode(item.type)}
            className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-left transition hover:bg-slate-100"
          >
            <div className="text-sm font-medium text-slate-800">{item.label}</div>
            <div className="text-xs text-slate-500">{item.hint}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}
