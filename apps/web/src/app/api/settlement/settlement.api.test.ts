import assert from "node:assert/strict";
import test from "node:test";

import { POST as enqueueSettlement } from "./enqueue/route";
import { POST as observeIndexer } from "./indexer/observe/route";
import { GET as getSettlementStatus } from "./status/[settlementId]/route";
import { POST as runWorker } from "./worker/run/route";
import { registerSettlement, resetSettlementQueueForTests } from "../../../lib/server/settlement/settlementQueue";

const postJson = (url: string, payload: Record<string, unknown>): Request =>
  new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

test.beforeEach(() => {
  resetSettlementQueueForTests();
});

test("status api returns settlement lifecycle payload", async () => {
  const settlement = registerSettlement({
    rewardId: "reward-api-1",
    userId: "user-api-1",
    gameId: "game-api-1",
    units: 30,
    unitKind: "XP",
    decisionInput: {
      gameMode: "SPONSORED_PLAY",
      sponsorshipEnabled: true,
      proofPipelineReady: true,
      relayerFunded: true,
    },
  });
  await runWorker(postJson("http://localhost/api/settlement/worker/run", {}));

  const statusResponse = await getSettlementStatus(new Request("http://localhost"), {
    params: { settlementId: settlement.settlementId },
  });
  assert.equal(statusResponse.status, 200);
  const statusPayload = (await statusResponse.json()) as { lifecycleStatus: string; queueStatus: string };
  assert.equal(statusPayload.lifecycleStatus, "PROOF_PENDING");
  assert.equal(statusPayload.queueStatus, "COMMITTED");
});

test("status api reflects verified state after indexer reconciliation", async () => {
  const settlement = registerSettlement({
    rewardId: "reward-api-2",
    userId: "user-api-2",
    gameId: "game-api-2",
    units: 10,
    unitKind: "CREDITS",
    decisionInput: {
      gameMode: "SPONSORED_PLAY",
      sponsorshipEnabled: true,
      proofPipelineReady: true,
      relayerFunded: true,
    },
  });

  await runWorker(postJson("http://localhost/api/settlement/worker/run", {}));
  const committedResponse = await getSettlementStatus(new Request("http://localhost"), {
    params: { settlementId: settlement.settlementId },
  });
  const committedPayload = (await committedResponse.json()) as { commitmentHash: string | null };
  assert.equal(typeof committedPayload.commitmentHash, "string");

  await observeIndexer(
    postJson("http://localhost/api/settlement/indexer/observe", {
      commitmentHash: committedPayload.commitmentHash,
      txId: "tx_from_stub",
      confirmations: 3,
    })
  );

  const verifiedResponse = await getSettlementStatus(new Request("http://localhost"), {
    params: { settlementId: settlement.settlementId },
  });
  const verifiedPayload = (await verifiedResponse.json()) as { lifecycleStatus: string; queueStatus: string };
  assert.equal(verifiedPayload.lifecycleStatus, "VERIFIED_ON_ERGO");
  assert.equal(verifiedPayload.queueStatus, "VERIFIED");
});

test("enqueue api rejects settlement that is not sponsored eligible", async () => {
  const settlement = registerSettlement({
    rewardId: "reward-api-3",
    userId: "user-api-3",
    gameId: "game-api-3",
    units: 20,
    unitKind: "XP",
    decisionInput: {
      gameMode: "FREE_PLAY",
      sponsorshipEnabled: true,
      proofPipelineReady: true,
      relayerFunded: true,
    },
  });

  const response = await enqueueSettlement(
    postJson("http://localhost/api/settlement/enqueue", {
      settlementId: settlement.settlementId,
    })
  );
  assert.equal(response.status, 409);
});
