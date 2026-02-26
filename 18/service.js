const fs = require("fs");

class Service {

    getIndexFile = (req, res) => {
        fs.readFile("./index.html", (err, data) => {
            if (err) {
                this.errorHandler(res, 500, "Не удалось прочитать index.html");
                return;
            }
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(data);
        });
    };

    // ============================ GET =====================================
    getHandler = (req, res, databaseFunc, parameter = null) => {
        if (parameter !== null) {
            databaseFunc(parameter)
                .then(records => {
                    if (res.headersSent) return;
                    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                    res.end(JSON.stringify(records, null, 4));
                })
                .catch(err => {
                    this.errorHandler(res, 422, err.message);
                });
        } else {
            databaseFunc()
                .then(records => {
                    if (res.headersSent) return;
                    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                    res.end(JSON.stringify(records, null, 4));
                })
                .catch(err => {
                    this.errorHandler(res, 422, err.message);
                });
        }
    }

    // ============================ POST, PUT =====================================

    workWithPulpit = (req, res, databaseFunc) => {
        let json = '';
        req.on('data', chunk => {
            json += chunk;
        });

        req.on('end', () => {
            try {
                json = JSON.parse(json);
            } catch (e) {
                this.errorHandler(res, 400, "Неверный формат JSON");
                return;
            }

            if (req.method === 'POST') {
                if (!json.PULPIT || !json.PULPIT_NAME || !json.FACULTY) {
                    this.errorHandler(res, 422, "Invalid pulpit parameters");
                    return;
                }
            }

            if (!json.PULPIT || json.PULPIT.trim() === "") {
                this.errorHandler(res, 422, "Invalid pulpit code");
                return;
            }

            databaseFunc(json.PULPIT, json.PULPIT_NAME, json.FACULTY)
                .then(() => {
                    if (!res.headersSent) {
                        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                        res.end(JSON.stringify(json, null, 4));
                    }
                })
                .catch(err => {
                    this.errorHandler(res, 422, err.message);
                });
        });
    }

    workWithSubject = (req, res, databaseFunc) => {
        let json = '';
        req.on('data', chunk => {
            json += chunk;
        });

        req.on('end', () => {
            try {
                json = JSON.parse(json);
            } catch (e) {
                this.errorHandler(res, 400, "Неверный формат JSON");
                return;
            }

            if (req.method === 'POST') {
                if (!json.SUBJECT || !json.SUBJECT_NAME || !json.PULPIT) {
                    this.errorHandler(res, 422, "Invalid subject parameters");
                    return;
                }
            }

            if (!json.SUBJECT || json.SUBJECT.trim() === "") {
                this.errorHandler(res, 422, "Invalid subject code");
                return;
            }

            databaseFunc(json.SUBJECT, json.SUBJECT_NAME, json.PULPIT)
                .then(() => {
                    if (!res.headersSent) {
                        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                        res.end(JSON.stringify(json, null, 4));
                    }
                })
                .catch(err => {
                    this.errorHandler(res, 422, err.message);
                });
        });
    }

    workWithTeacher = (req, res, databaseFunc) => {
        let json = '';
        req.on('data', chunk => {
            json += chunk;
        });

        req.on('end', () => {
            try {
                json = JSON.parse(json);
            } catch (e) {
                this.errorHandler(res, 400, "Неверный формат JSON");
                return;
            }

            if (req.method === 'POST') {
                if (!json.TEACHER || !json.TEACHER_NAME || !json.PULPIT) {
                    this.errorHandler(res, 422, "Invalid teacher parameters");
                    return;
                }
            }

            if (!json.TEACHER || json.TEACHER.trim() === "") {
                this.errorHandler(res, 422, "Invalid teacher code");
                return;
            }

            databaseFunc(json.TEACHER, json.TEACHER_NAME, json.PULPIT)
                .then(() => {
                    if (!res.headersSent) {
                        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                        res.end(JSON.stringify(json, null, 4));
                    }
                })
                .catch(err => {
                    this.errorHandler(res, 422, err.message);
                });
        });
    }

    workWithAuditoriumType = (req, res, databaseFunc) => {
        let json = '';
        req.on('data', chunk => {
            json += chunk;
        });

        req.on('end', () => {
            try {
                json = JSON.parse(json);
            } catch (e) {
                this.errorHandler(res, 400, "Неверный формат JSON");
                return;
            }

            if (req.method === 'POST') {
                if (!json.AUDITORIUM_TYPE || !json.AUDITORIUM_TYPENAME) {
                    this.errorHandler(res, 422, "Invalid auditorium type parameters");
                    return;
                }
            }

            if (!json.AUDITORIUM_TYPE || json.AUDITORIUM_TYPE.trim() === "") {
                this.errorHandler(res, 422, "Invalid auditorium type code");
                return;
            }

            databaseFunc(json.AUDITORIUM_TYPE, json.AUDITORIUM_TYPENAME)
                .then(() => {
                    if (!res.headersSent) {
                        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                        res.end(JSON.stringify(json, null, 4));
                    }
                })
                .catch(err => {
                    this.errorHandler(res, 422, err.message);
                });
        });
    }

    workWithAuditorium = (req, res, databaseFunc) => {
        let json = '';
        req.on('data', chunk => {
            json += chunk;
        });

        req.on('end', () => {
            try {
                json = JSON.parse(json);
            } catch (e) {
                this.errorHandler(res, 400, "Неверный формат JSON");
                return;
            }

            if (req.method === 'POST') {
                if (!json.AUDITORIUM || !json.AUDITORIUM_NAME || !json.AUDITORIUM_CAPACITY || !json.AUDITORIUM_TYPE) {
                    this.errorHandler(res, 422, "Invalid auditorium parameters");
                    return;
                }
            }

            if (!json.AUDITORIUM || json.AUDITORIUM.trim() === "" ||
                isNaN(parseInt(json.AUDITORIUM_CAPACITY)) || !json.AUDITORIUM_TYPE || json.AUDITORIUM_TYPE.trim() === "") {
                this.errorHandler(res, 422, "Invalid auditorium parameters");
                return;
            }

            const capacity = parseInt(json.AUDITORIUM_CAPACITY);

            databaseFunc(json.AUDITORIUM, json.AUDITORIUM_NAME, capacity, json.AUDITORIUM_TYPE)
                .then(() => {
                    if (!res.headersSent) {
                        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                        res.end(JSON.stringify(json, null, 4));
                    }
                })
                .catch(err => {
                    this.errorHandler(res, 422, err.message);
                });
        });
    }

    workWithFaculty = (req, res, databaseFunc) => {
        let json = '';
        req.on('data', chunk => {
            json += chunk;
        });

        req.on('end', () => {
            try {
                json = JSON.parse(json);
            } catch (e) {
                this.errorHandler(res, 400, "Неверный формат JSON");
                return;
            }

            if (!json.FACULTY || !json.FACULTY_NAME) {
                this.errorHandler(res, 422, "Invalid faculty parameters");
                return;
            }

            databaseFunc(json.FACULTY, json.FACULTY_NAME)
                .then(() => {
                    if (!res.headersSent) {
                        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                        res.end(JSON.stringify(json, null, 4));
                    }
                })
                .catch(err => {
                    this.errorHandler(res, 422, err.message);
                });
        });
    }

    // ============================ DELETE =====================================

    deleteHandler = (req, res, databaseFunc, param) => {
        if (!param) {
            this.errorHandler(res, 400, "Invalid parameter");
            return;
        }

        databaseFunc(param)
            .then(() => {
                if (!res.headersSent) {
                    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                    res.end(JSON.stringify({ key: param }, null, 4));
                }
            })
            .catch(err => {
                this.errorHandler(res, 422, err.message);
            });
    }

    errorHandler = (res, errorCode, errorMessage) => {
        if (res.headersSent) {
            console.warn(`Headers уже отправлены. Ошибка: ${errorMessage}`);
            return;
        }

        res.writeHead(errorCode, 'Error while processing the request', {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify({ errorCode, errorMessage }, null, 4));
    }

}

exports.Service = Service;