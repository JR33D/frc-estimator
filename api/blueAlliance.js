const axios = require('axios');

const blueAllianceBaseUrl = 'https://www.thebluealliance.com/api/v3';
const headers = {
    'X-TBA-Auth-Key': process.env.BLUE_ALLIANCE_KEY,  // Replace with your TBA API key
    'Accept': 'application/json'
};



/**
 * Gets a teams performance at an event.
 * @param {string} teamKey - Team to get data for.
 * @param {number} year - year to get team events.
 * @returns {Object} - A list of events ["{year}{eventCode}", "2025paben", 2025cmptx"].
 */
const getTeamPastEvents = async (teamKey, year) => {
    const endpoint = `/team/${teamKey}/events/${year}`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    const ignoreEvents = [ "2025micmp", "2025txcmp", "2025necmp","2025oncmp", "2025pncmp" ]
    const currentDate = `${new Date().toISOString().split("T")[0]}`;
    let events = [];
    response.data.forEach((event) => {
        if(!ignoreEvents.includes(event.key) && event.week > 0) {
            if(event.end_date < currentDate) {
                events.push(event.key); 
            }
        }
    });
    return events;
};


/**
 * Get the list of teams at an event.
 * @param {string} eventKey - Event to get teams for.
 * @returns {string[]} - list of teams ["frc###", "frc###"].
 */
const getEventTeams = async (eventKey) => {
    const endpoint = `/event/${eventKey}/teams/keys`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    return response.data;
};


/**
 * Gets a teams performance at an event.
 * @param {string} teamKey - Team to get data for.
 * @param {string} eventKey - Event to get team data for.
 * @returns {Object} - An object with totalRankingPoints: {number}, and Record: {wins, losses, ties} properties.
 */
const getTeamEventData = async (teamKey, eventKey) => {
    const endpoint = `/event/${eventKey}/rankings`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    if(response.data.rankings) {
        // Find the team object
        const team = response.data.rankings.find(r => r.team_key === teamKey);
        // console.log(`Team: ${teamKey}, Event: ${eventKey}: ${JSON.stringify(team, null, 2)}`);
        return {
            totalRankingPoints: team.extra_stats[0],  // First value in extra_stats array
            record: { ...team.record }  // Spread to copy wins, losses, ties
        };
    } else {
        return{
            totalRankingPoints: 0,  // First value in extra_stats array
            record: { wins: 0, losses: 0, ties: 0 }  // Spread to copy wins, losses, ties
        };
    }
};


/**
 * Gets all of the events for a specified year
 * @param {number} year - year to get events.
 *  @returns {string[]} - list of eventKeys {year}{eventCode}
 */
const getYearEvents = async (year) => {
    const endpoint = `/events/${year}/keys`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    return response.data;
};


/**
 * Gets insights about event
 * @param {string} eventKey - event to get insights.
 *  @returns {Object} - returns an object with qual and playoff insights
 */
const getEventInsights = async (eventKey) => {
    const endpoint = `/event/${eventKey}/insights`;
    const url = `${blueAllianceBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    return response.data;
}

module.exports = { getTeamPastEvents, getEventTeams, getTeamEventData, getYearEvents, getEventInsights };
