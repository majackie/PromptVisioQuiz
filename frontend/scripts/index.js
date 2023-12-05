// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

// Base URL for the API
// const url = 'https://promptvisioquizbackend.onrender.com';
const url = 'http://localhost:3000';
let myJsonData;

// Check if the user is already logged in
fetch(url + '/isLoggedIn', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include',
}).then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'questionaire.html';
        }
    });

    fetch(url + '/jsonContent')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        myJsonData = data;
        // Use the data as needed in your frontend
      })
      .catch(error => {
        console.error(error);
      });
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
        credentials: 'include',
        body: JSON.stringify({ username, password }),
    })
        .then(response => {
            // If the response was not ok, throw an error
            if (!response.ok) {
                throw new Error(myJsonData.loginFethErrorMessage);
            }

            return response.json();
        })
        .then(data => {
            // If the login was successful
            if (data.success) {
                // Set 'isLoggedIn' to true in localStorage
                localStorage.setItem('isLoggedIn', 'true');

                // Display logout and register buttons
                document.getElementById('logoutButton').style.display = 'block';
                document.getElementById('registerButton').style.display = 'block';

                // Redirect based on role
                if (data.role === 'admin') {
                    // Redirect admin to the admin page
                    window.location.href = 'admin.html';
                } else {
                    // Redirect user to the model page
                    window.location.href = 'questionaire.html';
                }
            } else {
                // Display an error message
                alert(myJsonData.loginFailedErrorMessage);
            }
        })
        .catch(error => {
            // If there was an error, log it to the console
            console.error('Error:', error);
        });
});

// Add an event listener for the logout button click
document.getElementById('logoutButton').addEventListener('click', function () {
    // Remove 'isLoggedIn' and 'token' from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');

    // Redirect to the login page
    window.location.href = 'index.html';
});

// Add an event listener for the register button click
document.getElementById('registerButton').addEventListener('click', function () {
    // Redirect to the register page
    window.location.href = 'register.html';
});
