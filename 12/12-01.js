const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

const studentFilePath = path.join(__dirname, 'StudentList.json');

// Хранилище для подключенных клиентов SSE
const clients = new Set();

// Функция для отправки уведомлений всем клиентам
const sendNotification = (message) => {
    console.log(`Sending notification: ${JSON.stringify(message)}`);
    clients.forEach(client => {
        try {
            client.res.write(`data: ${JSON.stringify(message)}\n\n`);
        } catch (error) {
            console.error(`Error sending notification to client ${client.id}:`, error);
        }
    });
};

// Маршрут для подключения клиентов к SSE
app.get('/notifications', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Разрешаем доступ с любого домена

    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    clients.add(newClient);
    console.log(`Client ${clientId} connected`);

    // Отправляем клиенту начальное сообщение
    res.write(`data: ${JSON.stringify({ message: 'Connected to notifications' })}\n\n`);

    // Удаляем клиента при закрытии соединения
    req.on('close', () => {
        clients.delete(newClient);
        console.log(`Client ${clientId} disconnected`);
    });
});

// Helper function to read students
const readStudents = () => {
    const data = fs.readFileSync(studentFilePath);
    return JSON.parse(data);
};

// Helper function to write students
const writeStudents = (students) => {
    fs.writeFileSync(studentFilePath, JSON.stringify(students, null, 2));
    // Отправляем уведомление об изменении файла
    sendNotification({ message: 'StudentList.json has been updated' });
};

// GET all students
app.get('/', (req, res) => {
    const students = readStudents();
    res.json(students);
});

// GET backups
app.get('/backup', (req, res) => {
    const backups = fs.readdirSync(__dirname).filter(file => file.endsWith('_StudentList.json'));
    res.json(backups);
});

// GET student by id
app.get('/:id', (req, res) => {
    const students = readStudents();
    const student = students.find(s => s.id === parseInt(req.params.id));
    if (student) {
        res.json(student);
    } else {
        res.status(404).json({ error: 2, message: `Студент с id равным ${req.params.id} не найден` });
    }
});

// POST new student
app.post('/', (req, res) => {
    const students = readStudents();
    const newStudent = req.body;
    if (students.some(s => s.id === newStudent.id)) {
        res.status(400).json({ error: 3, message: `Студент с id равным ${newStudent.id} уже есть` });
    } else {
        students.push(newStudent);
        writeStudents(students);
        sendNotification({ message: 'Student added', student: newStudent });
        res.json(newStudent);
    }
});

// PUT update student
app.put('/', (req, res) => {
    const students = readStudents();
    const updatedStudent = req.body;
    const index = students.findIndex(s => s.id === updatedStudent.id);
    if (index !== -1) {
        students[index] = updatedStudent;
        writeStudents(students);
        sendNotification({ message: 'Student updated', student: updatedStudent });
        res.json(updatedStudent);
    } else {
        res.status(404).json({ error: 2, message: `Студент с id равным ${updatedStudent.id} не найден` });
    }
});

// DELETE student by id
app.delete('/:id', (req, res) => {
    const students = readStudents();
    const index = students.findIndex(s => s.id === parseInt(req.params.id));
    if (index !== -1) {
        const deletedStudent = students.splice(index, 1);
        writeStudents(students);
        sendNotification({ message: 'Student deleted', student: deletedStudent });
        res.json(deletedStudent);
    } else {
        res.status(404).json({ error: 2, message: `Студент с id равным ${req.params.id} не найден` });
    }
});

// POST backup
app.post('/backup', (req, res) => {
    const date = new Date();
    const backupFileName = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}_StudentList.json`;
    const backupFilePath = path.join(__dirname, backupFileName);
    setTimeout(() => {
        fs.copyFileSync(studentFilePath, backupFilePath);
        sendNotification({ message: 'Backup created', file: backupFileName });
        res.json({ message: 'Backup created', file: backupFileName });
    }, 2000);
});

// DELETE backup
app.delete('/backup/:date', (req, res) => {
    const backups = fs.readdirSync(__dirname).filter(file => file.endsWith('_StudentList.json'));
    backups.forEach(backup => {
        if (backup.startsWith(req.params.date)) {
            fs.unlinkSync(path.join(__dirname, backup));
        }
    });
    sendNotification({ message: 'Backups deleted', date: req.params.date });
    res.json({ message: 'Backups deleted' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});