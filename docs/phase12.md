Implement post-game analysis as a service layer.

Do not put analysis inside domain game rules.

Create:
- matchStatsService
- postGameSummaryService
- gameAnalysisRegistry
- genericReplayStats
- optional game-specific analyzers behind registry

PostGameSummary:
{
  gameId: string;
  gameType: string;
  winnerUserId?: string | null;
  resultReason: string;
  moveCount: number;
  durationMs?: number;
  rankChange?: RankingEvent[];
  achievementsUnlocked?: AchievementEvent[];
  replayId?: string;
  rematchAvailable: boolean;
  seriesState?: MatchSeries;
  progressionSummary?: ProgressionSummary;
}

The post-game screen should support:
- match result
- replay link
- rematch button
- series score
- ranking change when applicable
- achievements unlocked
- non-cash progression
- sponsored settlement status if applicable
- trust notice based on mode

The platform should support future game-specific “skill metrics” through analyzer plugins, but those metrics must be derived from replay/events and must not affect the official game result.