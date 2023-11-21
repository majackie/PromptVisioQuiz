// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const { spawn } = require('child_process');

app.use(cors());
app.use(express.json());
let isModelRunning = false;

app.get('/model', async (req, res) => {
  if (isModelRunning) {
    res.status(429).send('Model is currently running, please try again later');
    return;
  }

  isModelRunning = true;

  try {
    const python = spawn('python', ['model.py']);

    python.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    python.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    await new Promise((resolve, reject) => {
      python.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        isModelRunning = false;
        resolve();
      });
    });

    res.send('Model finished running');
  } catch (error) {
    console.error('Error running the model:', error);
    isModelRunning = false;
    res.status(500).send('Internal Server Error');
  }
});

app.get('/titles', (req, res, next) => {
  const options = {
    root: path.join(__dirname, 'results'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  const fileName = 'titles.json';
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
});

app.get('/image', (req, res, next) => {
  const options = {
    root: path.join(__dirname, 'results'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  const fileName = 'image.png';
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
});

const pg = require('pg');
const connectionString = 'postgres://jhopzrtf:b-nf0oXf2Ric1psA4CC1i5haLzeKeLsZ@bubble.db.elephantsql.com/jhopzrtf';
const client = new pg.Client(connectionString);
client.connect();

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  client.query('SELECT password = crypt($1, password) AS password_matches FROM users WHERE username = $2', [password, username], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false });
    } else if (result.rows.length > 0 && result.rows[0].password_matches) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.PORT || 3000));
});