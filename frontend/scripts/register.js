// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'model.html';
}

const url = 'http://localhost:3000';

document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('message');

    fetch(url + '/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Registration was successful
                messageElement.textContent = 'Registration successful!';
                window.location.href = 'index.html';
            } else {
                // Registration failed
                messageElement.textContent = 'Registration failed.';
            }
        });
});
