"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeSelectionChange,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { NodePalette } from "@/components/workflow/node-palette";
import { NodeInspector } from "@/components/workflow/node-inspector";
import { SandboxPanel } from "@/components/workflow/sandbox-panel";
import { createDefaultConfig, createNodeLabel, serializeWorkflow, validateWorkflow } from "@/lib/workflow";
import { WorkflowNodeData, WorkflowNodeType } from "@/types/workflow";
import { nodeTypes } from "@/components/workflow/custom-nodes";
import { useAutomations } from "@/hooks/use-automations";
import { useSimulateWorkflow } from "@/hooks/use-simulate-workflow";

function WorkflowDesignerInner() {
  const [nodes, setNodes] = useState<Node<WorkflowNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [runLog, setRunLog] = useState<string[]>([]);
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const { screenToFlowPosition } = useReactFlow();
  const { automations, error: automationsError } = useAutomations();
  const { runSimulation: runSimulationApi, isRunning, error: simulationError } = useSimulateWorkflow();
  const stableNodeTypes = useMemo(() => nodeTypes, []);

  const addNode = useCallback(
    (type: WorkflowNodeType, x = 220, y = 180) => {
      const label = createNodeLabel(type);
      const config = createDefaultConfig(type);
      const id = `${type}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      setNodes((prev) => [
        ...prev,
        {
          id,
          type,
          position: { x, y },
          data: { label, type, config },
        },
      ]);
    },
    [setNodes],
  );

  const pushLog = useCallback((message: string) => {
    const stamp = new Date().toLocaleTimeString();
    console.log(`[workflow-debug] ${stamp} ${message}`);
    setEventLogs((current) => [`${stamp} - ${message}`, ...current].slice(0, 8));
  }, []);

  const onNodesChange = useCallback((changes: Parameters<typeof applyNodeChanges>[0]) => {
    const selectionChange = changes.find((change) => change.type === "select") as
      | NodeSelectionChange
      | undefined;
    if (selectionChange) {
      setSelectedNodeId(selectionChange.selected ? selectionChange.id : null);
    }
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const onEdgesChange = useCallback((changes: Parameters<typeof applyEdgeChanges>[0]) => {
    setEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((current) =>
      addEdge(
        {
          ...connection,
          id: `edge-${Date.now()}-${Math.round(Math.random() * 1000)}`,
          animated: false,
        },
        current,
      ),
    );
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const validationErrors = useMemo(() => validateWorkflow(nodes, edges), [nodes, edges]);

  const onUpdateNode = useCallback(
    (nodeId: string, updater: (data: WorkflowNodeData) => WorkflowNodeData) => {
      setNodes((current) =>
        current.map((node) => (node.id === nodeId ? { ...node, data: updater(node.data) } : node)),
      );
    },
    [],
  );

  const runSimulation = useCallback(async () => {
    const serialized = serializeWorkflow(nodes, edges);
    const response = await runSimulationApi(serialized);
    setRunLog(response.steps);
  }, [nodes, edges, runSimulationApi]);

  return (
    <div className="flex h-screen min-h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-900">HR Workflow Designer</h1>
        <p className="text-sm text-slate-600">
          Build and test onboarding, approval, and document workflows.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
            onClick={() => {
              addNode("start");
              pushLog("header-add:start");
            }}
          >
            Add Start
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
            onClick={() => {
              addNode("task");
              pushLog("header-add:task");
            }}
          >
            Add Task
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
            onClick={() => {
              addNode("end");
              pushLog("header-add:end");
            }}
          >
            Add End
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <NodePalette
          onAddNode={(type) => {
            addNode(type);
            pushLog(`palette-click-add:${type}`);
          }}
        />

        <main className="min-h-0 flex-1">
          <div className="relative h-[calc(100vh-220px)]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onPaneClick={() => setSelectedNodeId(null)}
              fitView
              nodeTypes={stableNodeTypes}
              deleteKeyCode={["Backspace", "Delete"]}
            >
              <MiniMap zoomable pannable />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
          <SandboxPanel
            validationErrors={validationErrors}
            runLog={runLog}
            onRun={() => void runSimulation()}
            isRunning={isRunning}
            apiError={simulationError}
            metadata={{
              nodeCount: nodes.length,
              edgeCount: edges.length,
              serializedWorkflow: JSON.stringify(serializeWorkflow(nodes, edges), null, 2),
            }}
          />
        </main>

        <NodeInspector node={selectedNode} actions={automations} onUpdateNode={onUpdateNode} />
      </div>
      {automationsError && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Failed to load automations: {automationsError}
        </div>
      )}
      <div className="border-t border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <div className="font-semibold text-slate-700">Interaction Logs</div>
        {eventLogs.length === 0 ? (
          <div>No logs yet.</div>
        ) : (
          eventLogs.map((entry) => <div key={entry}>{entry}</div>)
        )}
      </div>
    </div>
  );
}

export function WorkflowDesigner() {
  return (
    <ReactFlowProvider>
      <WorkflowDesignerInner />
    </ReactFlowProvider>
  );
}
