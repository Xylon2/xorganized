const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

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

// Save state to server
app.post('/save', (req, res) => {
    const { id, value } = req.body;
    data[id] = value;
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
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
