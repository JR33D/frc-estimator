const { getEventTeams, getTeamEventData, getTeamPastEvents, getTeamRecord } = require('../api/blueAlliance');
const { getTeamEPARating } = require('../api/statbotics');

const GetEventPerformance = async (team, teamEventData) => {
    const qualsMatches = teamEventData.filter((match) => match.comp_level === 'qm');
    const rankingPoints = qualsMatches.reduce((points, match) => {
        const redAlliance = match.alliances.red;
        const blueAlliance = match.alliances.blue;
        if (match.score_breakdown != null) {
            if (redAlliance.team_keys.includes(team)) {
                points += match.score_breakdown.red.rp;
            } else if (blueAlliance.team_keys.includes(team)) {
                points += match.score_breakdown.blue.rp;
            }
        }
        return points;
    }, 0);

    const qualsWinRate = (qualsMatches.reduce((wins, match) => {
        if (match.winning_alliance === 'red' && match.alliances.red.team_keys.includes(team)) {
            wins++;
        } else if (match.winning_alliance === 'blue' && match.alliances.blue.team_keys.includes(team)) {
            wins++;
        }
        return wins;
    }, 0) / qualsMatches.length).toFixed(2);

    const finalsMatches = teamEventData.filter((match) => match.comp_level !== 'qm');
    const finalsWinRate = (finalsMatches.reduce((wins, match) => {
        if (match.winning_alliance === 'red' && match.alliances.red.team_keys.includes(team)) {
            wins++;
        } else if (match.winning_alliance === 'blue' && match.alliances.blue.team_keys.includes(team)) {
            wins++;
        }
        return wins;
    }, 0) / finalsMatches.length).toFixed(2);

    return { rankingPoints, qualsWinRate, finalsWinRate };
};

const getRankingPointsAverage = async (team) => {
    let rankTotal = 0;
    let eventCount = 0;
    for (const pastEvent of team.events) {
        const excludeEvents = ['2024cmptx', '2024txcmp', '2024week0'];
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
        teamPerformance.epaRating = await getTeamEPARating(team);
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
