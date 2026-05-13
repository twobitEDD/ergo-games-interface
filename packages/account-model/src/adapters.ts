import {
  AccountIdentity,
  AccountMigrationPlan,
  AccountProviderAdapter,
  AccountProviderKind,
} from "./types";

interface AdapterSnapshot {
  identity: AccountIdentity;
  migration: AccountMigrationPlan;
}

abstract class BaseAdapter implements AccountProviderAdapter {
  constructor(
    public readonly provider: AccountProviderKind,
    protected readonly snapshot: AdapterSnapshot
  ) {}

  getIdentity(): AccountIdentity {
    return this.snapshot.identity;
  }

  getMigrationPlan(): AccountMigrationPlan {
    return this.snapshot.migration;
  }
}

export class DynamicAccountAdapter extends BaseAdapter {
  constructor(snapshot: AdapterSnapshot) {
    super("dynamic", snapshot);
  }
}

export class NautilusAccountAdapter extends BaseAdapter {
  constructor(snapshot: AdapterSnapshot) {
    super("nautilus", snapshot);
  }
}

export class VaultAccountAdapter extends BaseAdapter {
  constructor(snapshot: AdapterSnapshot) {
    super("vault", snapshot);
  }
}

export class NoneAccountAdapter extends BaseAdapter {
  constructor(snapshot: AdapterSnapshot) {
    super("none", snapshot);
  }
}

export const buildAdapter = (snapshot: AdapterSnapshot): AccountProviderAdapter => {
  if (snapshot.identity.provider === "dynamic") {
    return new DynamicAccountAdapter(snapshot);
  }
  if (snapshot.identity.provider === "nautilus") {
    return new NautilusAccountAdapter(snapshot);
  }
  if (snapshot.identity.provider === "vault") {
    return new VaultAccountAdapter(snapshot);
  }
  return new NoneAccountAdapter(snapshot);
};
