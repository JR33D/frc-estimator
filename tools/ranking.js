const { getEventTeams, getTeamEventData, getTeamPastEvents, getTeamRecord } = require('../api/blueAlliance');
const { getTeamEPARating } = require('../api/statbotics');

const getRankingPointsAverage = async (team) => {
    let rankTotal = 0;
    let eventCount = 0;
    for (const pastEvent of team.events) {
        const excludeEvents = ['2025cmptx', '2025txcmp', '2025week0'];
        if (!excludeEvents.includes(pastEvent.key) && pastEvent.performance.rankingPoints) {
            rankTotal += pastEvent.performance.rankingPoints;
            eventCount++;
        }
    }
    const rankAverage = parseFloat((rankTotal / eventCount).toFixed(2));
    return { averageRankingPoints: rankAverage, EventCount: eventCount };
};

const getEventRankingEstimate = async (eventKey) => {
    const teams = [];
    const teamKeys = await getEventTeams(eventKey);
    const currentYear = new Date().getFullYear();

    await Promise.all(teamKeys.map(async (team) => {
        const teamPerformance = { teamKey: team };
        const teamPastEvents = await getTeamPastEvents(team, currentYear);
        //teamPerformance.epaRating = await getTeamEPARating(team);
        teamPerformance.events = [];

        await Promise.all(teamPastEvents.map(async (event) => {
            const teamEventData = await getTeamEventData(team, event.key);
            const eventPerformance = await GetEventPerformance(team, teamEventData);
            teamPerformance.events.push({ name: event.name, key: event.key, performance: eventPerformance });
        }));

        teamPerformance.predictions = await getRankingPointsAverage(teamPerformance);
        teams.push(teamPerformance);
    }));

    return teams;
};

module.exports = { getEventRankingEstimate };
