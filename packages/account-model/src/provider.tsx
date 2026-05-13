import React, { createContext, useContext, useMemo } from "react";
import { buildAdapter } from "./adapters";
import { buildAccountSession, WalletSourceKind } from "./sessionBuilder";
import { AccountProviderAdapter, AccountSession, SessionProvider, VaultSnapshot } from "./types";

interface DynamicUserLike {
  id?: string;
  userId?: string;
  email?: string;
}

interface VaultLike {
  ergoAddress: string;
  passkey?: unknown;
  passkeyEncrypted?: unknown;
  recoveryEncrypted?: { ciphertext?: unknown } | null;
  createdAt: number;
}

export interface AccountModelValue<TDynamicUser = unknown, TVault = unknown>
  extends SessionProvider {
  session: AccountSession;
  activeAdapter: AccountProviderAdapter;
  dynamicUser: TDynamicUser | null;
  vault: TVault | null;
}

const AccountModelContext = createContext<AccountModelValue | null>(null);

const defaultToVaultSnapshot = (vault: VaultLike | null): VaultSnapshot | null => {
  if (!vault) return null;
  return {
    ergoAddress: vault.ergoAddress,
    hasPasskeyWrap: Boolean(vault.passkey && vault.passkeyEncrypted),
    hasRecoveryWrap: Boolean(vault.recoveryEncrypted?.ciphertext),
    createdAt: vault.createdAt,
  };
};

const toWalletSourceKind = (source: string | null | undefined): WalletSourceKind => {
  if (source === "dynamic-nautilus") return "dynamic-nautilus";
  if (source === "nautilus-direct") return "nautilus-direct";
  if (source === "vault") return "vault";
  return null;
};

export interface AccountModelProviderProps<TDynamicUser = unknown, TVault = unknown> {
  children: React.ReactNode;
  dynamicUser: TDynamicUser | null;
  walletConnected: boolean;
  walletSource: string | null | undefined;
  ergoAddress: string | null;
  vault: TVault | null;
  toVaultSnapshot?: (vault: TVault | null) => VaultSnapshot | null;
  nautilusApiAvailable?: boolean;
}

export const AccountModelProvider = <TDynamicUser = unknown, TVault = unknown>({
  children,
  dynamicUser,
  walletConnected,
  walletSource,
  ergoAddress,
  vault,
  toVaultSnapshot,
  nautilusApiAvailable,
}: AccountModelProviderProps<TDynamicUser, TVault>) => {
  const vaultSnapshot = useMemo(() => {
    if (toVaultSnapshot) {
      return toVaultSnapshot(vault);
    }
    return defaultToVaultSnapshot(vault as unknown as VaultLike | null);
  }, [vault, toVaultSnapshot]);

  const session = useMemo(
    () =>
      buildAccountSession({
        walletConnected,
        walletSource: toWalletSourceKind(walletSource),
        ergoAddress: ergoAddress ?? null,
        dynamicUser: (dynamicUser as DynamicUserLike | null) ?? null,
        vault: vaultSnapshot,
        nautilusApiAvailable:
          nautilusApiAvailable ??
          (typeof window !== "undefined" &&
            Boolean((window as any).ergoConnector?.nautilus || (window as any).ergo)),
      }),
    [
      walletConnected,
      walletSource,
      ergoAddress,
      dynamicUser,
      vaultSnapshot,
      nautilusApiAvailable,
    ]
  );

  const activeAdapter = useMemo(
    () =>
      buildAdapter({
        identity: session.identity,
        migration: session.migration,
      }),
    [session.identity, session.migration]
  );

  const value = useMemo<AccountModelValue<TDynamicUser, TVault>>(
    () => ({
      session,
      activeAdapter,
      dynamicUser,
      vault,
      getSession: () => session,
    }),
    [session, activeAdapter, dynamicUser, vault]
  );

  return <AccountModelContext.Provider value={value}>{children}</AccountModelContext.Provider>;
};

export const useAccountModel = <
  TDynamicUser = unknown,
  TVault = unknown,
>(): AccountModelValue<TDynamicUser, TVault> => {
  const ctx = useContext(AccountModelContext);
  if (!ctx) {
    throw new Error("useAccountModel must be used inside <AccountModelProvider />");
  }
  return ctx as AccountModelValue<TDynamicUser, TVault>;
};
