const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(bodyParser.json());

// Get the data file path from the environment variable
const dataFile = process.env.DATA_FILE_PATH || 'data.json';

// Load data from file
let data = {};
if (fs.existsSync(dataFile)) {
    const rawData = fs.readFileSync(dataFile);
    data = JSON.parse(rawData);
}

// Function to save data to file
function saveData() {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Schedule a task to run at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Running task at midnight');
    data.toggleb = false;
    data.togglem = false;
    saveData();
});

// Save state to server
app.post('/save', (req, res) => {
    const { id, value } = req.body;
    data[id] = value;
    saveData();
    res.send({ status: 'success' });
});

// Endpoint to get saved state
app.get('/state', (req, res) => {
    res.send(data);
});

// Serve static files (e.g., your HTML and JS files)
app.use(express.static(path.join(__dirname, 'public')));

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
