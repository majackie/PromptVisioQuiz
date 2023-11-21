// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

app.use(cors());

let isModelRunning = false;

app.get('/model', (req, res) => {
  if (isModelRunning) {
    res.status(429).send('Model is currently running, please try again later');
    return;
  }

  isModelRunning = true;

  const python = spawn('python', ['model.py']);

  python.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  python.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    isModelRunning = false;
    res.send('Model finished running');
  });
});

app.get('/data', (req, res) => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file from disk:', err);
      res.status(500).send('Error reading file');
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch(e) {
      console.error('Error parsing JSON string:', e);
      res.status(500).send('Error parsing JSON string');
    }
  });
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.PORT || 3000));
});