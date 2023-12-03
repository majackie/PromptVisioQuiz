// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

// Check if a valid JWT token is present and the role is 'admin'
// const token = localStorage.getItem('token');

// Base URL for the API
const url = 'https://promptvisioquizbackend.onrender.com';
// const url = 'https://154.20.173.156:55699';
// const url = 'http://localhost:3000';

fetch(url + '/admin', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include',
}).then(response => response.json())
    .then(data => {
        if (data.success) {
            // Display the admin page
            document.getElementById('adminPage').style.display = 'block';
        } else {
            // Redirect to the login page
            window.location.href = 'index.html';
        }
    });

// Set the button click event
document.addEventListener('DOMContentLoaded', function () {
    var button = document.querySelector('.container button');

    button.onclick = function () {
        window.location.href = 'questionaire.html';
    };
});


document.addEventListener('DOMContentLoaded', function () {
    // Set the button click event for navigating to the questionaire page
    var button = document.querySelector('.container button');
    button.onclick = function () {
        window.location.href = 'questionaire.html';
    };

    // New button click event for getting all users
    document.getElementById('getAllUsersButton').onclick = function () {
        // Make a request to get all users
        fetch(url + '/admin/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token, // Include your JWT token
            },
            credentials: 'include',
        }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Display the list of users
                    displayUsers(data.users);
                } else {
                    console.error('Failed to get users');
                }
            });
    };

    // Function to display users in the container
    function displayUsers(users) {
        const userContainer = document.getElementById('userContainer');

        // Clear previous content
        userContainer.innerHTML = '';

        // Create and append elements for each user
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.innerHTML = `<p>User ID: ${user.id}, Username: ${user.username}, Role: ${user.role}</p>`;
            userContainer.appendChild(userElement);
        });
    }
});