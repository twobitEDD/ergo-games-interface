Implement replay infrastructure that works for any registered deterministic game.

Create replay service in packages/services/src/replay.

Replay model:
{
  replayId: string;
  gameId: string;
  gameType: string;
  gameVersion: string;
  initialState: unknown;
  initialStateHash: string;
  finalStateHash: string;
  moves: ReplayMove[];
  result: GameResult;
  createdAt: string;
}

ReplayMove:
{
  moveNumber: number;
  actorUserId: string;
  move: unknown;
  previousStateHash: string;
  nextStateHash: string;
  appliedAt: string;
}

Implement:
- replayRecorder
- replayValidator
- replayProjector
- replayExportService

Add APIs:
- GET /api/games/[gameId]/replay
- GET /api/replays/[replayId]
- POST /api/replays/[replayId]/validate

Replay validation must:
1. Resolve game rules by gameType.
2. Start from initial state.
3. Apply every replay move in order.
4. Validate previousStateHash before each move.
5. Validate nextStateHash after each move.
6. Compare reconstructed finalStateHash to expected finalStateHash.
7. Return validation status without mutating the game.

Replay validation is required for:
- post-game review
- ranking integrity
- sponsored settlement proof
- batch commitment proof
- operational incident investigation
- future dispute handling