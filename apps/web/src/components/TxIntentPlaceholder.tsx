type TxIntentPlaceholderProps = {
  intentStatus: "PREPARED" | "WAITING_FOR_SIGNATURE" | "CONFIRMED";
};

export function TxIntentPlaceholder({ intentStatus }: TxIntentPlaceholderProps): JSX.Element {
  return (
    <div
      style={{
        border: "1px dashed #6b7280",
        borderRadius: 8,
        padding: 12,
      }}
    >
      <strong>Transaction intent status: {intentStatus}</strong>
      <p style={{ margin: "8px 0 0 0" }}>
        Placeholder lifecycle for release 1. Final settlement integration is intentionally deferred.
      </p>
    </div>
  );
}
