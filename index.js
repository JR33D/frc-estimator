require('dotenv').config();
const { Team } = require('./model/team');
const { getEventTeams, getTeamPastEvents, getTeamEventData } = require('./api/blueAlliance.js');
const { sortTeamsByRankingAverage } = require('./utilities/sorting');
const { getChampFieldList } = require('./tools/fieldAssignment');
const { suggestPathsToPoints } = require('./tools/pointCalculator');
const { SortOrder } = require('./model/sortOrder.js');


const eventKey = '2025mrcmp'; // '2025cmptx'; // '2025mrcmp'; // Example event key
const currentYear = new Date().getFullYear();

// // get field sorted list based on an sorting option
// getEventTeams('2025cmptx').then(async (teams) => {
    
//     // console.log(`Teams: ${JSON.stringify(teams, null, 2)}`);

//     const teamsList = await Promise.all(teams.map(async (team) => {
//         let teamObj = { 
//             teamKey: team, 
//             record: { wins: 0, losses: 0, ties: 0 }, 
//             eventCount: 0, 
//             ranking: { averageRankingPoints: 0, totalRankingPoints: 0 } 
//         };

//         const events = await getTeamPastEvents(team, currentYear);
//         teamObj.eventCount = events.length;

//         // Process events sequentially
//         for (const event of events) {
//             const eventData = await getTeamEventData(team, event);
//             teamObj.record.wins += eventData.record.wins;
//             teamObj.record.losses += eventData.record.losses;
//             teamObj.record.ties += eventData.record.ties;
//             teamObj.ranking.totalRankingPoints += eventData.totalRankingPoints;
//         }
//         teamObj.ranking.averageRankingPoints = teamObj.ranking.totalRankingPoints / teamObj.eventCount;
//         return teamObj; // Return processed team object
//     }));

//     // console.log(JSON.stringify(teamsList, null, 2));
//     console.log(`Team Count ${teamsList.length}`);
    
//     return teamsList;
// })
// .then(async (teamsList) => {
//     const fieldLists = await getChampFieldList(teamsList, SortOrder.Record);
//     Object.keys(fieldLists).forEach(field => {
//         console.log(`${field} (Teams: ${fieldLists[field].length}):`, fieldLists[field].map(team => team.teamKey));
//     }); 
// });

// // Get Ranking estimate for event
// getEventTeams('2025mrcmp').then(async (teams) => {
    
//     // console.log(`Teams: ${JSON.stringify(teams, null, 2)}`);

//     const teamsList = await Promise.all(teams.map(async (team) => {
//         let teamObj = { 
//             teamKey: team, 
//             record: { wins: 0, losses: 0, ties: 0 }, 
//             eventCount: 0, 
//             ranking: { averageRankingPoints: 0, totalRankingPoints: 0 } 
//         };

//         const events = await getTeamPastEvents(team, currentYear);
//         teamObj.eventCount = events.length;

//         // Process events sequentially
//         for (const event of events) {
//             const eventData = await getTeamEventData(team, event);
//             teamObj.record.wins += eventData.record.wins;
//             teamObj.record.losses += eventData.record.losses;
//             teamObj.record.ties += eventData.record.ties;
//             teamObj.ranking.totalRankingPoints += eventData.totalRankingPoints;
//         }
//         teamObj.ranking.averageRankingPoints = teamObj.ranking.totalRankingPoints / teamObj.eventCount;
//         return teamObj; // Return processed team object
//     }));

//     // console.log(JSON.stringify(teamsList, null, 2));
//     console.log(`Team Count ${teamsList.length}`);
    
//     return teamsList;
// })
// .then((teamsList) => {
//     const teams = sortTeamsByRankingAverage(teamsList);
//     teams.forEach((team, index) => {
//         console.log(`${(index + 1)}) ${team.teamKey}: ${JSON.stringify(team.ranking.averageRankingPoints)}`);
//     });
// });

const isDistrictChampionship = false; // Change for regular event
const targetPoints = 13; // Desired points

suggestPathsToPoints(targetPoints, isDistrictChampionship).then((results) => {
    console.log("Best Case:", results.bestCase);
    console.log("Worst Case:", results.worstCase);
    console.log("Average Case:", results.averageCase);
    // results.allScenarios.forEach((scenario, index) => {
    //     console.log(`Scenario ${index}:`, scenario);
    // });
    
});