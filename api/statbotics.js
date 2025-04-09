const axios = require('axios');

const statboticsBaseUrl = 'https://api.statbotics.io/v3';


/**
 * Gets a teams performance at an event.
 * @param {string} teamKey - Team to get data for.
 * @returns {Object} An object with NormEpa: {number}, and NormEPARecent: {number} properties.
 */
const getTeamEPARating = async (teamKey) => {
    const teamNumberOnly = teamKey.split(/[^\d]+/).filter(Boolean);
    const endpoint = `/team/${teamNumberOnly}`;
    const url = `${statboticsBaseUrl}${endpoint}`;
    const response = await axios.get(url, { headers: { 'Accept': 'application/json' } });
    
    return {
        NormEPA: response.data.norm_epa.mean,
        NormEPARecent: response.data.norm_epa.recent
    };
};

module.exports = { getTeamEPARating };
