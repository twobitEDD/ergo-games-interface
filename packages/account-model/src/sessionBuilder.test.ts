import assert from "node:assert/strict";
import test from "node:test";
import { buildAccountSession } from "./sessionBuilder";

test("marks vault sessions as self-custody ready", () => {
  const session = buildAccountSession({
    walletConnected: true,
    walletSource: "vault",
    ergoAddress: "9abc",
    dynamicUser: { email: "user@example.com" },
    vault: {
      ergoAddress: "9abc",
      hasPasskeyWrap: true,
      hasRecoveryWrap: true,
      createdAt: Date.now(),
    },
    nautilusApiAvailable: true,
  });

  assert.equal(session.identity.authority, "self-custody-vault");
  assert.equal(session.isSelfCustodyReady, true);
  assert.equal(session.migration.canExportEncryptedVault, true);
  assert.equal(session.migration.canUseRecoveryPhrase, true);
});

test("marks nautilus-direct sessions as dynamic-optional", () => {
  const session = buildAccountSession({
    walletConnected: true,
    walletSource: "nautilus-direct",
    ergoAddress: "9xyz",
    dynamicUser: null,
    vault: null,
    nautilusApiAvailable: true,
  });

  assert.equal(session.identity.authority, "nautilus-eip12");
  assert.equal(session.isDynamicAuthenticated, false);
  assert.equal(session.migration.canRunWithoutDynamic, true);
});
