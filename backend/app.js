// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

// Import necessary modules
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const { spawn } = require('child_process');
const pg = require('pg');
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const secretKey = 'your_secret_key';

// Set up PostgreSQL connection
const pool = new pg.Pool({
    user: 'jhopzrtf',
    host: 'bubble.db.elephantsql.com',
    database: 'jhopzrtf',
    password: 'b-nf0oXf2Ric1psA4CC1i5haLzeKeLsZ',
    port: 5432,
});

// Flag to check if model is running
let isModelRunning = false;

// Middleware for CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    console.log('Received token:', token);

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }

        req.decoded = decoded;
        next();
    });
};



// Route to run the model
app.get('/model', (req, res) => {
    const rawCookies = req.headers.cookie || '';

    // Parse the cookie header to get individual cookies
    const cookies = rawCookies.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    const token = cookies['token']; // Replace 'token' with the actual name of your token

    // Verify the token
    jwt.verify(token, 'your_secret_key', async (err, decoded) => {
        if (err) {
            // Token verification failed
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }

        // Token verification successful
        console.log('Decoded Token:', decoded);

        // Check if model is already running
        if (isModelRunning) {
            res.status(429).send('Model is currently running, please try again later');
            return;
        }

        isModelRunning = true;

        try {
            // Spawn a child process to run the Python script
            const python = spawn('python', ['model_local.py']);

            // Log stdout and stderr from the Python script
            python.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });
            python.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            // Wait for the Python script to finish
            await new Promise((resolve, reject) => {
                python.on('close', (code) => {
                    console.log(`child process exited with code ${code}`);
                    isModelRunning = false;
                    resolve();
                });
            });

            // Send response when the model finishes running
            res.send('Model finished running');
        } catch (error) {
            // Handle errors
            console.error('Error running the model:', error);
            isModelRunning = false;
            res.status(500).send('Internal Server Error');
        }
    });
});

app.get('/titles', (req, res, next) => {
    const rawCookies = req.headers.cookie || '';

    // Parse the cookie header to get individual cookies
    const cookies = rawCookies.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    const token = cookies['token']; // Replace 'token' with the name of your token

    // Verify the token
    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            // Token verification failed
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }

        // Token verification successful
        console.log('Decoded Token:', decoded);

        // Options for sending the file
        const options = {
            root: path.join(__dirname, 'results'),
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true,
            }
        };

        const fileName = 'titles.json';
        // Send the file
        res.sendFile(fileName, options, function (err) {
            if (err) {
                next(err);
            } else {
                console.log('Sent:', fileName);
            }
        });
    });
});


// Route to get image
app.get('/image', (req, res, next) => {
    const rawCookies = req.headers.cookie || '';

    // Parse the cookie header to get individual cookies
    const cookies = rawCookies.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    const token = cookies['token']; // Replace 'token' with the actual name of your token

    // Verify the token
    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            // Token verification failed
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }

        // Token verification successful
        console.log('Decoded Token:', decoded);

        // Continue with your logic here...

        // Options for sending the file
        const options = {
            root: path.join(__dirname, 'results'),
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true,
            }
        };

        const fileName = 'image.png';
        // Send the file
        res.sendFile(fileName, options, function (err) {
            if (err) {
                next(err);
            } else {
                console.log('Sent:', fileName);
            }
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query to check if the password matches the one in the database and get the role
    pool.query('SELECT password = crypt($1, password) AS password_matches, role FROM users WHERE username = $2', [password, username], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ success: false });
        } else if (result.rows.length > 0 && result.rows[0].password_matches) {
            // If the password matches, generate a JWT
            const userId = result.rows[0].id; // Assuming there's an 'id' column in your users table
            const userRole = result.rows[0].role;

            const token = jwt.sign({ userId, username, role: userRole }, 'your_secret_key', { expiresIn: '1h' });

            // Set the token in an HTTP-only cookie
            res.cookie('token', token, { httpOnly: true });

            // Send success and the role
            res.json({ success: true, role: userRole });
        } else {
            // If the password doesn't match, send failure
            res.status(401).json({ success: false });
        }
    });
});

// Route for registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const role = 'user'; // default role for new users
    const correct = 0; // default correct for new users
    const incorrect = 0; // default incorrect for new users

    // Query to check if the username already exists
    pool.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ success: false });
        } else if (result.rows.length > 0) {
            // If the username exists, send failure
            res.json({ success: false });
        } else {
            // If the username doesn't exist, create a new user
            pool.query('INSERT INTO users (username, password, role, correct, incorrect) VALUES ($1, crypt($2, gen_salt(\'bf\')), $3, $4, $5)', [username, password, role, correct, incorrect], (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ success: false });
                } else {
                    // If the user is created successfully, send success
                    res.json({ success: true });
                }
            });
        }
    });
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port ' + (process.env.PORT || 3000));
});