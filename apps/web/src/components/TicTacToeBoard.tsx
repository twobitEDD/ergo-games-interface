type TicTacToeBoardProps = {
  board: readonly ("X" | "O" | "")[];
  onMoveIntent?: (cell: number) => void;
};

export function TicTacToeBoard({ board, onMoveIntent }: TicTacToeBoardProps): JSX.Element {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 64px)",
        gap: 8,
      }}
    >
      {board.map((value, idx) => (
        <button
          key={idx}
          onClick={() => onMoveIntent?.(idx)}
          style={{
            width: 64,
            height: 64,
            fontSize: 24,
            borderRadius: 8,
            border: "1px solid #9ca3af",
            background: "#f9fafb",
            cursor: "pointer",
          }}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
