const { getEventTeams, getTeamRecord } = require('../api/blueAlliance');
const { assignTeamsToFields } = require('../utilities/fieldAssignment');

// Assign teams to fields based on records
const getChampFieldList = async (eventKey) => {
    const teams = [];
    const currentYear = new Date().getFullYear();
    const teamKeys = await getEventTeams(eventKey);

    await Promise.all(teamKeys.map(async (team) => {
        const record = await getTeamRecord(team, currentYear);
        if (record) {
            teams.push({ teamKey: team, record });
        }
    }));

    return assignTeamsToFields(teams);
};

module.exports = { getChampFieldList };
