module.exports = {
    teamKey: "",
    record: { wins: 0, losses: 0, ties: 0 },
    rankingPoints: { averageRankingPoints: (this.totalRankingPoints/this.eventCount) ?? 0, totalRankingPoints: 0 },
    eventCount: 0
};