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

module.exports = { sortTeamsByRecord };
