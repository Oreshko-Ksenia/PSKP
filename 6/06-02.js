const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru', 
    port: 465,
    secure: true, 
    auth: {
        user: 'oreshko_2004@mail.ru', 
        pass: '7nFzwRezWx6zRXTxJqtH',
    },
});

app.get('/', (req, res) => {
    res.send(`
        <form method="POST" action="/send">
            <label>Sender Email:</label><br>
            <input type="email" name="sender" required><br>
            <label>Receiver Email:</label><br>
            <input type="email" name="receiver" required><br>
            <label>Message:</label><br>
            <textarea name="message" required></textarea><br>
            <button type="submit">Send Email</button>
        </form>
    `);
});


app.post('/send', (req, res) => {
    const { sender, receiver, message } = req.body;

    const mailOptions = {
        from: sender,
        to: receiver,
        subject: 'Сообщение от Sendmail',
        html: `<p>${message}</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            return res.send('Error occurred: ' + err.message);
        }
        res.send('Email sent successfully: ' + info.response);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
