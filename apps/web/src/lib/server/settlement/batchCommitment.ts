import { createHash } from "node:crypto";

import type { BatchCommitment, SettlementRecord } from "./types";

const hashText = (value: string): string => createHash("sha256").update(value).digest("hex");

const pairwiseMerkleRoot = (hashes: string[]): string => {
  if (hashes.length === 0) return hashText("empty-batch");
  let level = [...hashes];
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? level[i];
      next.push(hashText(`${left}${right}`));
    }
    level = next;
  }
  return level[0];
};

export const buildBatchCommitment = (
  records: SettlementRecord[],
  input: {
    batchId: string;
    windowStartedAt: string;
    windowClosedAt: string;
  }
): BatchCommitment => {
  const sorted = [...records].sort((a, b) => a.settlementId.localeCompare(b.settlementId));
  const leafHashes = sorted.map((record) =>
    hashText(
      JSON.stringify({
        settlementId: record.settlementId,
        rewardId: record.rewardId,
        userId: record.userId,
        gameId: record.gameId,
        units: record.units,
        unitKind: record.unitKind,
      })
    )
  );
  const merkleRoot = pairwiseMerkleRoot(leafHashes);
  const commitmentHash = hashText(
    JSON.stringify({
      merkleRoot,
      count: sorted.length,
      windowStartedAt: input.windowStartedAt,
      windowClosedAt: input.windowClosedAt,
    })
  );

  return {
    batchId: input.batchId,
    settlementIds: sorted.map((record) => record.settlementId),
    leafHashes,
    merkleRoot,
    commitmentHash,
    windowStartedAt: input.windowStartedAt,
    windowClosedAt: input.windowClosedAt,
  };
};
