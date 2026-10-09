import { NextResponse } from "next/server";
import { AGENT_MISSIONS, SUBAGENTS } from "@/agents";

export function GET() {
  return NextResponse.json({
    name: "praxis",
    status: "ok",
    agents: SUBAGENTS.map((name) => ({
      name,
      mission: AGENT_MISSIONS[name],
    })),
  });
}
