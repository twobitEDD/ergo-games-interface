import {
  AccountIdentity,
  AccountMigrationPlan,
  AccountProviderKind,
  AccountSession,
  AccountSessionStatus,
  AccountAuthorityKind,
  VaultSnapshot,
} from "./types";

export type WalletSourceKind =
  | "dynamic-nautilus"
  | "nautilus-direct"
  | "vault"
  | null;

export interface BuildSessionInput {
  walletConnected: boolean;
  walletSource: WalletSourceKind;
  ergoAddress: string | null;
  dynamicUser: {
    id?: string;
    userId?: string;
    email?: string;
  } | null;
  vault: VaultSnapshot | null;
  nautilusApiAvailable: boolean;
}

const deriveAuthority = (source: WalletSourceKind): AccountAuthorityKind => {
  if (source === "dynamic-nautilus" || source === "nautilus-direct") {
    return "nautilus-eip12";
  }
  if (source === "vault") return "self-custody-vault";
  return "none";
};

const deriveProvider = (source: WalletSourceKind): AccountProviderKind => {
  if (source === "dynamic-nautilus") return "dynamic";
  if (source === "nautilus-direct") return "nautilus";
  if (source === "vault") return "vault";
  return "none";
};

const deriveStatus = (
  walletConnected: boolean,
  ergoAddress: string | null
): AccountSessionStatus => {
  if (!walletConnected || !ergoAddress) return "disconnected";
  return "connected";
};

const deriveUserHandle = (dynamicUser: BuildSessionInput["dynamicUser"]): string | null =>
  dynamicUser?.email || dynamicUser?.userId || dynamicUser?.id || null;

const buildMigrationPlan = (input: BuildSessionInput): AccountMigrationPlan => {
  const notes: string[] = [];

  if (input.vault) {
    notes.push(
      "Vault is encrypted locally and can be mirrored to Dynamic metadata without exposing the private key."
    );
  } else {
    notes.push(
      "No vault found yet. Provisioning a vault creates self-custody material independent from Dynamic."
    );
  }

  if (input.nautilusApiAvailable) {
    notes.push("Nautilus can be linked as an alternate signer authority.");
  } else {
    notes.push("Nautilus extension not detected in this browser session.");
  }

  if (!input.dynamicUser) {
    notes.push("Dynamic login is optional for Nautilus-only operation.");
  }

  return {
    canExportEncryptedVault: Boolean(input.vault),
    canUseRecoveryPhrase: Boolean(input.vault?.hasRecoveryWrap),
    canLinkNautilus: input.nautilusApiAvailable,
    canRunWithoutDynamic: input.walletSource === "nautilus-direct" || !input.dynamicUser,
    notes,
  };
};

export const buildAccountSession = (input: BuildSessionInput): AccountSession => {
  const authority = deriveAuthority(input.walletSource);
  const provider = deriveProvider(input.walletSource);
  const identity: AccountIdentity = {
    authority,
    provider,
    ergoAddress: input.ergoAddress,
    userHandle: deriveUserHandle(input.dynamicUser),
    displayName: input.dynamicUser?.email || null,
  };

  return {
    status: deriveStatus(input.walletConnected, input.ergoAddress),
    identity,
    isDynamicAuthenticated: Boolean(input.dynamicUser),
    isSelfCustodyReady: Boolean(input.vault),
    migration: buildMigrationPlan(input),
  };
};
