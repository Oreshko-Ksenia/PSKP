const http = require('http');
const sql = require('mssql');
const fs = require('fs');

const config = {
  server: 'localhost',
  database: 'OKS',
  user: 'ksenia',
  password: '1111',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

const server = http.createServer(async (req, res) => {
  await poolConnect; 
  res.setHeader('Content-Type', 'application/json; charset=UTF-8'); 

//GET
  try {
    if (req.method === 'GET' && req.url === '/') {
      fs.readFile('14-01.html', 'utf-8', (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Ошибка чтения HTML файла' }));
        } else {
          res.setHeader('Content-Type', 'text/html; charset=UTF-8');
          res.end(data);
        }
      });
    } else if (req.method === 'GET' && req.url === '/api/faculties') {
      const result = await pool.request().query('SELECT * FROM FACULTY');
      res.end(JSON.stringify(result.recordset));
    } else if (req.method === 'GET' && req.url === '/api/pulpits') {
      const result = await pool.request().query('SELECT * FROM PULPIT');
      res.end(JSON.stringify(result.recordset));
    } else if (req.method === 'GET' && req.url === '/api/subjects') {
      const result = await pool.request().query('SELECT * FROM SUBJECT');
      res.end(JSON.stringify(result.recordset));
    } else if (req.method === 'GET' && req.url === '/api/auditoriumstypes') {
      const result = await pool.request().query('SELECT * FROM AUDITORIUM_TYPE');
      res.end(JSON.stringify(result.recordset));
    } else if (req.method === 'GET' && req.url === '/api/auditoriums') {
      const result = await pool.request().query('SELECT * FROM AUDITORIUM');
      res.end(JSON.stringify(result.recordset));
    } 

//POST
    else if (req.method === 'POST' && req.url === '/api/faculties') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const { FACULTY, FACULTY_NAME } = JSON.parse(body);
    
          if (!FACULTY || !FACULTY_NAME) {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: 'Both FACULTY and FACULTY_NAME are required' }));
            return;
          }

          await pool.request()
            .input('FACULTY', sql.VarChar, FACULTY) 
            .input('FACULTY_NAME', sql.VarChar, FACULTY_NAME)
            .query('INSERT INTO FACULTY (FACULTY, FACULTY_NAME) VALUES (@FACULTY, @FACULTY_NAME)');
          
          res.statusCode = 200;
          res.end(JSON.stringify({ message: 'Faculty added' }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Error adding faculty', error: error.message }));
        }
      });
    } else if (req.method === 'POST' && req.url === '/api/pulpits') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const { PULPIT, PULPIT_NAME, FACULTY } = JSON.parse(body);
          if (!PULPIT || !PULPIT_NAME || !FACULTY) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: 'Pulpit, Pulpit name and Faculty are required' }));
          }
          await pool.request()
            .input('PULPIT', sql.VarChar, PULPIT)
            .input('PULPIT_NAME', sql.VarChar, PULPIT_NAME)
            .input('FACULTY', sql.VarChar, FACULTY)
            .query('INSERT INTO PULPIT (PULPIT, PULPIT_NAME, FACULTY) VALUES (@PULPIT, @PULPIT_NAME, @FACULTY)');
    
          res.statusCode = 200;
          res.end(JSON.stringify({ message: 'Pulpit added' }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Error adding pulpit', error: error.message }));
        }
      });
    } else if (req.method === 'POST' && req.url === '/api/subjects') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const { SUBJECT, SUBJECT_NAME, PULPIT } = JSON.parse(body);
          if (!SUBJECT || !SUBJECT_NAME || !PULPIT) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: 'Subject, Subject name and Pulpit are required' }));
          }
          await pool.request()
            .input('SUBJECT', sql.VarChar, SUBJECT)
            .input('SUBJECT_NAME', sql.VarChar, SUBJECT_NAME)
            .input('PULPIT', sql.VarChar, PULPIT)
            .query('INSERT INTO SUBJECT (SUBJECT, SUBJECT_NAME, PULPIT) VALUES (@SUBJECT, @SUBJECT_NAME, @PULPIT)');
    
          res.statusCode = 200;
          res.end(JSON.stringify({ message: 'Subject added' }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Error adding subject', error: error.message }));
        }
      });
    } else if (req.method === 'POST' && req.url === '/api/auditoriumstypes') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const { AUDITORIUM_TYPE, AUDITORIUM_TYPENAME } = JSON.parse(body);
          if (!AUDITORIUM_TYPE || !AUDITORIUM_TYPENAME) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: 'Auditorium type and auditorium typename are required' }));
          }
          await pool.request()
            .input('AUDITORIUM_TYPE', sql.VarChar, AUDITORIUM_TYPE)
            .input('AUDITORIUM_TYPENAME', sql.VarChar, AUDITORIUM_TYPENAME)
            .query('INSERT INTO AUDITORIUM_TYPE (AUDITORIUM_TYPE, AUDITORIUM_TYPENAME) VALUES (@AUDITORIUM_TYPE, @AUDITORIUM_TYPENAME)');
    
          res.statusCode = 200;
          res.end(JSON.stringify({ message: 'Auditorium type added' }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Error adding auditorium type', error: error.message }));
        }
      });
    } else if (req.method === 'POST' && req.url === '/api/auditoriums') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const { AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE } = JSON.parse(body);
          if (!AUDITORIUM || !AUDITORIUM_NAME || !AUDITORIUM_CAPACITY || !AUDITORIUM_TYPE) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: 'All fields are required' }));
          }
          await pool.request()
            .input('AUDITORIUM', sql.VarChar, AUDITORIUM)
            .input('AUDITORIUM_NAME', sql.VarChar, AUDITORIUM_NAME)
            .input('AUDITORIUM_CAPACITY', sql.Int, AUDITORIUM_CAPACITY)
            .input('AUDITORIUM_TYPE', sql.VarChar, AUDITORIUM_TYPE)
            .query('INSERT INTO AUDITORIUM (AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE) VALUES (@AUDITORIUM, @AUDITORIUM_NAME, @AUDITORIUM_CAPACITY, @AUDITORIUM_TYPE)');
    
          res.statusCode = 200;
          res.end(JSON.stringify({ message: 'Auditorium added' }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Error adding auditorium', error: error.message }));
        }
      });
    }    

//PUT
    else if (req.method === 'PUT' && req.url === '/api/faculties') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const { FACULTY, FACULTY_NAME } = JSON.parse(body);
          await pool.request()
            .input('FACULTY', sql.VarChar, FACULTY)
            .input('FACULTY_NAME', sql.VarChar, FACULTY_NAME)
            .query('UPDATE FACULTY SET FACULTY_NAME = @FACULTY_NAME WHERE FACULTY = @FACULTY');
    
          res.statusCode = 200;
          res.end(JSON.stringify({ message: 'Faculty updated' }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Error updating faculty', error: error.message }));
        }
      });
    } else if (req.method === 'PUT' && req.url.startsWith('/api/pulpits/')) {
      const pulpitId = decodeURIComponent(req.url.split('/')[3]);
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
          try {
              const { PULPIT_NAME, FACULTY } = JSON.parse(body);
              if (!PULPIT_NAME || !FACULTY) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ error: 'Все поля обязательны' }));
              }
              const result = await pool.request()
                  .input('PULPIT', sql.VarChar, pulpitId)
                  .input('PULPIT_NAME', sql.VarChar, PULPIT_NAME)
                  .input('FACULTY', sql.VarChar, FACULTY)
                  .query('UPDATE PULPIT SET PULPIT_NAME = @PULPIT_NAME, FACULTY = @FACULTY WHERE PULPIT = @PULPIT');
              if (result.rowsAffected[0] === 0) {
                  res.statusCode = 404;
                  return res.end(JSON.stringify({ error: 'Кафедра не найдена' }));
              }
  
              res.statusCode = 200;
              res.end(JSON.stringify({ message: 'Кафедра обновлен' }));
          } catch (error) {
              console.error('Ошибка при обновлении кафедры:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Ошибка сервера при обновлении кафедры' }));
          }
      });
  } else if (req.method === 'PUT' && req.url === '/api/subjects') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const { SUBJECT, SUBJECT_NAME, PULPIT } = JSON.parse(body);
          await pool.request()
            .input('SUBJECT', sql.VarChar, SUBJECT)
            .input('SUBJECT_NAME', sql.VarChar, SUBJECT_NAME)
            .input('PULPIT', sql.VarChar, PULPIT)
            .query('UPDATE SUBJECT SET SUBJECT_NAME = @SUBJECT_NAME, PULPIT = @PULPIT WHERE SUBJECT = @SUBJECT');
    
          res.statusCode = 200;
          res.end(JSON.stringify({ message: 'Subject updated' }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Error updating subject', error: error.message }));
        }
      });
    } else if (req.method === 'PUT' && req.url === '/api/auditoriumstypes') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const { AUDITORIUM_TYPE, AUDITORIUM_TYPENAME } = JSON.parse(body);
          await pool.request()
            .input('AUDITORIUM_TYPE', sql.VarChar, AUDITORIUM_TYPE)
            .input('AUDITORIUM_TYPENAME', sql.VarChar, AUDITORIUM_TYPENAME)
            .query('UPDATE AUDITORIUM_TYPE SET AUDITORIUM_TYPENAME = @AUDITORIUM_TYPENAME WHERE AUDITORIUM_TYPE = @AUDITORIUM_TYPE');
    
          res.statusCode = 200;
          res.end(JSON.stringify({ message: 'Auditorium type updated' }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Error updating auditorium type', error: error.message }));
        }
      });
    } else if (req.method === 'PUT' && req.url === '/api/auditoriums') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const { AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE } = JSON.parse(body);
          await pool.request()
            .input('AUDITORIUM', sql.VarChar, AUDITORIUM)
            .input('AUDITORIUM_NAME', sql.VarChar, AUDITORIUM_NAME)
            .input('AUDITORIUM_CAPACITY', sql.Int, AUDITORIUM_CAPACITY)
            .input('AUDITORIUM_TYPE', sql.VarChar, AUDITORIUM_TYPE)
            .query(`
              UPDATE AUDITORIUM 
              SET AUDITORIUM_NAME = @AUDITORIUM_NAME, 
                  AUDITORIUM_CAPACITY = @AUDITORIUM_CAPACITY, 
                  AUDITORIUM_TYPE = @AUDITORIUM_TYPE 
              WHERE AUDITORIUM = @AUDITORIUM
            `);
    
          res.statusCode = 200;
          res.end(JSON.stringify({ message: 'Auditorium updated' }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Error updating auditorium', error: error.message }));
        }
      });
    }  

//DELETE
    else if (req.method === 'DELETE') {
      try {
        if (req.url.startsWith('/api/faculties/')) {
          const id = decodeURIComponent(req.url.split('/')[3]);
    
          if (!id) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Faculty code is required' }));
            return;
          }
    
          const result = await pool.request()
            .input('FACULTY_ID', sql.VarChar, id)
            .query('DELETE FROM FACULTY WHERE FACULTY = @FACULTY_ID');
    
          if (result.rowsAffected[0] === 0) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Faculty not found' }));
          } else {
            res.statusCode = 200;
            res.end(JSON.stringify({ message: `Faculty ${id} deleted` }));
          }
        } else if (req.url.startsWith('/api/pulpits/')) {
          const id = decodeURIComponent(req.url.split('/')[3]);
    
          const result = await pool.request()
            .input('PULPIT_ID', sql.VarChar, id)
            .query('DELETE FROM PULPIT WHERE PULPIT = @PULPIT_ID');
    
          if (result.rowsAffected[0] === 0) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Pulpit not found' }));
          } else {
            res.statusCode = 200;
            res.end(JSON.stringify({ message: 'Pulpit deleted' }));
          }
        }
    
        else if (req.method === 'DELETE' && req.url.startsWith('/api/subject/')) {
          const encodedId = req.url.split('/')[3];  
          const subjectId = decodeURIComponent(encodedId);
        
          const result = await pool.request()
            .input('SUBJECT', sql.VarChar, subjectId) 
            .query('DELETE FROM SUBJECT WHERE SUBJECT = @SUBJECT');
        
          if (result.rowsAffected[0] === 0) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Subject not found' }));
          } else {
            res.statusCode = 200;
            res.end(JSON.stringify({ message: 'Subject deleted' }));
          }
        } else if (req.url.startsWith('/api/auditoriumstypes/')) {
          const id = decodeURIComponent(req.url.split('/')[3]);
    
          const result = await pool.request()
            .input('AUDITORIUM_TYPE_ID', sql.VarChar, id)
            .query('DELETE FROM AUDITORIUM_TYPE WHERE AUDITORIUM_TYPE = @AUDITORIUM_TYPE_ID');
    
          if (result.rowsAffected[0] === 0) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Auditorium type not found' }));
          } else {
            res.statusCode = 200;
            res.end(JSON.stringify({ message: 'Auditorium type deleted' }));
          }
        } else if (req.url.startsWith('/api/auditoriums/')) {
          const id = decodeURIComponent(req.url.split('/')[3]);
          const result = await pool.request()
            .input('AUDITORIUM_ID', sql.VarChar, id)
            .query('DELETE FROM AUDITORIUM WHERE AUDITORIUM = @AUDITORIUM_ID');
    
          if (result.rowsAffected[0] === 0) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Auditorium not found' }));
          } else {
            res.statusCode = 200;
            res.end(JSON.stringify({ message: 'Auditorium deleted' }));
          }
        }
      } catch (error) {
        console.error('Error:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
      }
    }
    
    else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Route not found' }));
    }

  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(3000, () => {
  console.log('Server running on port http://localhost:3000/');
});
