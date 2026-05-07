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
          Shared game rules, clear settlement modes. No wagering language, no hidden value automation.
        </p>
        <ModeBadge mode="ON_CHAIN_PLAY" />
      </section>

      <WalletRequiredNotice />

      <section>
        <h2>Tic-Tac-Toe Board (Scaffold)</h2>
        <TicTacToeBoard board={demoBoard} />
      </section>

      <TxIntentPlaceholder intentStatus="PREPARED" />
    </main>
  );
}
