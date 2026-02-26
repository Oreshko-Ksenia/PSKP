const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
const port = 3001;

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let phoneEntries = [
  { id: '1', name: 'Пользователь1', phone: '+7 999 123-45-67' },
  { id: '2', name: 'Пользователь2', phone: '+7 987 654-32-10' }
];

app.get('/TS', (req, res) => {
  res.json(phoneEntries);
});

app.post('/TS', (req, res) => {
  const { name, phone } = req.body;

  const newId = (phoneEntries.length ? Math.max(...phoneEntries.map(e => parseInt(e.id))) + 1 : 1).toString();

  const newEntry = {
    id: newId,
    name,
    phone
  };

  phoneEntries.push(newEntry);

  res.status(201).json(newEntry); 
});

app.put('/TS', (req, res) => {
  const { id, name, phone } = req.body;

  const index = phoneEntries.findIndex(entry => entry.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Запись не найдена' });
  }

  phoneEntries[index] = { id, name, phone };
  res.json(phoneEntries[index]);
});

app.delete('/TS', (req, res) => {
  const { id } = req.query;

  const index = phoneEntries.findIndex(entry => entry.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Запись не найдена' });
  }

  phoneEntries.splice(index, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger UI доступен по адресу: http://localhost:${port}/api-docs`);
});