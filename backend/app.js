// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

// Import necessary modules
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const { spawn } = require('child_process');
const pg = require('pg');
const https = require('https');
const http = require('http');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const secretKey = 'your_secret_key';
// Flag to check if model is running
let isModelRunning = false;

// Set up PostgreSQL connection
const pool = new pg.Pool({
    user: 'jhopzrtf',
    host: 'bubble.db.elephantsql.com',
    database: 'jhopzrtf',
    password: 'b-nf0oXf2Ric1psA4CC1i5haLzeKeLsZ',
    port: 5432,
});

// Middleware for CORS and JSON parsing
app.use(cors({
    origin: 'https://promptvisioquizfrontend.onrender.com',
    // origin: 'http://127.0.0.1:5500',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://promptvisioquizfrontend.onrender.com');
    // res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(express.json());
app.use(cookieParser());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    // Get the raw cookie string from the request headers
    const rawCookies = req.headers.cookie || '';
    // Parse the raw cookie string into an object
    const cookies = rawCookies.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    // Extract the token from the cookies
    const token = cookies['token'];

    // Check if the token is missing
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Token missing' });
    }

    // Verify the token using your secret key
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Forbidden: Invalid token' });
        }

        // If the token is valid, set the decoded user information in the request object
        req.user = decoded;

        // Move on to the next middleware or route handler
        next();
    });
};

// Route to run the model
app.get('/model', verifyToken, async (req, res) => {
    // Check if model is already running
    if (isModelRunning) {
        res.status(429).send('Model is currently running, please try again later');
        return;
    }

    isModelRunning = true;

    try {
        // Call the generate endpoint
        http.get('http://154.20.173.156:778/generate', (generateRes) => {
            // Get the image and titles concurrently
            http.get('http://154.20.173.156:778/image', (imageRes) => {
                const file = fs.createWriteStream(path.join(__dirname, 'results', 'image.png'));
                imageRes.pipe(file);
            });

            http.get('http://154.20.173.156:778/titles', (titlesRes) => {
                const file = fs.createWriteStream(path.join(__dirname, 'results', 'titles.json'));
                titlesRes.pipe(file);
            });

            res.send('Model run successfully');
            isModelRunning = false;
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    } finally {
        isModelRunning = false;
    }
});


app.get('/titles', verifyToken, (req, res, next) => {
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

// Route to get image
app.get('/image', verifyToken, (req, res, next) => {
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

            const token = jwt.sign({ userId, username, role: userRole }, secretKey, { expiresIn: '1h' });

            // Set the token in an HTTP-only cookie
            res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000, sameSite: 'None' });
            // res.send();
            // Send success and the role
            res.json({ success: true, role: userRole });
            // res.send('logged in');
        } else {
            // If the password doesn't match, send failure
            res.status(401).json({ success: false });
        }
    });
});

app.get('/admin', verifyToken, (req, res) => {
    // Check if the role is admin
    if (req.user.role === 'admin') {
        // If the role is admin, send success
        res.json({ success: true });
    } else {
        // If the role is not admin, send failure
        res.status(403).json({ success: false });
    }
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