Implement a real browser runtime in apps/web.

Current docs say the web dev command is scaffolded and not yet a long-running app server. Build the actual Next.js runtime.

Create routes:
- /
- /play
- /games
- /games/[gameType]
- /match/[gameId]
- /profile/[userId]
- /leaderboards
- /rewards/[userId]
- /replays/[replayId]

Create game renderer registry:
{
  [gameType]: ReactComponent
}

Create shared components:
- ModeBadge
- TrustNotice
- WalletPathNotice
- NoFundsPathNotice
- SponsoredSettlementNotice
- FinalityStatusPill
- GameShell
- GameLobby
- MatchStatusBar
- MoveHistory
- PostGameSummary
- RematchPanel
- SeriesPanel
- ReplayViewer
- RankingPanel
- LeaderboardPanel
- AchievementPanel
- WalletBindPanel
- AccountConversionPanel

UI requirements:
- support FREE_PLAY without wallet
- support SPONSORED_PLAY trust messaging
- support ON_CHAIN_PLAY wallet-aware intent messaging
- never represent provisional chain state as final
- show confirmation/finality status where applicable
- show no-funds/off-chain progression copy for free users
- make rematch flow prominent after match completion
- make replay and learning path accessible after match completion