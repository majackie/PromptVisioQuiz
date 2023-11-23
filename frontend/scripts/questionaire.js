// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

// Check if the user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    // If not, redirect to the login page
    window.location.href = 'index.html';
}

// Base URL for the API
const url = 'https://promptvisioquiz.azurewebsites.net';

// Event listener for the generate button
document.getElementById('generateButton').addEventListener('click', function () {
    // Fetch the model from the API
    fetch(url + '/model')
        .then(response => response.text())
        .then(message => {
            // Log the response message
            console.log(message);
        })
        .catch(error => {
            // Log any errors
            console.error('Error:', error);
        });
});

// Event listener for the questionnaire button
document.getElementById('questionaireButton').addEventListener('click', function () {
    // Fetch the titles from the API
    fetch(url + '/titles')
        .then(response => response.json())
        .then(data => {
            // Create a line break element
            const br = document.createElement('br');
            // Get the data container element
            const dataContainer = document.getElementById('dataContainer');
            // Clear the data container
            dataContainer.innerHTML = '';

            // Create an image element
            const img = document.createElement('img');
            // Set the source of the image
            img.src = url + '/image';
            // Append the image and a line break to the data container
            dataContainer.appendChild(img);
            dataContainer.appendChild(br);

            // Get the solution title
            const solutionTitle = data.titles[0];

            // Randomly sort the titles
            data.titles.sort(() => Math.random() - 0.5);
            // For each title
            data.titles.forEach((item, index) => {
                // Get the number of the title
                const number = index + 1;

                // Create a radio button for the title
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'title';
                radio.value = item;
                // Append the radio button to the data container
                dataContainer.appendChild(radio);

                // Create a label for the title
                const label = document.createElement('label');
                label.textContent = `${number}) ${item}`;
                // Append the label to the data container
                dataContainer.appendChild(label);

                // Append a line break to the data container
                dataContainer.appendChild(br.cloneNode());
            });

            // Create a submit button
            const button = document.createElement('button');
            button.textContent = 'Submit';
            // Append the button to the data container
            dataContainer.appendChild(button);

            // Create a result message element
            const result = document.createElement('h2');
            result.id = 'resultMessage';
            // Append the result message to the data container
            dataContainer.appendChild(result);

            // Event listener for the submit button
            button.addEventListener('click', function () {
                // Get the selected radio button
                const selectedRadio = document.querySelector('input[name="title"]:checked');
                if (selectedRadio) {
                    // Get the selected title
                    const selectedTitle = selectedRadio.value;
                    // Get the result message element
                    const resultMessage = document.getElementById('resultMessage');
                    // If the selected title is the solution title
                    if (selectedTitle === solutionTitle) {
                        // Set the result message to 'Correct!'
                        resultMessage.textContent = 'Correct!';
                    } else {
                        // Otherwise, set the result message to 'Incorrect!'
                        resultMessage.textContent = 'Incorrect!';
                    }
                } else {
                    // If no title is selected, set the result message to 'Please select a title.'
                    const resultMessage = document.getElementById('resultMessage');
                    resultMessage.textContent = 'Please select a title.';
                }
            });
        })
        .catch(error => {
            // Log any errors
            console.error('Error:', error);
        });
});

// Event listener for the logout button
document.getElementById('logoutButton').addEventListener('click', function () {
    // Remove the 'isLoggedIn' item from local storage
    localStorage.removeItem('isLoggedIn');
    // Redirect to the login page
    window.location.href = 'index.html';
});