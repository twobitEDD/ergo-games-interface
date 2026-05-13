import { ModeBadge } from "../components/ModeBadge";
import { TicTacToeBoard } from "../components/TicTacToeBoard";
import { TxIntentPlaceholder } from "../components/TxIntentPlaceholder";
import { WalletRequiredNotice } from "../components/WalletRequiredNotice";

const demoBoard: readonly ("X" | "O" | "")[] = ["X", "O", "", "", "X", "", "O", "", ""];

export default function LobbyPage() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, display: "grid", gap: 20 }}>
      <section>
        <h1>Ergo Games Lobby</h1>
        <p>
          Shared game rules, clear settlement modes. No-wager language and no hidden value automation.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          <ModeBadge mode="ON_CHAIN_PLAY" />
          <ModeBadge mode="FREE_PLAY" />
          <ModeBadge mode="SPONSORED_PLAY" />
        </div>
      </section>

      <WalletRequiredNotice />

      <section
        style={{
          border: "1px solid #93c5fd",
          borderRadius: 8,
          padding: 12,
          background: "#eff6ff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>No-Funds Participation Flow</h2>
        <p style={{ marginBottom: 8 }}>
          The `FREE_PLAY` and `SPONSORED_PLAY` modes run the same deterministic move rules as wallet mode.
          Outcomes are written to an off-chain append-only event log and grant non-cash progression points.
        </p>
        <ul style={{ margin: 0, paddingInlineStart: 20 }}>
          <li>Create lobby: `POST /api/games/create` with `mode` set to `FREE_PLAY` or `SPONSORED_PLAY`.</li>
          <li>Join lobby: `POST /api/games/join` with `gameId` and `joinerUserId`.</li>
          <li>Submit moves: `POST /api/games/move` with optional replay-safe `requestId`.</li>
          <li>
            Settlement scaffold: queue and status via `POST /api/settlement/enqueue` and `GET
            /api/settlement/status/[settlementId]`.
          </li>
          <li>Inspect ledger and progression: `GET /api/games/[gameId]` and `GET /api/rewards/[userId]`.</li>
        </ul>
      </section>

      <section>
        <h2>Tic-Tac-Toe Board (Scaffold)</h2>
        <TicTacToeBoard board={demoBoard} />
      </section>

      <section
        style={{
          border: "1px solid #bbf7d0",
          borderRadius: 8,
          padding: 12,
          background: "#f0fdf4",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Funded UX Acceleration Layer</h2>
        <p style={{ margin: "8px 0" }}>
          Lifecycle visibility now includes provisional safety markers, confidence meter tracking, and recovery
          friendly pending actions. Finality is never presented as final before confirmation threshold depth.
        </p>
        <ul style={{ margin: 0, paddingInlineStart: 20 }}>
          <li>Create/list intents: `POST/GET /api/on-chain/intents`.</li>
          <li>Update lifecycle: `POST /api/on-chain/intents/[intentId]/status`.</li>
          <li>Read intent status: `GET /api/on-chain/intents/[intentId]`.</li>
          <li>Adjust controls: `GET/POST /api/on-chain/controls`.</li>
        </ul>
      </section>

      <TxIntentPlaceholder
        intentId="intent_000001"
        gameId="game_demo_001"
        settlementId="stl_000001"
        intentStatus="CONFIRMED"
        trustLabel="PROVISIONAL_CHAIN_SIGNAL"
        confidencePercent={67}
        observedConfirmations={2}
        requiredDepth={3}
        provisional
        pendingActions={[
          "Resume pending intent checks after refresh via GET /api/on-chain/intents?pendingOnly=true&includeRecovery=true",
          "Wait for additional confirmation before treating state as final",
          "Escalate to incident fallback toggle if reorg risk appears",
        ]}
        controls={{
          strictConfirmationMode: false,
          optimisticMode: true,
          incidentFallbackToOffChain: false,
        }}
      />
    </main>
  );
}
