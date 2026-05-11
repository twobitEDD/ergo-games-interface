import assert from "node:assert/strict";
import test from "node:test";
import { buildGameCapabilitySnapshot } from "./platformContracts";

test("buildGameCapabilitySnapshot reports continuity and on-chain blockers", () => {
  const snapshot = buildGameCapabilitySnapshot({
    hasSession: true,
    hasWalletBinding: false,
    canRunWithoutDynamic: false,
    canExportEncryptedVault: false,
    canUseRecoveryPhrase: false,
    canExportToRecoveryService: false,
  });

  assert.equal(snapshot.canCreateMatches, true);
  assert.equal(snapshot.canCreateOnChainIntents, false);
  assert.equal(snapshot.canUseRecoveryService, false);
  assert.ok(snapshot.blockers.length >= 2);
});

