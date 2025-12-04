import { NextResponse } from "next/server";

type BridgeStatus = "DEPOSIT_RECEIVED" | "CONFIRMING" | "MINTING" | "COMPLETE" | "IDLE";

interface BridgeStatusResponse {
  status: BridgeStatus;
  amount: string;
  timestamp: number;
}

// Simulate a progressing bridge for demo purposes
// In production, replace with actual bridge status lookup
const DEMO_STATUSES: BridgeStatus[] = [
  "DEPOSIT_RECEIVED",
  "CONFIRMING",
  "MINTING",
  "COMPLETE",
];

let demoIndex = 0;
let lastChangeTime = Date.now();
const STEP_DURATION_MS = 8000; // Progress every 8 seconds for demo

export async function GET(): Promise<NextResponse<BridgeStatusResponse>> {
  // Advance demo status based on time elapsed
  const now = Date.now();
  if (now - lastChangeTime > STEP_DURATION_MS && demoIndex < DEMO_STATUSES.length - 1) {
    demoIndex++;
    lastChangeTime = now;
  }

  // Reset to start after complete (for demo loop)
  if (demoIndex >= DEMO_STATUSES.length - 1) {
    const timeSinceComplete = now - lastChangeTime;
    if (timeSinceComplete > 10000) {
      // Reset after 10s at complete
      demoIndex = 0;
      lastChangeTime = now;
    }
  }

  const response: BridgeStatusResponse = {
    status: DEMO_STATUSES[demoIndex],
    amount: "3.5",
    timestamp: now,
  };

  return NextResponse.json(response);
}
