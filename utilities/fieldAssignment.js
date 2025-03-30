const { sortTeamsByRecord } = require('./sorting');

const fieldLists = {
    archimedes: [],
    curie: [],
    daly: [],
    galileo: [],
    hopper: [],
    johnson: [],
    milstein: [],
    newton: []
};

const fieldNames = Object.keys(fieldLists);

// Assign teams to fields based on their record
const assignTeamsToFields = (teams) => {
    sortTeamsByRecord(teams);
    teams.forEach((team, index) => {
        const fieldIndex = index % fieldNames.length; // Cycle through fields
        fieldLists[fieldNames[fieldIndex]].push(team);
    });
    return fieldLists;
};

module.exports = { assignTeamsToFields };
