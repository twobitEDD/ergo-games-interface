export type AccountProviderKind = "dynamic" | "nautilus" | "vault" | "none";

export type AccountAuthorityKind =
  | "dynamic-session"
  | "nautilus-eip12"
  | "self-custody-vault"
  | "none";

export type AccountSessionStatus =
  | "disconnected"
  | "connected"
  | "connected-readonly";

export interface AccountIdentity {
  authority: AccountAuthorityKind;
  provider: AccountProviderKind;
  ergoAddress: string | null;
  userHandle: string | null;
  displayName: string | null;
}

export interface AccountMigrationPlan {
  canExportEncryptedVault: boolean;
  canUseRecoveryPhrase: boolean;
  canLinkNautilus: boolean;
  canRunWithoutDynamic: boolean;
  notes: string[];
}

export interface AccountSession {
  status: AccountSessionStatus;
  identity: AccountIdentity;
  isDynamicAuthenticated: boolean;
  isSelfCustodyReady: boolean;
  migration: AccountMigrationPlan;
}

export interface VaultSnapshot {
  ergoAddress: string;
  hasPasskeyWrap: boolean;
  hasRecoveryWrap: boolean;
  createdAt: number;
}

export interface AccountProviderAdapter {
  readonly provider: AccountProviderKind;
  getIdentity(): AccountIdentity;
  getMigrationPlan(): AccountMigrationPlan;
}

export interface SessionProvider {
  getSession(): AccountSession;
}
