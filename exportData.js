// exportTeamsData.js
const fs = require('fs');

// Read the data from the JSON file
const rawData = fs.readFileSync('./data.json');
const teamsData = JSON.parse(rawData);

// Export the teamsData array
module.exports = teamsData;
