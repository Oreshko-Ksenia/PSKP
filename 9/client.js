const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const xml2js = require('xml2js');

// Задание 1
function task1() {
  axios.get('http://localhost:3000')
    .then(response => {
      console.log(`Task 1 - Status: ${response.status}`);
      console.log(`Status Text: ${response.statusText}`);
      console.log(`Remote Server IP: ${response.request.socket.remoteAddress}`);
      console.log(`Remote Server Port: ${response.request.socket.remotePort}`);
      console.log(`Response Body: ${response.data}`);
    })
    .catch(error => {
      console.error(error);
    });
}

// Задание 2
function task2() {
  const x = 11, y = 10;
  axios.get(`http://localhost:3000/calc?x=${x}&y=${y}`)
    .then(response => {
      console.log(`Task 2 - Status: ${response.status}`);
      console.log(`Response Body: ${response.data}`);
    })
    .catch(error => {
      console.error(error);
    });
}

// Задание 3
function task3() {
  const data = { x: 60, y: 100, s: 'sum' };
  axios.post('http://localhost:3000/calc', data)
    .then(response => {
      console.log(`Task 3 - Status: ${response.status}`);
      console.log(`Response Body: ${response.data}`);
    })
    .catch(error => {
      console.error(error);
    });
}

// Задание 4
function task4() {
  const data = { x: 33, y: 98, operation: 'multiply' };
  axios.post('http://localhost:3000/json', data, { headers: { 'Content-Type': 'application/json' } })
    .then(response => {
      console.log(`Task 4 - Status: ${response.status}`);
      console.log(`Body: ${JSON.stringify(response.data)}`);
    })
    .catch(error => {
      console.error(error);
    });
}

// Задание 5
function task5() {
  const xmlData = `
  <request>
    <x>20</x>
    <y>7</y>
    <operation>sum</operation>
  </request>
  `;
  axios.post('http://localhost:3000/xml', xmlData, { headers: { 'Content-Type': 'application/xml' } })
    .then(response => {
      xml2js.parseString(response.data, (err, result) => {
        if (err) console.error(err);
        else console.log(`Task 5 - ${JSON.stringify(result)}`);
      });
    })
    .catch(error => {
      console.error(error);
    });
}

// Задание 6
function task6() {
  const form = new FormData();
  form.append('file', fs.createReadStream('MyFile.txt'));
  axios.post('http://localhost:3000/upload', form, { headers: form.getHeaders() })
    .then(response => {
      console.log(`Task 6 - Status: ${response.status}`);
      console.log(`Response Body: ${response.data}`);
    })
    .catch(error => {
      console.error(error);
    });
}

// Задание 7
function task7() {
  const form = new FormData();
  form.append('file', fs.createReadStream('MyFile.png'));
  axios.post('http://localhost:3000/upload', form, { headers: form.getHeaders() })
    .then(response => {
      console.log(`Task 7 - Status: ${response.status}`);
      console.log(`Response Body: ${response.data}`);
    })
    .catch(error => {
      console.error(error);
    });
}

// Задание 8
function task8() {
  axios.get('http://localhost:3000/download', { responseType: 'stream' })
    .then(response => {
      response.data.pipe(fs.createWriteStream('downloadedFile.txt'));
      console.log('Task 8 - File downloaded');
    })
    .catch(error => {
      console.error(error);
    });
}

task1();
task2();
task3();
task4();
task5();
task6();
task7();
task8();
