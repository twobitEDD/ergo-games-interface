type ModeBadgeProps = {
  mode: "ON_CHAIN_PLAY" | "FREE_PLAY" | "SPONSORED_PLAY";
};

const modeCopy: Record<
  ModeBadgeProps["mode"],
  { label: string; trustLabel: string; languageNotice: string }
> = {
  ON_CHAIN_PLAY: {
    label: "Wallet Match",
    trustLabel: "Trust Label: Wallet Path",
    languageNotice: "User-signed settlement only. No auto-transfer behavior.",
  },
  FREE_PLAY: {
    label: "Free Play",
    trustLabel: "Trust Label: No-Funds Path",
    languageNotice: "Off-chain result recording and non-cash progression only.",
  },
  SPONSORED_PLAY: {
    label: "Sponsored Play",
    trustLabel: "Trust Label: No-Funds Path",
    languageNotice: "Off-chain result recording now; gas sponsorship arrives in a later release.",
  },
};

export function ModeBadge({ mode }: ModeBadgeProps): JSX.Element {
  const copy = modeCopy[mode];
  return (
    <span
      style={{
        display: "inline-grid",
        gap: 4,
        border: "1px solid #6b7280",
        borderRadius: 9999,
        padding: "6px 12px",
        fontSize: 12,
        background: mode === "ON_CHAIN_PLAY" ? "#f9fafb" : "#eff6ff",
      }}
    >
      <strong>{copy.label}</strong>
      <span>{copy.trustLabel}</span>
      <span>{copy.languageNotice}</span>
    </span>
  );
}
