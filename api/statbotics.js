const axios = require('axios');

const statboticsBaseUrl = 'https://api.statbotics.io/v3';

// Get team EPA rating
const getTeamEPARating = async (team) => {
    const teamNumberOnly = team.split(/[^\d]+/).filter(Boolean);
    const endpoint = `/team/${teamNumberOnly}`;
    const url = `${statboticsBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers: { 'Accept': 'application/json' } });
    return {
        NormEPA: response.data.norm_epa.mean,
        NormEPARecent: response.data.norm_epa.recent
    };
};

module.exports = { getTeamEPARating };
