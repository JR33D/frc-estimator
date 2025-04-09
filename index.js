require('dotenv').config();
const fs = require('fs');
const { Team } = require('./model/team');
const { getTeamEPARating } = require('./api/statbotics.js');
const { getEventTeams, getTeamPastEvents, getTeamEventData, getYearEvents, getEventInsights } = require('./api/blueAlliance.js');
const { sortTeamsByRankingAverage, sortEventByCombinedAvg, 
    sortEventByQualAvg, sortEventByPlayoffAvg, sortEventByQualHighScore, 
    sortEventByPlayoffHighScore } = require('./utilities/sorting');
const { getChampFieldList } = require('./tools/fieldAssignment');
const { suggestPathsToPoints } = require('./tools/pointCalculator');
const { SortOrder } = require('./model/sortOrder.js');
const { loadData } = require('./tools/loadDataFile.js');



const eventKey = '2025mrcmp'; // '2025cmptx'; // '2025mrcmp'; // Example event key
const fieldEventKeys = ['2025arc','2025cur','2025dal','2025gal','2025hop','2025joh','2025mil','2025new'];
const currentYear = new Date().getFullYear();

// // get field sorted list based on an sorting option
// getEventTeams('2025cmptx')
loadData('./data/teams.json').then(async (teams) => {

    // console.log(`Teams: ${JSON.stringify(teams, null, 2)}`);

    const teamsList = await Promise.all(teams.map(async (team) => {
        let teamObj = { 
            teamKey: team.teamKey,
            number: team.number,
            name: team.teamName,
            record: { wins: 0, losses: 0, ties: 0 }, 
            eventCount: 0, 
            ranking: { averageRankingPoints: 0, totalRankingPoints: 0 } 
        };

        const events = await getTeamPastEvents(teamObj.teamKey, currentYear);
        teamObj.eventCount = events.length;

        // Process events sequentially
        for (const event of events) {
            const eventData = await getTeamEventData(teamObj.teamKey, event);
            // console.log(`Event Data: ${JSON.stringify(eventData, null, 2)}`);
            teamObj.record.wins += eventData.record.wins;
            teamObj.record.losses += eventData.record.losses;
            teamObj.record.ties += eventData.record.ties;
            teamObj.ranking.totalRankingPoints += eventData.totalRankingPoints;
        }
        teamObj.ranking.averageRankingPoints = (teamObj.ranking.totalRankingPoints / teamObj.eventCount).toFixed(2);
        return teamObj; // Return processed team object
    }));

    // console.log(JSON.stringify(teamsList, null, 2));
    console.log(`Team Count ${teamsList.length}`);

    return teamsList;
})
.then(async (teamsList) => {
    const sortOrder = SortOrder.Record;
    console.log(`Sorting Teams to fields`);

    const fieldLists = await getChampFieldList(teamsList, sortOrder);
    Object.keys(fieldLists).forEach(field => {
        // Write to a file (overwrites if it exists)
        console.log(`${field} (Teams: ${fieldLists[field].length}):`, fieldLists[field].map(team => team.number + " " + team.name));
        fs.writeFile(`./data/${sortOrder}/${field}.json`, `{"${field} (Teams: ${fieldLists[field].length})":[ ${fieldLists[field].map(team => "\r" +JSON.stringify(team, null, 2))}]}`, (err) => {
            if (err) throw err;
            console.log(`${field} File written successfully.`);
        });
    }); 
    return fieldLists;
})
.then(async (fieldLists) => {
    console.log("Getting Field EPA ratings");
    for (const field of Object.keys(fieldLists)) {
        let epaTotal = 0;
        for (const team of fieldLists[field]) {
            const teamEpa = await getTeamEPARating(team.teamKey);
            epaTotal += teamEpa.NormEPARecent;
        }
        const teamCount = fieldLists[field].length;
        console.log(`${field} (Teams: ${teamCount} EPA Total: ${epaTotal} EPA Avg: ${(epaTotal / teamCount).toFixed(2)})`);
    }
    return fieldLists;
})
.then(async (fieldLists) => {
    console.log("Checking where FMA teams are");
    const fmaTeams = await loadData('./data/fmaTeams.json'); // fmaTeams array, e.g., ["frc341", "frc5895", ...]
    
    for (const field of Object.keys(fieldLists)) {
        // Filter teams in the fieldLists that exist in fmaTeams
        const fmaFieldTeams = fieldLists[field].filter(team => fmaTeams.includes(team.teamKey));
        //console.log(JSON.stringify(fmaFieldTeams, null, 2));
        console.log(`${field}: ${fmaFieldTeams.length}`, fmaFieldTeams.map(team => team.number));
    }
});

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

// const isDistrictChampionship = true; // Change for regular event
// const targetPoints = 39; // Desired points

// suggestPathsToPoints(targetPoints, isDistrictChampionship).then((results) => {
//     console.log(`Best Case (scenario ${results.allScenarios.length - 1}):`, results.bestCase);
//     console.log(`Worst Case(scenario ${0}):`, results.worstCase);
//     console.log(`Average Case (scenario ${Math.floor(results.allScenarios.length / 2)}):`, results.averageCase);
//     // results.allScenarios.forEach((scenario, index) => {
//     //     console.log(`Scenario ${index}:`, scenario);
//     // });

// });

// getYearEvents(2025).then(async (eventKeys) => {
//     // console.log(eventKeys)
//     eventScores = [];
//     skipEvents = ["2025arc", "2025cur", "2025dal", "2025gal", "2025hop", "2025joh", "2025mil", "2025new", 
//                     "2025wiss", "2025cisw0", "2025cisw02", "2025cmptx", "2025cocs", "2025ipr", "2025mnbt",
//                     "2025mnkk", "2025srsd", "2025sunshow", "2025tris", "2025pasc", ];
//     for (const event of eventKeys) {
//         if (skipEvents.includes(event)) { continue; }
//         const eventInsights = await getEventInsights(event);
//         // console.log(`${event}: ${JSON.stringify(eventInsights, null, 2)}`);
//         const summary = { event: event };
//         if (eventInsights.playoff) {
//             summary.playoff = {
//                 average_score: eventInsights.playoff.average_score.toFixed(0),
//                 average_winning_score: eventInsights.playoff.average_winning_score.toFixed(0),
//                 high_score: eventInsights.playoff.high_score
//             };
//         }
//         if (eventInsights.qual) {
//             summary.qual = {
//                 average_score: eventInsights.qual.average_score.toFixed(0),
//                 average_winning_score: eventInsights.qual.average_winning_score.toFixed(0),
//                 high_score: eventInsights.qual.high_score
//             };
//         }
//         eventScores.push(summary);
//     };

//     return eventScores;
// }).then((eventScores) => {
//     // eventScores.forEach((event, index) => {
//     //     console.log(
//     //         `${index}) ${event.event}: Qual Avg ${event.qual?.average_score}, ` +
//     //         `Playoff Avg ${event.playoff?.average_score}, ` +
//     //         `Qual High ${event.qual?.high_score[0]} (${event.qual?.high_score[2]}), ` +
//     //         `Playoff High ${event.playoff?.high_score[0]} (${event.playoff?.high_score[2]})`
//     //     );
//     // });
//     eventScores = sortEventByPlayoffAvg(eventScores);
//     console.log("Top 5 Events by Playoff Avg Score");
//     for(let i = 0; i < 5; i++) {
//         let event = eventScores[i];
//         console.log(
//             `${i+1}) ${event.event}: Playoff Avg ${event.playoff?.average_score}, ` +
//             `Playoff High ${event.playoff?.high_score[0]} (${event.playoff?.high_score[2]})`
//         );
//     }
//     return eventScores;
// }).then((eventScores) => {
//     eventScores = sortEventByPlayoffHighScore(eventScores);
//     console.log("Top 5 Events by Playoff High Score");
//     for(let i = 0; i < 5; i++) {
//         let event = eventScores[i];
//         console.log(
//             `${i+1}) ${event.event}: Playoff Avg ${event.playoff?.average_score}, ` +
//             `Playoff High ${event.playoff?.high_score[0]} (${event.playoff?.high_score[2]})`
//         );
//     }
//     return eventScores;
// }).then((eventScores) => {
    
//     eventScores = sortEventByQualAvg(eventScores);
//     console.log("Top 5 Events by Qual Avg Score");
//     for(let i = 0; i < 5; i++) {
//         let event = eventScores[i];
//         console.log(
//             `${i+1}) ${event.event}: Qual Avg ${event.qual?.average_score}, ` +
//             `Qual High ${event.qual?.high_score[0]} (${event.qual?.high_score[2]})`
//         );
//     }
//     return eventScores;
// }).then((eventScores) => {
    
//     eventScores = sortEventByQualHighScore(eventScores);
//     console.log("Top 5 Events by Qual High Score");
//     for(let i = 0; i < 5; i++) {
//         let event = eventScores[i];
//         console.log(
//             `${i+1}) ${event.event}: Qual Avg ${event.qual?.average_score}, ` +
//             `Qual High ${event.qual?.high_score[0]} (${event.qual?.high_score[2]})`
//         );
//     }
//     return eventScores;
// });