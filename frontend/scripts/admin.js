// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

// Base URL for the API
// const url = 'https://promptvisioquizbackend.onrender.com';
const url = 'http://localhost:3000';
let myJsonData;

// Check if the user is already logged in
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

// Set the button click event for navigating to the questionaire page
document.querySelector('#goToQuestionaireButton').onclick = () => window.location.href = 'questionaire.html';

// Function to get and display user_accounts in the container
function displayUsers() {
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
                const userContainer = document.getElementById('userContainer');

                // Clear previous content
                userContainer.innerHTML = '';

                // Create table
                const table = document.createElement('table');

                // Create table header
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                ['User ID', 'Username', 'Role', 'API Count'].forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Create and append rows for each user
                data.users.forEach(user => {
                    const tr = document.createElement('tr');
                    [user.id, user.username, user.role, user.api_count].forEach(item => {
                        const td = document.createElement('td');
                        td.textContent = item;
                        tr.appendChild(td);
                    });
                    table.appendChild(tr);
                });

                userContainer.appendChild(table);
            } else {
                console.error(myJsonData.failedToGetUsersMessage);
            }
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
                console.log(myJsonData.userDeletedSuccessfully);
                // Refresh the list of user_accounts after deletion
                displayUsers();
                displaySystemDetails();
            } else {
                console.error(myJsonData.userDeleteFailed);
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
                console.log(myJsonData.userRoleUpdatedSuccessfully);
                // Refresh the list of user_accounts after role update
                displayUsers();
                displaySystemDetails();
            } else {
                console.error(myJsonData.failedToUpdateUserRole);
            }
        });
});

// Function to fetch and display system details in the container
function displaySystemDetails() {
    // Make a request to get all system details
    fetch(url + '/admin/system_details', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }).then(response => response.json())
        .then(data => {
            if (data.success) {
                const systemDetailsContainer = document.getElementById('systemDetailsContainer');

                // Clear previous content
                systemDetailsContainer.innerHTML = '';

                // Create table
                const table = document.createElement('table');

                // Create table header
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                ['ID', 'Method', 'Endpoint', 'Requests'].forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Create and append rows for each detail
                data.system_details.forEach(detail => {
                    const tr = document.createElement('tr');
                    [detail.id, detail.method, detail.endpoint, detail.requests].forEach(item => {
                        const td = document.createElement('td');
                        td.textContent = item;
                        tr.appendChild(td);
                    });
                    table.appendChild(tr);
                });

                systemDetailsContainer.appendChild(table);
            } else {
                console.error(myJsonData.failedToGetSystemDetails);
            }
        });
}

// Event listener for the logout button
document.getElementById('logoutButton').addEventListener('click', function () {
    fetch(url + '/logout', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }).then(response => response.json())
        .then(data => {
        });
    window.location.href = 'index.html';
});

window.onload = () => {
    displayUsers();
    displaySystemDetails();
};