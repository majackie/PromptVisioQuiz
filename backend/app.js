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
const messageString = require('./userMessageStrings.json');
const userMessageStrings = require('./userMessageStrings.json');

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

const url = 'https://promptvisioquizfrontend.onrender.com';
// const url = 'http://127.0.0.1:5500';

// Middleware for CORS and JSON parsing
app.use(cors({
    origin: url,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Additional CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://promptvisioquizfrontend.onrender.com');
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
        return res.status(401).json({ success: false, message: messageString.tokenMissingMessage });
    }

    // Verify the token using your secret key
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: messageString.invalidTokenMessage });
        }

        // If the token is valid, set the decoded user information in the request object
        req.user = decoded;

        // Move on to the next middleware or route handler
        next();
    });
};

app.get('/jsonContent', (req, res) => {
    res.json(userMessageStrings);
  });

app.get('/admin/user_accounts', verifyToken, async (req, res) => {
    await incrementSystemDetails(req.route.path);

    console.log("received request for /admin/user_accounts")
    // Check if the role is admin
    if (req.user.role === 'admin') {
        // Query to get all user_accounts joined with user_details
        pool.query('SELECT user_accounts.id, user_accounts.username, user_accounts.role, user_details.api_count, user_details.correct, user_details.incorrect FROM user_accounts LEFT JOIN user_details ON user_accounts.id = user_details.user_id ORDER BY user_accounts.id', (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ success: false });
            } else {
                // If successful, send the joined data
                res.json({ success: true, users: result.rows });
            }
        });
    } else {
        // If the role is not admin, send failure
        res.status(403).json({ success: false });
    }
});

app.put('/admin/user_accounts/:userId/role', verifyToken, async (req, res) => {
    await incrementSystemDetails(req.route.path);

    const userIdToUpdate = req.params.userId;
    const newRole = req.body.newRole;

    // Check if the requesting user is an admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: messageString.insufficientPrivilegesMessage });
    }

    // Check if the new role is valid (either 'user' or 'admin')
    if (newRole !== 'user' && newRole !== 'admin') {
        return res.status(400).json({ success: false, message: messageString.invalidRoleMessage });
    }

    // Your logic to update the user's role in the database
    try {
        const result = await pool.query('UPDATE user_accounts SET role = $1 WHERE id = $2', [newRole, userIdToUpdate]);

        if (result.rowCount > 0) {
            res.json({ success: true, message: messageString.successfulUserRoleUpdateMessage });
        } else {
            res.status(404).json({ success: false, message: messageString.userNotFoundMessage });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: messageString.internalServerErrorMessage });
    }
});

// Route to delete a user by ID
app.delete('/admin/user_accounts/:userId', verifyToken, async (req, res) => {
    await incrementSystemDetails(req.route.path);

    const userIdToDelete = req.params.userId;

    // Check if the requesting user is an admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: messageString.insufficientPrivilegesMessage });
    }

    // Your logic to delete the user from the database
    try {
        const result = await pool.query('DELETE FROM user_accounts WHERE id = $1', [userIdToDelete]);

        if (result.rowCount > 0) {
            res.json({ success: true, message: messageString.successfulUserDeletionMessage });
        } else {
            res.status(404).json({ success: false, message: messageString.userNotFoundMessage });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: messageString.internalServerErrorMessage });
    }
});

app.get('/apiCount', verifyToken, async (req, res) => {
    try {
        const client = await pool.connect();
        // Using template string for the SQL query
        const sql = `
            SELECT user_details.api_count
            FROM user_details
            JOIN user_accounts ON user_details.id = user_accounts.id
            WHERE user_accounts.username = $1;
        `;

        // Execute the query
        const result = await client.query(sql, [req.user.username]);

        // Check if any rows were returned
        if (result.rows.length > 0) {
            const count = result.rows[0].api_count;
            // Return the api_count value
            res.json({ success: true, count: count });
        } else {
            // Handle the case when no rows are returned (username not found)
            res.status(404).send({ error: 'Username not found' });
        }
        client.release();
    } catch (error) {
        console.error('Error in /apiCount route:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to run the model
app.get('/model', verifyToken, async (req, res) => {
    await incrementSystemDetails(req.route.path);

    console.log('Received request for /model');

    if (isModelRunning) {
        res.status(429).send(messageString.modelRunningMessage);
        return;
    }

    if (req.user.role !== 'admin') {
        if (checkApiCount(req.user.username)) {
            await incrementApiCount(req.user.username);
        }
        else{
            res.status(403).send(messageString.APILimitReached);
            return;
        }
    }

      


    isModelRunning = true;
    console.log(messageString.startingModelMessage);

    try {
        // Wrap your model running code in a new Promise
        await new Promise((resolve, reject) => {
            // Your model running code here
            const generatePromise = new Promise((resolve, reject) => {
                http.get('http://154.20.173.156:778/generate', (generateRes) => {
                    resolve();
                }).on('error', (err) => {
                    reject(err);
                });
            });

            const imagePromise = new Promise((resolve, reject) => {
                http.get('http://154.20.173.156:778/image', (imageRes) => {
                    const file = fs.createWriteStream(path.join(__dirname, 'results', 'image.png'));
                    imageRes.pipe(file);
                    resolve();
                }).on('error', (err) => {
                    reject(err);
                });
            });

            const titlesPromise = new Promise((resolve, reject) => {
                http.get('http://154.20.173.156:778/titles', (titlesRes) => {
                    const file = fs.createWriteStream(path.join(__dirname, 'results', 'titles.json'));
                    titlesRes.pipe(file);
                    resolve();
                }).on('error', (err) => {
                    reject(err);
                });
            });

            // Wait for all promises to resolve before sending response
            Promise.all([generatePromise, imagePromise, titlesPromise])
                .then(() => resolve())
                .catch((err) => reject(err));
        });

        res.send(messageString.modelRunSuccess);
    } catch (error) {
        console.error(error);
        res.status(500).send(messageString.modelError);
    } finally {
        isModelRunning = false;
    }
});

app.get('/titles', verifyToken, async (req, res, next) => {
    await incrementSystemDetails(req.route.path);
    // Options for sending the file
    const options = {
        root: path.join(__dirname, 'results'),
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
        }
    };


    // const apiCount = checkApiCount(req.body.username);
    // console.log(messageString.CheckingAPICount);
    // if (apiCount > 20) {
    //     res.status(403).send(messageString.APILimitReached);
    //     return
    // }
    // else {
    //     console.log(messageString.incrementApiCount);
    

    // }
    
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
app.get('/image', verifyToken, async (req, res, next) => {
    await incrementSystemDetails(req.route.path);

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

app.get('/isLoggedIn', verifyToken, async (req, res) => {
    await incrementSystemDetails(req.route.path);

    // Send success
    res.json({ success: true });
});

app.post('/login', async (req, res) => {
    await incrementSystemDetails(req.route.path);

    const { username, password } = req.body;

    // Query to check if the password matches the one in the database and get the role
    pool.query('SELECT password = crypt($1, password) AS password_matches, role FROM user_accounts WHERE username = $2', [password, username], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ success: false });
        } else if (result.rows.length > 0 && result.rows[0].password_matches) {
            // If the password matches, generate a JWT
            const userId = result.rows[0].id; // Assuming there's an 'id' column in your user_accounts table
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

app.get('/logout', (req, res) => {
    // async await cannot log user out
    incrementSystemDetails(req.route.path);
    
    // Clear the token in the cookie
    res.cookie('token', 'clear', { httpOnly: true, secure: true, maxAge: 0, sameSite: 'None' });
    res.json({ success: true });
});

app.get('/admin', verifyToken, async (req, res) => {
    await incrementSystemDetails(req.route.path);

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
app.post('/register', async (req, res) => {
    await incrementSystemDetails(req.route.path);

    const { username, password } = req.body;
    const role = 'user'; // default role for new user_accounts

    // Query to check if the username already exists
    pool.query('SELECT * FROM user_accounts WHERE username = $1', [username], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ success: false });
        } else if (result.rows.length > 0) {
            // If the username exists, send failure
            res.json({ success: false });
        } else {
            // If the username doesn't exist, create a new user
            pool.query('INSERT INTO user_accounts (username, password, role) VALUES ($1, crypt($2, gen_salt(\'bf\')), $3) RETURNING id', [username, password, role], (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ success: false });
                } else {
                    // If the user is created successfully, create a corresponding entry in user_details
                    const userId = result.rows[0].id;
                    pool.query('INSERT INTO user_details (user_id) VALUES ($1)', [userId], (err, result) => {
                        if (err) {
                            console.error(err);
                            res.status(500).json({ success: false });
                        } else {
                            // If the user details are created successfully, send success
                            res.json({ success: true });
                        }
                    });
                }
            });
        }
    });
});

app.get('/admin/system_details', async (req, res) => {
    await incrementSystemDetails(req.route.path);

    try {
        const results = await pool.query('SELECT * FROM system_details ORDER BY id');
        res.json({ success: true, system_details: results.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: messageString.systemDetailsError });
    }
});

function checkApiCount(username) {

    try {
        // Using template string for the SQL query
        const sql = `
        SELECT user_details.api_count
        FROM user_details
        JOIN user_accounts ON user_details.id = user_accounts.id
        WHERE user_accounts.username = $1;
        `;

        // Execute the query
        const result = pool.query(sql, [username]);
        const count = result.rows[0].api_count;

        if (count > 20) {
            return false;
        }else{
            return true;
        }
        // Return the api_count value
        
    } catch (error) {
        // Handle errors
        console.error(messageString.executingQueryError, error.message);
        throw error;
    }
} 

async function incrementApiCount(username) {
    
    try {
        const client = await pool.connect();
        // Increment the api_count by 1
        const updateSql = `
        UPDATE user_details
        SET api_count = api_count + 1
        FROM user_accounts
        WHERE user_details.user_id = user_accounts.id
        AND user_accounts.username = $1;
        `;

        // Execute the update query
        await client.query(updateSql, [username]);
        // Return the updated api_count value
        client.release();
        return;
    } catch (error) {
        // Handle errors
        console.error(messageString.executingUpdateQueryError, error.message);
        throw error;
    }

 }

async function incrementSystemDetails(endpoint) {
    try {
        await pool.query(`UPDATE system_details SET requests = requests + 1 WHERE endpoint = $1`, [endpoint]);
    } catch (err) {
        console.error(err);
    }
}

// Start the server
app.listen(process.env.PORT || 3000, () => {
    console.log(messageString.serverIsRunningOnMessage + (process.env.PORT || 3000));
});