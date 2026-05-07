export function WalletRequiredNotice(): JSX.Element {
  return (
    <div
      style={{
        border: "1px solid #f59e0b",
        borderRadius: 8,
        padding: 12,
        background: "#fffbeb",
      }}
    >
      <strong>Wallet required for wallet match mode.</strong>
      <p style={{ margin: "8px 0 0 0" }}>
        This release does not auto-move funds. Any on-chain action remains explicit, user reviewed, and
        user signed.
      </p>
      <p style={{ margin: "8px 0 0 0" }}>
        Free Play and Sponsored Play are no-funds modes with off-chain event recording and non-cash
        progression.
      </p>
    </div>
  );
}
