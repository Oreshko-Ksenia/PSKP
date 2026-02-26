const nodemailer = require("nodemailer");

const RECEIVER_EMAIL = "oreshko_2004@mail.ru"; 

const transporter = nodemailer.createTransport({
    host: "smtp.mail.ru",
    port: 465,
    secure: true,
    auth: {
        user: "oreshko_2004@mail.ru", 
        pass: "7nFzwRezWx6zRXTxJqtH" 
    }
});

function send(message) {
    return new Promise((resolve, reject) => {
        transporter.sendMail({
            from: '"Ксения" <oreshko_2004@mail.ru>', 
            to: RECEIVER_EMAIL,                  
            subject: "Сообщение от функции send",
            text: message                   
        }, (err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
}

module.exports = { send };
