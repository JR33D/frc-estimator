const fs = require('fs');
const path = require('path');

const loadData = async (filePath) => {
  try {
    const fullPath = path.resolve(filePath);
    const rawData = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error(`Error loading JSON from ${filePath}:`, err.message);
    return null;
  }
};

module.exports = { loadData };