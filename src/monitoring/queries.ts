import "server-only";

import { connectDb } from "@/db/connect";
import { IncidentModel } from "@/db/models/incident";
import { readFaultSimulation } from "@/db/models/platform-settings";
import { TIMELINE_MINUTES, type ConceptCount } from "./faults";

const RECENT_LIMIT = 8;

export type RecentIncident = { id: string; code: number; concept: string; at: Date };

export type MonitoringSnapshot = {
  now: Date;
  simulating: boolean;
  total: number;
  windowTimes: Date[];
  concepts: ConceptCount[];
  recent: RecentIncident[];
};

export async function readMonitoring(): Promise<MonitoringSnapshot> {
  await connectDb();
  const now = new Date();
  const since = new Date(now.getTime() - TIMELINE_MINUTES * 60_000);

  const [simulating, total, windowDocs, grouped, recentDocs] = await Promise.all([
    readFaultSimulation(),
    IncidentModel.countDocuments(),
    IncidentModel.find({ createdAt: { $gte: since } }).select("createdAt").lean(),
    IncidentModel.aggregate<{ _id: { code: number; concept: string }; count: number }>([
      { $group: { _id: { code: "$code", concept: "$concept" }, count: { $sum: 1 } } },
    ]),
    IncidentModel.find().sort({ createdAt: -1 }).limit(RECENT_LIMIT).select("code concept createdAt").lean(),
  ]);

  return {
    now,
    simulating,
    total,
    windowTimes: windowDocs.map((doc) => new Date(doc.createdAt)),
    concepts: grouped.map((row) => ({
      code: Number(row._id.code),
      concept: String(row._id.concept),
      count: row.count,
    })),
    recent: recentDocs.map((doc) => ({
      id: String(doc._id),
      code: Number(doc.code),
      concept: String(doc.concept),
      at: new Date(doc.createdAt),
    })),
  };
}
