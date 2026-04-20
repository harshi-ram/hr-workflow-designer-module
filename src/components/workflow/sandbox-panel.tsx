"use client";

type SandboxPanelProps = {
  validationErrors: string[];
  runLog: string[];
  onRun: () => void;
  isRunning: boolean;
  apiError: string | null;
  metadata: {
    nodeCount: number;
    edgeCount: number;
    serializedWorkflow: string;
  };
};

export function SandboxPanel({
  validationErrors,
  runLog,
  onRun,
  isRunning,
  apiError,
  metadata,
}: SandboxPanelProps) {
  return (
    <section className="border-t border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Workflow Sandbox</h3>
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          {isRunning ? "Running..." : "Run Simulation"}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Serialized graph: {metadata.nodeCount} nodes, {metadata.edgeCount} edges
      </p>
      {validationErrors.length > 0 && (
        <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-2">
          <p className="text-xs font-semibold uppercase text-amber-800">Validation warnings</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-amber-900">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {apiError && (
        <div className="mt-3 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-800">{apiError}</div>
      )}
      <div className="mt-3 max-h-44 overflow-y-auto rounded border border-slate-200 bg-white p-2">
        {runLog.length === 0 ? (
          <p className="text-sm text-slate-500">Run the workflow to inspect execution steps.</p>
        ) : (
          <ol className="space-y-1 text-sm text-slate-700">
            {runLog.map((line, index) => (
              <li key={`${line}-${index}`}>
                <span className="text-slate-400">{index + 1}.</span> {line}
              </li>
            ))}
          </ol>
        )}
      </div>
      <details className="mt-3 rounded border border-slate-200 bg-white p-2">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          View serialized workflow payload
        </summary>
        <pre className="mt-2 max-h-56 overflow-auto text-xs text-slate-600">
          {metadata.serializedWorkflow}
        </pre>
      </details>
    </section>
  );
}
