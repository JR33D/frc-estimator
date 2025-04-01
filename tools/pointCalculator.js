const MAX_REGULAR_POINTS = 78;
const MAX_CHAMPIONSHIP_POINTS = MAX_REGULAR_POINTS * 3;

/**
 * Generates qualification points based on ranking.
 * @param {number} maxTeams - Total teams in the event.
 * @returns {number[]} - Qualification points per rank.
 */
const generateQualPoints = (maxTeams) => {
    return Array.from({ length: maxTeams }, (_, i) =>
        Math.max(22 - Math.floor((i * 22) / maxTeams), 2)
    );
};

/**
 * Gets qualification points based on rank.
 * @param {number} rank - Team rank.
 * @param {number[]} qualPointsTable - Precomputed qualification points.
 * @returns {number} - Qualification points.
 */
const getQualificationPoints = (rank, qualPointsTable) => 
    qualPointsTable[Math.min(rank - 1, qualPointsTable.length - 1)] || 0;

/**
 * Gets alliance selection points.
 * @param {boolean} isCaptain - Whether the team is an alliance captain.
 * @param {number} pickOrder - Pick order (1-16).
 * @returns {number} - Alliance selection points.
 */
const getAllianceSelectionPoints = (isCaptain, pickOrder) => 
    isCaptain ? 17 - pickOrder : 17 - (pickOrder + 8);

/**
 * Gets playoff points based on final placement.
 * @param {string} finalPlacement - "1st", "2nd", "3rd", "4th".
 * @param {number} finalsWins - Number of wins in finals.
 * @returns {number} - Playoff points.
 */
const getPlayoffPoints = (finalPlacement, finalsWins) => {
    const basePoints = { "1st": 20, "2nd": 20, "3rd": 13, "4th": 7 };
    return basePoints[finalPlacement] + (finalPlacement === "1st" ? 10 : (finalPlacement === "2nd" ? Math.min(finalsWins, 1) * 5 : 0));
};

/**
 * Converts pick order to a readable format.
 * @param {number} pickOrder - Pick order (1-16).
 * @returns {string} - Readable pick description.
 */
const formatPickOrder = (pickOrder) => {
    if (pickOrder <= 8) return `Captain of Alliance ${pickOrder}`;
    const allianceNumber = Math.ceil((pickOrder - 8) / 2);
    return `${pickOrder % 2 === 1 ? "1st" : "2nd"} pick of Alliance ${allianceNumber}`;
};

/**
 * Validates requested points.
 * @param {number} targetPoints - Desired points.
 * @param {boolean} isDistrictChampionship - True for championship event.
 * @throws {Error} - If points exceed allowed max.
 */
const validateMaxPoints = (targetPoints, isDistrictChampionship) => {
    const maxPoints = isDistrictChampionship ? MAX_CHAMPIONSHIP_POINTS : MAX_REGULAR_POINTS;
    if (targetPoints > maxPoints) throw new Error(`Max points for this event is ${maxPoints}.`);
};

/**
 * Determines if the team is a valid pick based on their rank.
 * Captains (ranks 1-8) can only pick from (rank +1) to maxTeams.
 * Captains cannot be selected as picks.
 * @param {number} rank - The team's rank.
 * @param {number} pickOrder - Pick order (1-16).
 * @param {number} maxTeams - Total number of teams at the event.
 * @returns {boolean} - True if the pick is valid.
 */
const isValidPick = (rank, pickOrder, maxTeams) => {
    if (pickOrder <= 8) return rank === pickOrder; // Captains must be ranked at least their alliance number

    const pickingCaptainRank = Math.ceil((pickOrder - 8) / 2);
    return rank > pickingCaptainRank && rank > 8 && rank <= maxTeams; // Captains cannot be picked
};

/**
 * Calculates total points for a given scenario.
 * @param {number} rank - Team's rank.
 * @param {boolean} isCaptain - If the team is a captain.
 * @param {number} pickOrder - Alliance selection pick order.
 * @param {string} finalPlacement - Final placement ("1st" - "4th").
 * @param {number} finalsWins - Number of wins in finals (0-2).
 * @returns {number} - Total points.
 */
const calculateTotalPoints = (rank, isCaptain, pickOrder, finalPlacement, finalsWins) => {
    const qualPointsTable = generateQualPoints(60);
    return (
        getQualificationPoints(rank, qualPointsTable) +
        getAllianceSelectionPoints(isCaptain, pickOrder) +
        getPlayoffPoints(finalPlacement, finalsWins)
    );
};

/**
 * Suggests scenarios to achieve requested points.
 * @param {number} targetPoints - Desired points.
 * @param {boolean} isDistrictChampionship - True for championship event.
 * @returns {Object|string} - Best, worst, and average case scenarios.
 */
const suggestPathsToPoints = async (targetPoints, isDistrictChampionship) => {
    validateMaxPoints(targetPoints, isDistrictChampionship);

    const adjustedTarget = isDistrictChampionship ? Math.ceil(targetPoints / 3) : targetPoints;
    const maxTeams = 60;
    const scenarios = [];

    for (let rank = 1; rank <= maxTeams; rank++) {
        for (let pickOrder = 1; pickOrder <= 16; pickOrder++) {
            if (!isValidPick(rank, pickOrder, maxTeams)) continue; // Enforce ranking and picking rules

            for (let placement of ["1st", "2nd", "3rd", "4th"]) {
                let finalsWinsArray = [];

                if (placement === "1st") {
                    finalsWinsArray = [2]; // 1st place must always have 2 wins
                } else if (placement === "2nd") {
                    finalsWinsArray = [0, 1]; // 2nd place can only have 0 or 1 wins
                } else {
                    finalsWinsArray = [0]; // 3rd & 4th place always have 0 wins (they never play in finals)
                }

                for (let finalsWins of finalsWinsArray) {
                    const isCaptain = rank <= 8 && pickOrder <= 8;
                    const points = calculateTotalPoints(rank, isCaptain, pickOrder, placement, finalsWins);
                    
                    // if (points >= adjustedTarget) {
                    if (points >= adjustedTarget && points <= adjustedTarget + 3) {
                        scenarios.push({
                            rank,
                            pickOrder: formatPickOrder(pickOrder),
                            placement,
                            finalsWins,
                            points,
                        });
                    }
                }
            }
        }
    }

    if (!scenarios.length) return "No viable path found.";

    scenarios.sort((a, b) => a.points - b.points);
    return {
        allScenarios: scenarios,
        bestCase: scenarios[scenarios.length - 1],
        worstCase: scenarios[0],
        averageCase: scenarios[Math.floor(scenarios.length / 2)],
    };
};

// Exporting functions
module.exports = {
    suggestPathsToPoints
};
