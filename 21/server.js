const Users = require('./users.json')
const getCredentials = (user) => {
    return Users.find((e) =>
        e.user.toUpperCase() === user.toUpperCase());
}

const verifyPassword = (pass1, pass2) => {
    return pass1 === pass2;
}
exports.getCredentials = getCredentials;
exports.verifyPassword = verifyPassword;