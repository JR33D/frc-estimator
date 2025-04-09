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
};

const sortEventByCombinedAvg = (events) => {
    return events.sort((a, b) => {
        const aAvg = (a.qual?.average_score + a.playoff?.average_score) / 2;
        const bAvg = (b.qual?.average_score + b.playoff?.average_score) / 2;
        return bAvg - aAvg;
    });
};


const sortEventByQualAvg = (events) => {
    return events.sort((a, b) => {
        if(b.qual && b.qual.average_score) {
            bQualAvg = b.qual.average_score;
        } else {
            bQualAvg = 0;
        }
        if(a.qual && a.qual.average_score) {
            aQualAvg = a.qual.average_score;
        } else {
            aQualAvg = 0;
        }
        return bQualAvg - aQualAvg;
    });
};


const sortEventByPlayoffAvg = (events) => {
    return events.sort((a, b) => {
        if(b.playoff && b.playoff.average_score) {
            bPlayoffAvg = b.playoff.average_score;
        } else {
            bPlayoffAvg = 0;
        }
        if(a.playoff && a.playoff.average_score) {
            aPlayoffAvg = a.playoff.average_score;
        } else {
            aPlayoffAvg = 0;
        }
        return bPlayoffAvg - aPlayoffAvg;
    });
};

const sortEventByQualHighScore = (events) => {
    return events.sort((a, b) => {
        return b.qual?.high_score[0] - a.qual?.high_score[0];
    });
};

const sortEventByPlayoffHighScore = (events) => {
    return events.sort((a, b) => {
        return b.playoff?.high_score[0] - a.playoff?.high_score[0];
    });
};

module.exports = { sortTeamsByNumber, sortTeamsByRecord, sortTeamsByRankingAverage, sortEventByCombinedAvg, sortEventByPlayoffAvg, sortEventByQualAvg, sortEventByQualHighScore, sortEventByPlayoffHighScore };
