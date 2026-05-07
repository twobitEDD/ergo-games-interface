import { ModeBadge } from "../components/ModeBadge";
import { TicTacToeBoard } from "../components/TicTacToeBoard";
import { TxIntentPlaceholder } from "../components/TxIntentPlaceholder";
import { WalletRequiredNotice } from "../components/WalletRequiredNotice";

const demoBoard: readonly ("X" | "O" | "")[] = ["X", "O", "", "", "X", "", "O", "", ""];

export default function LobbyPage(): JSX.Element {
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
          <li>Inspect ledger and progression: `GET /api/games/[gameId]` and `GET /api/rewards/[userId]`.</li>
        </ul>
      </section>

      <section>
        <h2>Tic-Tac-Toe Board (Scaffold)</h2>
        <TicTacToeBoard board={demoBoard} />
      </section>

      <TxIntentPlaceholder intentStatus="PREPARED" />
    </main>
  );
}
