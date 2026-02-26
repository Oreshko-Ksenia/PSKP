const http = require('http');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  console.error('Переменная окружения MONGODB_URI не найдена.');
  console.error('Убедитесь, что файл .env существует и содержит строку подключения.');
  process.exit(1);
}

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const client = new MongoClient(process.env.MONGODB_URI);
const PORT = process.env.PORT || 3000;

function sendResponse(res, statusCode, data) {
  if (res.headersSent) {
    console.error('Headers already sent. Skipping response.');
    return;
  }
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(null);
      }
    });
  });
}

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const db = client.db('BSTU');

  if (url === '/') {
    return sendResponse(res, 200, { message: 'BSTU Server is running!' });
  }

  if (method === 'GET' && url === '/api/faculties') {
    try {
      const faculties = await db.collection('faculty').find({}).toArray();
      return sendResponse(res, 200, faculties);
    } catch (error) {
      return sendResponse(res, 500, { message: 'Ошибка при получении факультетов' });
    }
  }

  if (method === 'POST' && url === '/api/faculties') {
    try {
      const body = await parseBody(req);
      if (!body || !body.faculty || !body.faculty_name) {
        return sendResponse(res, 400, { message: 'Поле "faculty" или "faculty_name" не указано' });
      }
      const result = await db.collection('faculty').insertOne({
        faculty: body.faculty.trim(),
        faculty_name: body.faculty_name.trim()
      });
      return sendResponse(res, 201, { id: result.insertedId, ...body });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Ошибка при добавлении факультета' });
    }
  }

  if (method === 'PUT' && url.startsWith('/api/faculties/')) {
    const id = url.split('/')[3];
    try {
      const body = await parseBody(req);
      if (!body || !body.faculty || !body.faculty_name) {
        return sendResponse(res, 400, { message: 'Поля "faculty" или "faculty_name" не указаны' });
      }
      const result = await db.collection('faculty').updateOne(
        { _id: new ObjectId(id) },
        { $set: { faculty: body.faculty, faculty_name: body.faculty_name } }
      );
      if (result.matchedCount === 0) {
        return sendResponse(res, 404, { message: 'Факультет не найден' });
      }
      return sendResponse(res, 200, { id, ...body });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Ошибка при обновлении факультета' });
    }
  }

  if (method === 'DELETE' && url.startsWith('/api/faculties/')) {
    const id = url.split('/')[3];
    try {
      const result = await db.collection('faculty').deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return sendResponse(res, 404, { message: 'Факультет не найден' });
      }
      return sendResponse(res, 200, { message: 'Факультет успешно удален' });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Ошибка при удалении факультета' });
    }
  }

  if (method === 'GET' && url === '/api/pulpits') {
    try {
      const pulpits = await db.collection('pulpit').find({}).toArray();
      return sendResponse(res, 200, pulpits);
    } catch (error) {
      return sendResponse(res, 500, { message: 'Ошибка при получении кафедр' });
    }
  }

  if (method === 'POST' && url === '/api/pulpits') {
    try {
      const body = await parseBody(req);
      if (!body || !body.pulpit || !body.pulpit_name || !body.faculty) {
        return sendResponse(res, 400, { message: 'Поля "pulpit", "pulpit_name" или "faculty" не указаны' });
      }
      const result = await db.collection('pulpit').insertOne({
        pulpit: body.pulpit.trim(),
        pulpit_name: body.pulpit_name.trim(),
        faculty: body.faculty.trim()
      });
      return sendResponse(res, 201, { id: result.insertedId, ...body });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Ошибка при добавлении кафедры' });
    }
  }

  if (method === 'PUT' && url.startsWith('/api/pulpits/')) {
    const id = url.split('/')[3];
    try {
      const body = await parseBody(req);
      if (!body || !body.pulpit || !body.pulpit_name || !body.faculty) {
        return sendResponse(res, 400, { message: 'Поля "pulpit", "pulpit_name" или "faculty" не указаны' });
      }
      const result = await db.collection('pulpit').updateOne(
        { _id: new ObjectId(id) },
        { $set: { pulpit: body.pulpit, pulpit_name: body.pulpit_name, faculty: body.faculty } }
      );
      if (result.matchedCount === 0) {
        return sendResponse(res, 404, { message: 'Кафедра не найдена' });
      }
      return sendResponse(res, 200, { id, ...body });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Ошибка при обновлении кафедры' });
    }
  }

  if (method === 'DELETE' && url.startsWith('/api/pulpits/')) {
    const id = url.split('/')[3];
    try {
      const result = await db.collection('pulpit').deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return sendResponse(res, 404, { message: 'Кафедра не найдена' });
      }
      return sendResponse(res, 200, { message: 'Кафедра успешно удалена' });
    } catch (error) {
      return sendResponse(res, 500, { message: 'Ошибка при удалении кафедры' });
    }
  }

  if (!res.headersSent) {
    sendResponse(res, 404, { message: 'Маршрут не найден' });
  }
});

connectToDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});