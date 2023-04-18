require('dotenv').config();
var axios = require('axios');

const eventKey = '2023gal'; //'2023mrcmp'; // replace with your desired event key

const blueAllianceBaseUrl = 'https://www.thebluealliance.com/api/v3';
const statboticsBaseUrl = 'https://api.statbotics.io/v2';

const headers = {
    'X-TBA-Auth-Key': process.env.BLUE_ALLIANCE_KEY, // replace with your TBA API key
    'Accept': 'application/json'
};
const getYearEvents = async (year) => {
    const endpoint = `/events/${year}`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    return response.data;
};

const getTeamEventData = async (teamKey, eventKey) => {
    const endpoint = `/team/${teamKey}/event/${eventKey}/matches`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    return response.data;
};

const getEventTeams = async (eventKey) => {
    const endpoint = `/event/${eventKey}/teams/simple`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    const teamKeys = [];
    response.data.forEach(async (team) => {
        teamKeys.push(team.key);
    });
    return teamKeys;
};

const GetEventPerformance = async (team, teamEventData) => {
    const qualsMatches = teamEventData.filter((match) => match.comp_level == 'qm'); // filter to only qualifying matches
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
    const finalsMatches = teamEventData.filter((match) => match.comp_level !== 'qm'); // filter out qualifying matches
    const finalsWinRate = (finalsMatches.reduce((wins, match) => {
        if (match.winning_alliance === 'red' && match.alliances.red.team_keys.includes(team)) {
            wins++;
        } else if (match.winning_alliance === 'blue' && match.alliances.blue.team_keys.includes(team)) {
            wins++;
        }
        return wins;
    }, 0) / finalsMatches.length).toFixed(2);
    return {
        rankingPoints,
        qualsWinRate,
        finalsWinRate
    };
}

const getTeamPastEvents = async (teamKey, year) => {
    const endpoint = `/team/${teamKey}/events/${year}`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    const events = response.data.map(event => {
        return {
            name: event.name,
            key: event.key
        };
    });
    return events;
};

const getRankingPointsAverage = async (team) => {
    var rankTotal = 0;
    var eventCount = 0;
    team.events.forEach((pastEvent) => {
        var exlcudeEvents = ['2023cmptx', '2023gal', '2023micmp', '2023txcmp']
        if (!exlcudeEvents.includes(pastEvent.key) && pastEvent.performance.rankingPoints) {
            rankTotal = rankTotal + pastEvent.performance.rankingPoints;
            ++eventCount;
        }
    });
    var rankAverage = parseFloat((rankTotal / eventCount).toFixed(2));
    return { averageRankingPoints: rankAverage, EventCount: eventCount };
};

const getTeamEPARating = async (team) => {
    const teamNumberOnly = team.split(/[^\d]+/).filter(Boolean)
    const endpoint = `/team/${teamNumberOnly}`;
    const url = `${statboticsBaseUrl}${endpoint}`;
    const response = await axios.get(url, {'Accept': 'application/json'});
    return {
        NormEPA: response.data.norm_epa,
        NormEPARecent: response.data.norm_epa_recent
    };
};

const getData = async () => {
    let teams = [];
    const currentYear = new Date().getFullYear();
    var teamKeys = await getEventTeams(eventKey);
    await Promise.all(
        teamKeys.map(async (team) => {
            var teamPerformance = {};
            teamPerformance.teamKey = team;
            var teamPastEvents = await getTeamPastEvents(team, currentYear);
            teamPerformance.epaRating = await getTeamEPARating(team);
            teamPerformance.events = [];
            await Promise.all(
                teamPastEvents.map(async (event) => {
                    var eventData;
                    var teamEventData = await getTeamEventData(team, event.key);
                    var eventPerformance = await GetEventPerformance(team, teamEventData);
                    eventData = { name: event.name, key: event.key, performance: eventPerformance };
                    teamPerformance.events.push(eventData);
                })
            );
            teamPerformance.predictions = await getRankingPointsAverage(teamPerformance);
            teams.push(teamPerformance);
        })
    );
    return teams;
};

// getYearEvents(2023).then((data) => {
//     data.forEach((eventObj) => {
//         console.log({ name: eventObj.name, key: eventObj.key });
//     })
// });

getData().then((teams) => {
    teams.sort((a, b) => (a.predictions.averageRankingPoints > b.predictions.averageRankingPoints) ? -1 : 0);
    teams.forEach((team, index) => {
        console.log((index + 1) + ") " + team.teamKey + ": " + JSON.stringify(team.epaRating) + "\n"+ JSON.stringify(team.predictions));
    });
});

