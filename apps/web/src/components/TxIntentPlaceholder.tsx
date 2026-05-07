type TxIntentPlaceholderProps = {
  intentId: string;
  gameId: string;
  settlementId?: string;
  intentStatus: "PREPARED" | "SIGNED" | "SUBMITTED" | "MEMPOOL_SEEN" | "CONFIRMED" | "FINALIZED" | "FAILED" | "REPLACED";
  trustLabel: "PROVISIONAL_CHAIN_SIGNAL" | "REORG_RISK" | "CONFIRMED_FINALITY_THRESHOLD";
  confidencePercent: number;
  observedConfirmations: number;
  requiredDepth: number;
  provisional: boolean;
  pendingActions: string[];
  controls: {
    strictConfirmationMode: boolean;
    optimisticMode: boolean;
    incidentFallbackToOffChain: boolean;
  };
};

const controlPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 9999,
  border: "1px solid #6b7280",
  padding: "4px 10px",
  fontSize: 12,
};

export function TxIntentPlaceholder({
  intentId,
  gameId,
  settlementId,
  intentStatus,
  trustLabel,
  confidencePercent,
  observedConfirmations,
  requiredDepth,
  provisional,
  pendingActions,
  controls,
}: TxIntentPlaceholderProps) {
  return (
    <div
      style={{
        border: "1px solid #6b7280",
        borderRadius: 8,
        padding: 12,
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <strong>Funded Intent Lifecycle: {intentStatus}</strong>
        <span style={{ fontSize: 12 }}>
          {provisional ? "Trust Label: Provisional" : "Trust Label: Finalized at Threshold"}
        </span>
      </div>

      <p style={{ margin: 0, fontSize: 13 }}>
        Intent `{intentId}` for game `{gameId}`
        {settlementId ? ` (settlement ${settlementId})` : ""}.
      </p>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
          <span>Confidence Meter ({observedConfirmations}/{requiredDepth} confirmations)</span>
          <strong>{confidencePercent}%</strong>
        </div>
        <div
          style={{
            width: "100%",
            height: 10,
            borderRadius: 999,
            background: "#e5e7eb",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.max(0, Math.min(100, confidencePercent))}%`,
              height: "100%",
              background: trustLabel === "REORG_RISK" ? "#dc2626" : "#2563eb",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={controlPillStyle}>Strict confirmation mode: {controls.strictConfirmationMode ? "ON" : "OFF"}</span>
        <span style={controlPillStyle}>Optimistic mode: {controls.optimisticMode ? "ON" : "OFF"}</span>
        <span style={controlPillStyle}>
          Incident-safe fallback: {controls.incidentFallbackToOffChain ? "ACTIVE" : "STANDBY"}
        </span>
      </div>

      <section
        style={{
          border: "1px dashed #9ca3af",
          borderRadius: 6,
          padding: 10,
          background: "#f9fafb",
        }}
      >
        <strong style={{ fontSize: 13 }}>Pending Actions (Recovery Friendly)</strong>
        <ul style={{ margin: "8px 0 0 0", paddingInlineStart: 18 }}>
          {pendingActions.length > 0 ? (
            pendingActions.map((action) => <li key={action}>{action}</li>)
          ) : (
            <li>No pending action; lifecycle currently terminal.</li>
          )}
        </ul>
      </section>

      <p style={{ margin: 0 }}>
        No-wager lifecycle notice: chain activity labels are trust signals only and never represent guaranteed
        payouts or final settlement before configured threshold depth.
      </p>
    </div>
  );
}
