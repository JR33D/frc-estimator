# **FRC Estimator**

**Version:** 2.0.0  
**Author:** Jeremy Reed (FRC 103)  
**License:** MIT  
**Homepage:** [FRC Estimator on GitHub](https://github.com/JR33D/frc-estimator#readme)  
**Repository:** [frc-estimator](https://github.com/JR33D/frc-estimator.git)

## **Description**

FRC Estimator is an application designed to estimate the performance of FRC (FIRST Robotics Competition) teams based on previous event metrics. It fetches team performance data from the **Blue Alliance API** and the **Statbotics API**, calculates rankings, and assigns teams to fields for competitions.

## **Project Structure**

```
/project
  ├── index.js                # Main entry point
  ├── api/blueAlliance.js      # Fetching data from Blue Alliance API
  ├── api/statbotics.js        # Fetching data from Statbotics API
  ├── utils/recordSort.js      # Record sorting logic
  ├── utils/fieldAssignment.js # Field assignment logic
  ├── tool/ranking.js          # Ranking logic
  ├── tool/fieldAssignment.js  # Field assignment logic
```

## **Prerequisites**

- **Node.js** (v14 or higher)
- **NPM** (v6 or higher)
- **API Keys** for the following services:
  - **Blue Alliance API**: You need an API key to interact with the Blue Alliance API.
  - **Statbotics API**: You need access to Statbotics data.

### **Setting up the project**

1. Clone the repository:

   ```bash
   git clone https://github.com/JR33D/frc-estimator.git
   cd frc-estimator
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the project to store your API keys:

   ```env
   BLUE_ALLIANCE_KEY=your_blue_alliance_api_key
   ```

4. Ensure you have the **Statbotics** API key ready, though for now, the Statbotics API doesn't require an explicit key.

---

## **Usage**

The project is organized into various modules for fetching data, ranking teams, and assigning them to fields.

### **1. Ranking Tool**

This tool calculates team rankings based on past event performances.

#### **How to use the ranking tool:**

In `index.js`, import the `getEventRankingEstimate` function and pass the event key:

```javascript
require('dotenv').config();
const { getEventRankingEstimate } = require('./tool/ranking');

const eventKey = '2025cmptx'; // Example event key

getEventRankingEstimate(eventKey).then((teams) => {
    // Sort teams based on ranking points
    teams.sort((a, b) => (a.predictions.averageRankingPoints > b.predictions.averageRankingPoints) ? -1 : 0);
    // Output sorted teams with their predictions
    teams.forEach((team, index) => {
        console.log((index + 1) + ") " + team.teamKey + ": " + JSON.stringify(team.epaRating) + "\n" + JSON.stringify(team.predictions));
    });
});
```

This will display the teams sorted by their estimated ranking points.

### **2. Field Assignment Tool**

This tool assigns teams to fields based on their performance and rankings.

#### **How to use the field assignment tool:**

In `index.js`, import the `getChampFieldList` function and pass the event key:

```javascript
require('dotenv').config();
const { getChampFieldList } = require('./tool/fieldAssignment');

const eventKey = '2025cmptx'; // Example event key

getChampFieldList(eventKey).then((fieldLists) => {
    Object.keys(fieldLists).forEach(field => {
        console.log(`${field}:`, fieldLists[field].map(team => team.teamKey));
    });
});
```

This will output a list of teams assigned to each field in a round-robin fashion based on their performance.

---

## **How It Works**

### **API Calls**
- **Blue Alliance API** is used to fetch event and team data, including match results, rankings, and past performances.
- **Statbotics API** is used to retrieve EPA (Efficiency Performance Average) ratings for teams.

The system fetches data for each team, calculates various performance metrics, and assigns teams to fields based on their ranking.

---

## **Modules**

### **API Modules**

- **api/blueAlliance.js**: Functions for interacting with the Blue Alliance API.
    - `getEventTeams(eventKey)`: Fetches the list of teams participating in a specific event.
    - `getTeamEventData(teamKey, eventKey)`: Fetches match data for a specific team in an event.
    - `getTeamPastEvents(teamKey, year)`: Retrieves past events for a team.
    - `getTeamRecord(teamKey, year)`: Retrieves the win/loss/tie record for a team in a specific year.

- **api/statbotics.js**: Functions for interacting with the Statbotics API.
    - `getTeamEPARating(team)`: Fetches the EPA rating for a given team.

### **Utility Modules**

- **utils/recordSort.js**: Contains logic for sorting teams based on their win/loss/tie records.
    - `sortTeamsByRecord(teams)`: Sorts teams by their record (wins, losses, ties).

- **utils/fieldAssignment.js**: Contains logic for assigning teams to fields.
    - `assignTeamsToFields(teams)`: Assigns teams to fields based on their sorted ranking.

### **Tool Modules**

- **tool/ranking.js**: Contains the ranking logic to calculate a team's estimated performance in an event.
    - `getEventRankingEstimate(eventKey)`: Fetches event data, team performance, and estimates rankings for the event.

- **tool/fieldAssignment.js**: Contains the logic to assign teams to fields based on their ranking.
    - `getChampFieldList(eventKey)`: Fetches team data and assigns teams to fields in a round-robin fashion.

---

## **Example Output**

### **Ranking Example**

```bash
1) frc254: {"NormEPA": 10.5, "NormEPARecent": 8.2}
{
  "averageRankingPoints": 50.5,
  "EventCount": 4
}
...
```

### **Field Assignment Example**

```bash
archimedes: ['frc254', 'frc971', 'frc4414']
curie: ['frc118', 'frc148', 'frc999']
...
```

---

## **Contributing**

Feel free to fork this repository and create pull requests to contribute improvements, bug fixes, or new features. If you find any bugs or have feature requests, open an issue in the repository.

---

## **License**

This project is licensed under the MIT License.

---