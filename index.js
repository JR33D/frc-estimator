require('dotenv').config();
const { getEventRankingEstimate } = require('./tools/ranking');
const { getChampFieldList } = require('./tools/fieldAssignment');

const eventKey = '2025mrcmp'; // '2025cmptx'; // Example event key

// Get event ranking estimate and field assignments
getEventRankingEstimate(eventKey).then((teams) => {
    teams.sort((a, b) => (a.predictions.averageRankingPoints > b.predictions.averageRankingPoints) ? -1 : 0);
    teams.forEach((team, index) => {
        console.log((index + 1) + ") " + team.teamKey + ": " + JSON.stringify(team.epaRating) + "\n" + JSON.stringify(team.predictions));
    });
});

// Hard code to worlds eventKey since that's place with fields.
getChampFieldList('2025cmptx').then((fieldLists) => {
    Object.keys(fieldLists).forEach(field => {
        console.log(`${field}:`, fieldLists[field].map(team => team.teamKey));
    });
});
