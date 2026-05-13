import type { SettlementDecisionInput } from "./types";
import type { ApiGameMode } from "../../api/types";

const envFlag = (name: string, defaultValue: boolean): boolean => {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

export const getRuntimeDecisionInput = (gameMode: ApiGameMode): SettlementDecisionInput => ({
  gameMode,
  sponsorshipEnabled: envFlag("SPONSORED_SETTLEMENT_ENABLED", false),
  proofPipelineReady: envFlag("SPONSORED_PROOF_PIPELINE_READY", false),
  relayerFunded: envFlag("SPONSORED_RELAYER_FUNDED", false),
});
