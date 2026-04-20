"use client";

import { AutomatedActionDefinition, MetadataEntry, WorkflowNodeData } from "@/types/workflow";
import { Node } from "reactflow";

type NodeInspectorProps = {
  node: Node<WorkflowNodeData> | null;
  actions: AutomatedActionDefinition[];
  onUpdateNode: (nodeId: string, updater: (data: WorkflowNodeData) => WorkflowNodeData) => void;
};

function KeyValueEditor({
  items,
  onChange,
  label,
}: {
  items: MetadataEntry[];
  onChange: (next: MetadataEntry[]) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-600">{label}</p>
      {items.map((item, index) => (
        <div key={`${item.key}-${index}`} className="grid grid-cols-2 gap-2">
          <input
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="key"
            value={item.key}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...next[index], key: event.target.value };
              onChange(next);
            }}
          />
          <input
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="value"
            value={item.value}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...next[index], value: event.target.value };
              onChange(next);
            }}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { key: "", value: "" }])}
        className="rounded border border-dashed border-slate-400 px-2 py-1 text-xs text-slate-700"
      >
        Add field
      </button>
    </div>
  );
}

export function NodeInspector({ node, actions, onUpdateNode }: NodeInspectorProps) {
  if (!node) {
    return (
      <aside className="w-80 border-l border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Node Config</h2>
        <p className="mt-2 text-sm text-slate-500">Select a node to edit its settings.</p>
      </aside>
    );
  }

  const updateConfig = <T extends WorkflowNodeData["config"]>(patch: Partial<T>) => {
    onUpdateNode(node.id, (data) => ({
      ...data,
      config: { ...data.config, ...patch },
      label: "title" in patch && typeof patch.title === "string" ? patch.title : data.label,
    }));
  };

  const actionDefinition =
    node.type === "automated"
      ? actions.find((action) => action.id === node.data.config.actionId)
      : undefined;

  return (
    <aside className="w-80 space-y-3 overflow-y-auto border-l border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Node Config</h2>
      <p className="text-xs text-slate-500">Editing {node.type} node</p>

      {node.type === "start" && (
        <>
          <label className="space-y-1 text-sm">
            <span className="text-slate-700">Start title</span>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1"
              value={node.data.config.title}
              onChange={(event) => updateConfig({ title: event.target.value })}
            />
          </label>
          <KeyValueEditor
            label="Metadata"
            items={node.data.config.metadata}
            onChange={(metadata) => updateConfig({ metadata })}
          />
        </>
      )}

      {node.type === "task" && (
        <>
          <label className="space-y-1 text-sm">
            <span className="text-slate-700">Title *</span>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1"
              value={node.data.config.title}
              onChange={(event) => updateConfig({ title: event.target.value })}
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-700">Description</span>
            <textarea
              className="w-full rounded border border-slate-300 px-2 py-1"
              rows={3}
              value={node.data.config.description}
              onChange={(event) => updateConfig({ description: event.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-700">Assignee</span>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1"
              value={node.data.config.assignee}
              onChange={(event) => updateConfig({ assignee: event.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-700">Due date</span>
            <input
              type="date"
              className="w-full rounded border border-slate-300 px-2 py-1"
              value={node.data.config.dueDate}
              onChange={(event) => updateConfig({ dueDate: event.target.value })}
            />
          </label>
          <KeyValueEditor
            label="Custom fields"
            items={node.data.config.customFields}
            onChange={(customFields) => updateConfig({ customFields })}
          />
        </>
      )}

      {node.type === "approval" && (
        <>
          <label className="space-y-1 text-sm">
            <span className="text-slate-700">Title</span>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1"
              value={node.data.config.title}
              onChange={(event) => updateConfig({ title: event.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-700">Approver role</span>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1"
              value={node.data.config.approverRole}
              onChange={(event) => updateConfig({ approverRole: event.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-700">Auto-approve threshold</span>
            <input
              type="number"
              className="w-full rounded border border-slate-300 px-2 py-1"
              value={node.data.config.autoApproveThreshold}
              onChange={(event) => updateConfig({ autoApproveThreshold: Number(event.target.value) })}
            />
          </label>
        </>
      )}

      {node.type === "automated" && (
        <>
          <label className="space-y-1 text-sm">
            <span className="text-slate-700">Title</span>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1"
              value={node.data.config.title}
              onChange={(event) => updateConfig({ title: event.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-700">Action</span>
            <select
              className="w-full rounded border border-slate-300 px-2 py-1"
              value={node.data.config.actionId}
              onChange={(event) => {
                const actionId = event.target.value;
                const nextDef = actions.find((action) => action.id === actionId);
                const defaultParams = Object.fromEntries(
                  (nextDef?.params ?? []).map((param) => [param, ""]),
                );
                updateConfig({ actionId, actionParams: defaultParams });
              }}
            >
              <option value="">Select mock action</option>
              {actions.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.label}
                </option>
              ))}
            </select>
          </label>
          {actionDefinition && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Configure action parameters</p>
              {actionDefinition.params.map((param) => (
                <label key={param} className="space-y-1 text-sm">
                  <span className="text-slate-700">{param}</span>
                  <input
                    type="text"
                    className="w-full rounded border border-slate-300 px-2 py-1"
                    value={String(node.data.config.actionParams[param] ?? "")}
                    onChange={(event) => {
                      const nextParams = {
                        ...node.data.config.actionParams,
                        [param]: event.target.value,
                      };
                      updateConfig({ actionParams: nextParams });
                    }}
                  />
                </label>
              ))}
            </div>
          )}
        </>
      )}

      {node.type === "end" && (
        <label className="space-y-1 text-sm">
          <span className="text-slate-700">End message</span>
          <textarea
            className="w-full rounded border border-slate-300 px-2 py-1"
            rows={3}
            value={node.data.config.message}
            onChange={(event) => updateConfig({ message: event.target.value })}
          />
        </label>
      )}
    </aside>
  );
}
