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
    const button = document.querySelector('.container button');

    button.onclick = function () {
        window.location.href = 'questionaire.html';
    };
});


document.addEventListener('DOMContentLoaded', function () {
    // Set the button click event for navigating to the questionaire page
    const button = document.querySelector('.container button');
    button.onclick = function () {
        window.location.href = 'questionaire.html';
    };

    // New button click event for getting all user_accounts
    document.getElementById('getAllUsersButton').onclick = function () {
        // Make a request to get all user_accounts
        fetch(url + '/admin/user_accounts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Display the list of user_accounts
                    displayUsers(data.user_accounts);
                } else {
                    console.error('Failed to get user_accounts');
                }
            });
    };

    // Function to display user_accounts in the container
    function displayUsers(user_accounts) {
        const userContainer = document.getElementById('userContainer');

        // Clear previous content
        userContainer.innerHTML = '';

        // Create and append elements for each user
        user_accounts.forEach(user => {
            const userElement = document.createElement('div');
            userElement.innerHTML = `<p>User ID: ${user.id}, Username: ${user.username}, Role: ${user.role}</p>`;
            userContainer.appendChild(userElement);
        });
    }
    
    document.getElementById('deleteUserForm').addEventListener('submit', function (event) {
        event.preventDefault();

        // Get the user ID to delete
        const userIdToDelete = document.getElementById('userIdToDelete').value;

        // Make a request to delete the user with the specified ID
        fetch(url + '/admin/user_accounts/' + userIdToDelete, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('User deleted successfully');
                    // Refresh the list of user_accounts after deletion
                    document.getElementById('getAllUsersButton').click();
                } else {
                    console.error('Failed to delete user');
                }
            });
    });

    
        // Form submission event for updating user role
        document.getElementById('updateUserRoleForm').addEventListener('submit', function (event) {
            event.preventDefault();
    
            // Get the user ID to update
            const userIdToUpdate = document.getElementById('userIdToUpdate').value;
    
            // Get the selected role from the radio buttons
            const userRole = document.querySelector('input[name="userRole"]:checked').value;
    
            // Make a request to update the role of the user with the specified ID
            fetch(url + '/admin/user_accounts/' + userIdToUpdate + '/role', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ newRole: userRole }),
            }).then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('User role updated successfully');
                        // Refresh the list of user_accounts after role update
                        document.getElementById('getAllUsersButton').click();
                    } else {
                        console.error('Failed to update user role');
                    }
                });
        });


});