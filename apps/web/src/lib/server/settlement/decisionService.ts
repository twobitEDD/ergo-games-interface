import type { SettlementDecision, SettlementDecisionInput } from "./types";

export const decideSettlementRail = (input: SettlementDecisionInput): SettlementDecision => {
  if (input.gameMode === "FREE_PLAY") {
    return {
      rail: "OFF_CHAIN_ONLY",
      reasons: ["MODE_FREE_PLAY_OFF_CHAIN"],
    };
  }

  if (input.gameMode === "ON_CHAIN_PLAY") {
    return {
      rail: "USER_SIGNED_ON_CHAIN",
      reasons: ["MODE_ON_CHAIN_REQUIRES_USER_SIGNATURE"],
    };
  }

  if (!input.sponsorshipEnabled) {
    return {
      rail: "OFF_CHAIN_ONLY",
      reasons: ["SPONSORSHIP_CAPABILITY_DISABLED"],
    };
  }

  if (!input.proofPipelineReady) {
    return {
      rail: "OFF_CHAIN_ONLY",
      reasons: ["PROOF_PIPELINE_NOT_READY"],
    };
  }

  if (!input.relayerFunded) {
    return {
      rail: "USER_SIGNED_ON_CHAIN",
      reasons: ["RELAYER_UNFUNDED_FALLBACK"],
    };
  }

  return {
    rail: "SERVER_SPONSORED_ON_CHAIN",
    reasons: ["SERVER_SPONSORED_ELIGIBLE"],
  };
};
