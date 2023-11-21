// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

const url = 'http://localhost:3000';

document.getElementById('generateButton').addEventListener('click', function () {
  fetch(url + '/model')
  .then(response => response.text())
  .then(message => {
    console.log(message);
    // If you want to display the message in your HTML, you can do so here.
    // For example, if you have a div with id 'message', you can do:
    // document.getElementById('message').textContent = message;
  })
  .catch(error => {
    console.error('Error:', error);
  });
});

document.getElementById('questionaireButton').addEventListener('click', function () {
  fetch(url + '/titles')
    .then(response => response.json())
    .then(data => {
      const br = document.createElement('br');
      const dataContainer = document.getElementById('dataContainer');
      dataContainer.innerHTML = '';

      const img = document.createElement('img');
      img.src = url + '/image';
      dataContainer.appendChild(img);
      dataContainer.appendChild(br);

      const solutionTitle = data.titles[0];

      data.titles.sort(() => Math.random() - 0.5);
      data.titles.forEach((item, index) => {
        const number = index + 1;

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'title';
        radio.value = item;
        dataContainer.appendChild(radio);

        const label = document.createElement('label');
        label.textContent = `${number}) ${item}`;
        dataContainer.appendChild(label);

        dataContainer.appendChild(br.cloneNode());
      });

      const button = document.createElement('button');
      button.textContent = 'Submit';
      dataContainer.appendChild(button);

      const result = document.createElement('h2');
      result.id = 'resultMessage';
      dataContainer.appendChild(result);

      button.addEventListener('click', function () {
        const selectedRadio = document.querySelector('input[name="title"]:checked');
        if (selectedRadio) {
          const selectedTitle = selectedRadio.value;
          const resultMessage = document.getElementById('resultMessage');
          if (selectedTitle === solutionTitle) {
            resultMessage.textContent = 'Correct!';
          } else {
            resultMessage.textContent = 'Incorrect!';
          }
        } else {
          const resultMessage = document.getElementById('resultMessage');
          resultMessage.textContent = 'Please select a title.';
        }
      });
    })
    .catch(error => console.error('Error:', error));
});