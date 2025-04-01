const { sortTeamsByNumber } = require('../utilities/sorting');

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
    console.log(`Teams: ${teams.length}`);
    teams.forEach((team, index) => {
        const fieldIndex = index % fieldNames.length; // Cycle through fields
        fieldLists[fieldNames[fieldIndex]].push(team);
    });

    sortTeamsByNumberOnField();
    return fieldLists;
};

const sortTeamsByNumberOnField = () => {
    fieldNames.forEach((field) => {
        fieldLists[field] = sortTeamsByNumber(fieldLists[field]);
    });
};

module.exports = { assignTeamsToFields };
