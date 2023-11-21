// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'model.html';
}

const url = 'http://localhost:3000';

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
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'model.html';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

document.getElementById('logoutButton').addEventListener('click', function () {
    // Remove 'isLoggedIn' from localStorage
    localStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    window.location.href = 'index.html';
});