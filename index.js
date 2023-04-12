require('dotenv').config();
var axios = require('axios');

const eventKey = '2023mrcmp'; // replace with your desired event key
const teamKeys = [];//['frc103', 'frc2539', 'frc341']; // replace with your desired list of team keys

const baseUrl = 'https://www.thebluealliance.com/api/v3';
const endpoint = `/event/${eventKey}/teams/simple`;

const headers = {
    'X-TBA-Auth-Key': process.env.BLUE_ALLIANCE_KEY, // replace with your TBA API key
    'Accept': 'application/json'
};

const getTeamData = async (teamKey) => {
    const endpoint = `/team/${teamKey}/event/${eventKey}/matches/simple`;
    const url = `${baseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    return response.data;
};

const getEventData = async () => {
    const url = `${baseUrl}${endpoint}`;
    const response = await axios.get(url, { headers });
    response.data.forEach(async (team) => {
        teamKeys.push(team.key);
    });
    const teamData = await Promise.all(
        teamKeys.map(teamKey => getTeamData(teamKey))
    );
    const eventPerformance = teamData.map((data, index) => {
        const teamKey = teamKeys[index];
        const qualsMatches = data.filter((match) => match.comp_level == 'qm'); // filter to only qualifying matches
        const qualsWinRate = (qualsMatches.reduce((wins, match) => {
            if (match.winning_alliance === 'red' && match.alliances.red.team_keys.includes(teamKey)) {
                wins++;
            } else if (match.winning_alliance === 'blue' && match.alliances.blue.team_keys.includes(teamKey)) {
                wins++;
            }
            return wins;
        }, 0) / qualsMatches.length).toFixed(2);
        const finalsMatches = data.filter((match) => match.comp_level !== 'qm'); // filter out qualifying matches
        const finalsWinRate = (finalsMatches.reduce((wins, match) => {
            if (match.winning_alliance === 'red' && match.alliances.red.team_keys.includes(teamKey)) {
                wins++;
            } else if (match.winning_alliance === 'blue' && match.alliances.blue.team_keys.includes(teamKey)) {
                wins++;
            }
            return wins;
        }, 0) / finalsMatches.length).toFixed(2);
        return {
            teamKey,
            qualsWinRate,
            finalsWinRate
        };
    });
    return eventPerformance.sort((a, b) => (a.qualsWinRate > b.qualsWinRate) ? -1 : 1);
};

getEventData()
    .then(data => console.log(data))
    .catch(error => console.error(error));
