// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

// Check if the user is already logged in

const token = localStorage.getItem('token');

if (token) {
    try {
        // Decode the token to get its payload
        const decodedToken = JSON.parse(atob(token.split('.')[1]));

        // Check if the token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
            // If not expired, redirect to the model page
            window.location.href = 'questionaire.html';
        } else {
            // If expired, remove the token from localStorage
            localStorage.removeItem('token');
        }
    } catch (error) {
        // Handle invalid or expired token
        console.error('Error decoding or validating token:', error);
        localStorage.removeItem('token');
    }
}

// Base URL for the API
// const url = 'https://promptvisioquiz.onrender.com';
const url = 'https://154.20.173.156:55699';

// Add an event listener for the login form submission
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch(url + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        var h2 = document.createElement('h2');

        if (data.success) {
            h2.textContent = 'Correct';

            // Save the JWT token in local storage
            localStorage.setItem('token', data.token);

            // Redirect based on user role
            if (data.role === 'admin') {
                localStorage.setItem('role', 'admin');
                window.location.href = 'admin.html';
            } else {
                localStorage.setItem('role', 'user');
                window.location.href = 'questionaire.html';
            }
        } else {
            h2.textContent = 'Incorrect';
        }

        document.body.appendChild(h2);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// Add an event listener for the logout button click
document.getElementById('logoutButton').addEventListener('click', function () {
    // Remove 'isLoggedIn' from localStorage
    localStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    window.location.href = 'index.html';
});

// Add an event listener for the register button click
document.getElementById('registerButton').addEventListener('click', function (event) {
    // Prevent the button from doing its default action
    event.preventDefault();
    // Redirect to the register page
    window.location.href = 'register.html';
});