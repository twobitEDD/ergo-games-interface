type ModeBadgeProps = {
  mode: "ON_CHAIN_PLAY" | "FREE_PLAY" | "SPONSORED_PLAY";
};

const modeCopy: Record<ModeBadgeProps["mode"], string> = {
  ON_CHAIN_PLAY: "Wallet Match (user-signed settlement path)",
  FREE_PLAY: "Free Play (off-chain recorded outcome)",
  SPONSORED_PLAY: "Sponsored Play (future server-sponsored settlement)",
};

export function ModeBadge({ mode }: ModeBadgeProps): JSX.Element {
  return (
    <span
      style={{
        display: "inline-block",
        border: "1px solid #6b7280",
        borderRadius: 9999,
        padding: "4px 10px",
        fontSize: 12,
      }}
    >
      {modeCopy[mode]}
    </span>
  );
}
