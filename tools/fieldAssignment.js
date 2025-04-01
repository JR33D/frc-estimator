
const { Team } = require('../model/team');
const { getTeamEventData } = require('../api/blueAlliance');
const { assignTeamsToFields } = require('../utilities/fieldAssignment');
const { getEventRankingEstimate } = require('./ranking.js');
const { sortTeamsByRecord, sortTeamsByRankingAverage } = require('../utilities/sorting');
const { SortOrder } = require('../model/sortOrder.js');

// Assign teams to fields based on records
const getChampFieldList = async (teams, order) => {
    switch (order) {
        case SortOrder.Record:
            console.log("Sorting by Record...");
            teams = sortTeamsByRecord(teams);
            break;
        case SortOrder.RankingPoints:
            console.log("Sorting by Ranking Points...");
            teams = sortTeamsByRankingAverage(teams);
            break;
        default:
            console.log("Unknown sorting order");
    }
    return assignTeamsToFields(teams);
};

module.exports = { getChampFieldList };
