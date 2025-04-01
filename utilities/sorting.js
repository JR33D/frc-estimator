// Sort teams by wins, losses, and ties
const sortTeamsByRecord = (teams) => {
    teams.sort((a, b) => {
        if (b.record.wins !== a.record.wins) {
            return b.record.wins - a.record.wins; // Sort by most wins (desc)
        }
        if (a.record.losses !== b.record.losses) {
            return a.record.losses - b.record.losses; // Sort by least losses (asc)
        }
        return b.record.ties - a.record.ties; // Sort by most ties (desc)
    });
    return teams;
};

const sortTeamsByRankingAverage = (teams) => {
    return teams.sort((a, b) => (a.ranking.averageRankingPoints > b.ranking.averageRankingPoints) ? -1 : 0);
};

const sortTeamsByNumber = (teams) => {
    return teams.sort((a,b) =>{
        const numA = parseInt(a.teamKey.substring(3), 10);
        const numB = parseInt(b.teamKey.substring(3), 10);
        return numA - numB; // Sort numerically
      });
}

module.exports = { sortTeamsByNumber, sortTeamsByRecord, sortTeamsByRankingAverage };
