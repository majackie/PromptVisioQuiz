// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

// Check if the user is already logged in
if (localStorage.getItem('isLoggedIn') === 'true') {
    // If so, redirect them to the model page
    window.location.href = 'questionaire.html';
}

// Define the base URL for the API
const url = 'https://promptvisioquiz.azurewebsites.net';

// Add an event listener for the login form submission
document.getElementById('loginForm').addEventListener('submit', function (event) {
    // Prevent the form from being submitted normally
    event.preventDefault();

    // Get the username and password from the form
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Send a POST request to the login endpoint
    fetch(url + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => {
            // If the response was not ok, throw an error
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Otherwise, return the response data as JSON
            return response.json();
        })
        .then(data => {
            // Create a new h2 element
            var h2 = document.createElement('h2');

            // If the login was successful
            if (data.success) {
                // Update the h2 text to 'Correct'
                h2.textContent = 'Correct';

                // If the login was successful, set 'isLoggedIn' to true in localStorage
                localStorage.setItem('isLoggedIn', 'true');
                if (data.role == "admin") {
                    // Set role to 'admin' in localStorage
                    localStorage.setItem('role', 'admin');
                    // Redirect admin to the admin page
                    window.location.href = 'admin.html';
                } else {
                    // Set role to 'user' in localStorage
                    localStorage.setItem('role', 'user');
                    // Redirect user to the model page
                    window.location.href = 'questionaire.html';
                }
            } else {
                // Update the h2 text to 'Incorrect'
                h2.textContent = 'Incorrect';
            }

            // Append the h2 element to the body
            document.body.appendChild(h2);
        })
        .catch((error) => {
            // If there was an error, log it to the console
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