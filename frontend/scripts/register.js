// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

// Base URL for the API
// const url = 'https://promptvisioquizbackend.onrender.com';
// const url = 'https://154.20.173.156:55699';
const url = 'http://localhost:3000';

// Check if the user is already logged in
fetch(url + '/isLoggedIn', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include',
    }).then(response => response.json())
    .then(data => {
        if(data.success){
            window.location.href = 'questionaire.html';
        }
    });

// Event listener for the registration form submission
document.getElementById('registerForm').addEventListener('submit', function (event) {
    // Prevent the form from being submitted normally
    event.preventDefault();

    // Get the username and password from the form
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // Get the message element
    const messageElement = document.getElementById('message');

    // Send a POST request to the register endpoint of the API
    fetch(url + '/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Include the username and password in the request body
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // If the registration was successful, display a success message
                messageElement.textContent = 'Registration successful!';
                // And redirect to the login page
                window.location.href = 'index.html';
            } else {
                // If the registration failed, display an error message
                messageElement.textContent = 'Registration failed.';
            }
        });
});