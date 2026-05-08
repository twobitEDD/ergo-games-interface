Implement a generic game module framework in packages/domain.

Requirements:

1. Create a generic GameRules interface.

It must support:
- gameType
- version
- getInitialState(config)
- getLegalMoves(state)
- validateMove(state, move)
- applyMove(state, move)
- getResult(state)
- serializeState(state)
- hashState(state)

2. Create shared domain types:
- GameType
- GameMode
- GameResult
- ValidationResult
- PlayerSymbol
- GameConfig
- SerializedGameState
- StateHash

3. Wrap existing deterministic tic-tac-toe and super tic-tac-toe logic behind this interface.

4. Create a gameRegistry that resolves game rules by gameType.

5. Ensure the registry can support future game modules without changing API route logic.

6. Domain rules must be pure:
- no database
- no API calls
- no wallet references
- no settlement references
- no rank/reward/progression references
- no timestamps inside state transition functions
- no random behavior unless deterministic seed support is explicitly added

7. Add tests for:
- initial state generation
- legal move generation
- invalid move rejection
- deterministic applyMove behavior
- result detection
- serialization
- state hashing
- replayed move sequence produces expected final hash