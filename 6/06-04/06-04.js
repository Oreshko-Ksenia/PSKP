const m0603 = require("m0603o.k");

m0603.send("Hello from 06-04!")
    .then(info => {
        console.log("Email отправлен успешно:", info.response);
    })
    .catch(err => {
        console.error("Ошибка при отправке email:", err.message);
    });
