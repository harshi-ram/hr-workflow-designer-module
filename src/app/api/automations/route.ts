import { NextResponse } from "next/server";
import { AutomatedActionDefinition } from "@/types/workflow";

const automations: AutomatedActionDefinition[] = [
  { id: "send_email", label: "Send Email", params: ["to", "subject"] },
  { id: "generate_doc", label: "Generate Document", params: ["template", "recipient"] },
  { id: "create_ticket", label: "Create IT Ticket", params: ["queue", "priority"] },
];

export async function GET() {
  return NextResponse.json(automations);
}
