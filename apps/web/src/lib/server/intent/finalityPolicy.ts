import type { TxIntentControlState, TxIntentFinalityView, TxIntentRecord } from "./types";

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export const envFlag = (name: string, defaultValue: boolean): boolean => {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

export const envInt = (name: string, defaultValue: number): number => {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return defaultValue;
  return parsed;
};

export const getInitialIntentControls = (): TxIntentControlState => ({
  strictConfirmationMode: envFlag("TX_INTENT_STRICT_CONFIRMATION_MODE", false),
  optimisticMode: envFlag("TX_INTENT_OPTIMISTIC_MODE", true),
  incidentFallbackToOffChain: envFlag("TX_INTENT_INCIDENT_FALLBACK_OFF_CHAIN", false),
  confirmationDepth: envInt("TX_INTENT_CONFIRMATION_DEPTH", 3),
});

export const evaluateFinality = (
  intent: TxIntentRecord,
  controls: TxIntentControlState
): TxIntentFinalityView => {
  const requiredDepth = Math.max(1, controls.confirmationDepth);
  const observedConfirmations = Math.max(0, intent.observedConfirmations);
  const confidencePercent = clamp(
    Math.round((Math.min(observedConfirmations, requiredDepth) / requiredDepth) * 100),
    0,
    100
  );
  const reorgRisk =
    intent.status !== "FINALIZED" &&
    intent.maxObservedConfirmations > 0 &&
    observedConfirmations < intent.maxObservedConfirmations;
  const reachedDepth = observedConfirmations >= requiredDepth;
  const provisional = intent.status !== "FINALIZED" && (!reachedDepth || controls.strictConfirmationMode);

  if (reorgRisk) {
    return {
      requiredDepth,
      observedConfirmations,
      confidencePercent,
      provisional: true,
      reorgRisk: true,
      trustLabel: "REORG_RISK",
    };
  }

  if (intent.status === "FINALIZED" || reachedDepth) {
    return {
      requiredDepth,
      observedConfirmations,
      confidencePercent: 100,
      provisional: intent.status !== "FINALIZED",
      reorgRisk: false,
      trustLabel: "CONFIRMED_FINALITY_THRESHOLD",
    };
  }

  return {
    requiredDepth,
    observedConfirmations,
    confidencePercent,
    provisional,
    reorgRisk: false,
    trustLabel: "PROVISIONAL_CHAIN_SIGNAL",
  };
};
