// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

// Check if a valid JWT token is present and the role is 'admin'
// const token = localStorage.getItem('token');
const url = 'https://promptvisioquizbackend.onrender.com';
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

    button.onclick = function() {
        window.location.href = 'questionaire.html';
    };
});
