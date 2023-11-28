// Check if a valid JWT token is present and the role is 'admin'
const token = localStorage.getItem('token');

if (!token) {
    // If not, redirect to the login page
    window.location.href = 'index.html';
} else {
    try {
        // Decode the token to get its payload
        const decodedToken = JSON.parse(atob(token.split('.')[1]));

        // Check if the role is 'admin'
        if (decodedToken.role !== 'admin') {
            // If not, redirect to the login page
            window.location.href = 'index.html';
        }
    } catch (error) {
        // Handle invalid or expired token
        console.error('Error decoding or validating token:', error);
        // Redirect to the login page
        window.location.href = 'index.html';
    }
}

// Set the button click event
document.addEventListener('DOMContentLoaded', function () {
    var button = document.querySelector('.container button');

    button.onclick = function() {
        window.location.href = 'questionaire.html';
    };
});
