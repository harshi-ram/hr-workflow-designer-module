export type WorkflowNodeType =
  | "start"
  | "task"
  | "approval"
  | "automated"
  | "end";

export type MetadataEntry = {
  key: string;
  value: string;
};

export type StartNodeConfig = {
  title: string;
  metadata: MetadataEntry[];
};

export type TaskNodeConfig = {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: MetadataEntry[];
};

export type ApprovalNodeConfig = {
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
};

export type AutomatedActionDefinition = {
  id: string;
  label: string;
  params: string[];
};

export type AutomatedNodeConfig = {
  title: string;
  actionId: string;
  actionParams: Record<string, string | number | boolean>;
};

export type EndNodeConfig = {
  message: string;
};

export type WorkflowNodeConfigByType = {
  start: StartNodeConfig;
  task: TaskNodeConfig;
  approval: ApprovalNodeConfig;
  automated: AutomatedNodeConfig;
  end: EndNodeConfig;
};

export type WorkflowNodeData<T extends WorkflowNodeType = WorkflowNodeType> = {
  label: string;
  type: T;
  config: WorkflowNodeConfigByType[T];
};

export type SerializedWorkflow = {
  nodes: Array<{
    id: string;
    type: WorkflowNodeType;
    label: string;
    config: WorkflowNodeConfigByType[WorkflowNodeType];
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
};

export type SimulateRequest = {
  workflow: SerializedWorkflow;
};

export type SimulateResponse = {
  steps: string[];
  warnings: string[];
};
