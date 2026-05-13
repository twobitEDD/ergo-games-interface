# @twobitedd/ergo-games-interface

Deterministic game domain package used by Ergo Games clients and services.

## Install

```bash
npm install @twobitedd/ergo-games-interface
```

## API

- `GAME_TYPES`, `GameType`, `GameTypeMetadata`, `GAME_TYPE_CATALOG`
- `buildDefaultGameTypeListResponse`, `describeRuntimeGameStatus`
- `PlayerSeatMark`, `SeatedPlayerGameSummary`, `ApiListPlayerGamesResponse`
- `RuntimeGameStatus`, `ApiCreateGameRequest`, `ApiGameTypeListResponse`
- `PlayerProfile`, `PlayerRewardSnapshot`, `AchievementProgressSnapshot`, `LeaderboardEntry`
- `MatchSessionSummary`, `SecurityMetricPoint`, `EndpointMetricPoint`
- `GameSessionService`, `GameEngine`, `RewardPolicy`, `SettlementPolicy`
- `createTicTacToeState(...)`
- `applyDeterministicTicTacToeMove(...)`
- `statusOf(...)`
- `createSuperTicTacToeState(...)`
- `applySuperTicTacToeMove(...)`

## Local Development

From `ergo-games-interface/packages/domain`:

```bash
npm install
npm run check
```

## Publish Checklist

```bash
npm run prepublishOnly
npm pack --dry-run
npm publish --access public
```
