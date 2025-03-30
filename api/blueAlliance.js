const axios = require('axios');

const blueAllianceBaseUrl = 'https://www.thebluealliance.com/api/v3';
const headers = {
    'X-TBA-Auth-Key': process.env.BLUE_ALLIANCE_KEY,  // Replace with your TBA API key
    'Accept': 'application/json'
};

// Get event teams
const getEventTeams = async (eventKey) => {
    const endpoint = `/event/${eventKey}/teams/simple`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    return response.data.map(team => team.key);
};

// Get team event data
const getTeamEventData = async (teamKey, eventKey) => {
    const endpoint = `/team/${teamKey}/event/${eventKey}/matches`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    return response.data;
};

// Get team past events
const getTeamPastEvents = async (teamKey, year) => {
    const endpoint = `/team/${teamKey}/events/${year}`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    return response.data.map(event => ({ name: event.name, key: event.key }));
};

// Get team record
const getTeamRecord = async (teamKey, year) => {
    const url = `${blueAllianceBaseUrl}/team/${teamKey}/matches/${year}`;
    try {
        const response = await axios.get(url, { headers });
        const matches = response.data;
        let record = { wins: 0, losses: 0, ties: 0 };
        matches.forEach(match => {
            const allianceColor = match.alliances.red.team_keys.includes(teamKey) ? 'red' : 'blue';
            const teamScore = match.alliances[allianceColor].score;
            const opponentScore = match.alliances[allianceColor === 'red' ? 'blue' : 'red'].score;
            if (teamScore > opponentScore) {
                record.wins++;
            } else if (teamScore < opponentScore) {
                record.losses++;
            } else {
                record.ties++;
            }
        });
        return record;
    } catch (error) {
        console.error('Error getting team record:', error.message);
        return null;
    }
};

module.exports = { getEventTeams, getTeamEventData, getTeamPastEvents, getTeamRecord };
