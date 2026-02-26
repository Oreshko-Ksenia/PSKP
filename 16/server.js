const http = require('http');
const { parse } = require('url');
const { graphql, buildSchema } = require('graphql');
const sql = require('mssql');

const config = {
  server: 'KSENIA',
  port: 1433,
  database: 'OKS',
  user: 'AdminUser',
  password: 'StrongPassword123!',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const schema = buildSchema(`
    type Faculty {
      facultyId: ID!
      facultyName: String!
      pulpits: [Pulpit]!
    }
  
    type Pulpit {
      pulpitId: ID!
      pulpitName: String!
      faculty: Faculty!
      subjects: [Subject]!
      teachers: [Teacher]!
    }
  
    type Subject {
      subjectId: ID!
      subjectName: String!
      pulpit: Pulpit!
    }
  
    type Teacher {
      teacherId: ID!
      teacherName: String!
      pulpit: Pulpit!
    }
  
    input FacultyInput {
      facultyId: ID!
      facultyName: String!
    }
  
    input PulpitInput {
      pulpitId: ID!
      pulpitName: String!
      facultyId: ID!
    }
  
    input SubjectInput {
      subjectId: ID!
      subjectName: String!
      pulpitId: ID!
    }
  
    input TeacherInput {
      teacherId: ID!
      teacherName: String!
      pulpit: ID!
    }
  
    type Query {
      getFaculties(facultyId: ID): [Faculty]
      getTeachers(teacherId: ID): [Teacher]
      getTeachersByFaculty(facultyId: String!): [Teacher]
      getPulpits(pulpitId: ID): [Pulpit]
      getSubjects(subjectId: ID): [Subject]
      getSubjectsByFaculties(facultyId: String!): [Pulpit]
    }

    type Mutation {
      setFaculty(faculty: FacultyInput!): Faculty
      setTeacher(teacher: TeacherInput!): Teacher
      setPulpit(pulpit: PulpitInput!): Pulpit
      setSubject(subject: SubjectInput!): Subject
      delFaculty(facultyId: ID!): Boolean 
      delTeacher(teacherId: ID!): Boolean 
      delPulpit(pulpitId: ID!): Boolean 
      delSubject(subjectId: ID!): Boolean 
    }
  `);
  

const resolvers = {
  Query: {
    getFaculties: async (_, args) => {
      const { faculty } = args;
      try {
        const pool = await sql.connect(config);

        if (!faculty) {
          const result = await pool.request().query('SELECT * FROM FACULTY');
          return result.recordset.map((row) => ({
            facultyId: String(row.FACULTY),
            facultyName: row.FACULTY_NAME,
            pulpits: [],
          }));
        }

        const result = await pool.request()
          .input('faculty', sql.NVarChar, faculty)
          .query('SELECT * FROM FACULTY WHERE FACULTY = @faculty');

        if (result.recordset.length === 0) throw new Error(`Faculty ${faculty} not found`);

        const facultyData = result.recordset[0];
        const pulpitsResult = await pool.request()
          .input('faculty', sql.NVarChar, faculty)
          .query('SELECT * FROM PULPIT WHERE FACULTY = @faculty');

        const pulpits = pulpitsResult.recordset.map(row => ({
          pulpitId: row.PULPIT,
          pulpitName: row.PULPIT_NAME,
          faculty: {
            facultyId: facultyData.FACULTY,
            facultyName: facultyData.FACULTY_NAME,
          },
          subjects: [],
          teachers: [],
        }));

        return [{
          facultyId: facultyData.FACULTY,
          facultyName: facultyData.FACULTY_NAME,
          pulpits,
        }];
      } finally {
        sql.close();
      }
    },

    getTeachers: async (_, args) => {
      const { teacher } = args;
      try {
        const pool = await sql.connect(config);
        if (!teacher) {
          const result = await pool.request().query('SELECT * FROM TEACHER');
          return result.recordset.map(row => ({
            teacherId: row.TEACHER,
            teacherName: row.TEACHER_NAME,
            pulpit: { pulpitId: row.PULPIT },
          }));
        }

        const result = await pool.request()
          .input('teacher', sql.NVarChar, teacher)
          .query('SELECT * FROM TEACHER WHERE TEACHER = @teacher');

        return result.recordset.map(row => ({
          teacherId: row.TEACHER,
          teacherName: row.TEACHER_NAME,
          pulpit: { pulpitId: row.PULPIT },
        }));
      } finally {
        sql.close();
      }
    },

    getPulpits: async (_, args) => {
      const { pulpit } = args;
      try {
        const pool = await sql.connect(config);
        if (!pulpit) {
          const result = await pool.request().query('SELECT * FROM PULPIT');
          return result.recordset.map(row => ({
            pulpitId: row.PULPIT,
            pulpitName: row.PULPIT_NAME,
            faculty: { facultyId: row.FACULTY },
            subjects: [],
            teachers: [],
          }));
        }

        const result = await pool.request()
          .input('pulpit', sql.NVarChar, pulpit)
          .query('SELECT * FROM PULPIT WHERE PULPIT = @pulpit');

        return result.recordset.map(row => ({
          pulpitId: row.PULPIT,
          pulpitName: row.PULPIT_NAME,
          faculty: { facultyId: row.FACULTY },
          subjects: [],
          teachers: [],
        }));
      } finally {
        sql.close();
      }
    },

    getSubjects: async (_, args) => {
      const { subject } = args;
      try {
        const pool = await sql.connect(config);
        if (!subject) {
          const result = await pool.request().query('SELECT * FROM SUBJECT');
          return result.recordset.map(row => ({
            subjectId: row.SUBJECT,
            subjectName: row.SUBJECT_NAME,
            pulpit: { pulpitId: row.PULPIT },
          }));
        }

        const result = await pool.request()
          .input('subject', sql.NVarChar, subject)
          .query('SELECT * FROM SUBJECT WHERE SUBJECT = @subject');

        return result.recordset.map(row => ({
          subjectId: row.SUBJECT,
          subjectName: row.SUBJECT_NAME,
          pulpit: { pulpitId: row.PULPIT },
        }));
      } finally {
        sql.close();
      }
    },
    
    getTeachersByFaculty: async (_, { facultyId }) => {
        try {
          const pool = await sql.connect(config);
      
          const result = await pool.request()
            .input('facultyId', sql.NVarChar, facultyId)
            .query(`
              SELECT 
                t.TEACHER, 
                t.TEACHER_NAME, 
                t.PULPIT,
                p.PULPIT_NAME
              FROM TEACHER t
              JOIN PULPIT p ON t.PULPIT = p.PULPIT
              WHERE p.FACULTY = @facultyId
            `);
      
          return result.recordset.map(row => ({
            teacherId: row.TEACHER,
            teacherName: row.TEACHER_NAME,
            pulpit: {
              pulpitId: row.PULPIT,
              pulpitName: row.PULPIT_NAME
            }
          }));
        } finally {
          sql.close();
        }
      },      

      getSubjectsByFaculties: async (_, { facultyId }) => {
        try {
          const pool = await sql.connect(config);
      
          const result = await pool.request()
            .input('facultyId', sql.NVarChar, facultyId)
            .query(`
              SELECT p.PULPIT, p.PULPIT_NAME, s.SUBJECT, s.SUBJECT_NAME
              FROM PULPIT p
              LEFT JOIN SUBJECT s ON p.PULPIT = s.PULPIT
              WHERE p.FACULTY = @facultyId
            `);
      
          const pulpits = [];
          result.recordset.forEach(row => {
            let pulpit = pulpits.find(p => p.pulpitId === row.PULPIT);
            if (!pulpit) {
              pulpit = {
                pulpitId: row.PULPIT,
                pulpitName: row.PULPIT_NAME,
                subjects: [],
              };
              pulpits.push(pulpit);
            }
            if (row.SUBJECT) {
              pulpit.subjects.push({
                subjectId: row.SUBJECT,
                subjectName: row.SUBJECT_NAME,
              });
            }
          });
      
          return pulpits;
        } finally {
          sql.close();
        }
      },      
  },

  Mutation: {
    setFaculty: async (_, { faculty }) => {
      try {
        const pool = await sql.connect(config);
        await pool.request()
          .input('faculty', sql.NVarChar, faculty.facultyId) 
          .input('faculty_name', sql.NVarChar, faculty.facultyName)
          .query(`
            MERGE FACULTY AS target
            USING (SELECT @faculty AS FACULTY, @faculty_name AS FACULTY_NAME) AS source
            ON target.FACULTY = source.FACULTY
            WHEN MATCHED THEN UPDATE SET FACULTY_NAME = source.FACULTY_NAME
            WHEN NOT MATCHED THEN INSERT (FACULTY, FACULTY_NAME)
            VALUES (source.FACULTY, source.FACULTY_NAME);
          `);
    
        return {
          facultyId: faculty.facultyId,
          facultyName: faculty.facultyName,
          pulpits: [],
        };
      } finally {
        sql.close();
      }
    },

    delFaculty: async (_, { facultyId }) => {
        try {
          const pool = await sql.connect(config);
          const result = await pool.request()
            .input('facultyId', sql.NVarChar, facultyId)
            .query('SELECT * FROM FACULTY WHERE FACULTY = @facultyId');
      
          if (result.recordset.length === 0) {
            return false; 
          }
      
          await pool.request()
            .input('facultyId', sql.NVarChar, facultyId)
            .query('DELETE FROM FACULTY WHERE FACULTY = @facultyId');
        
          return true; 
        } finally {
          sql.close();
        }
      },
      

      setTeacher: async (_, { teacher }) => {
        try {
          const pool = await sql.connect(config);
      
          if (!teacher.pulpit) {
            throw new Error("Pulpit ID is required.");
          }
      
          await pool.request()
            .input('teacher', sql.NVarChar, teacher.teacherId)
            .input('teacher_name', sql.NVarChar, teacher.teacherName)
            .input('pulpit', sql.NVarChar, teacher.pulpit)
            .query(`
              MERGE TEACHER AS target
              USING (SELECT @teacher AS TEACHER, @teacher_name AS TEACHER_NAME, @pulpit AS PULPIT) AS source
              ON target.TEACHER = source.TEACHER
              WHEN MATCHED THEN UPDATE SET TEACHER_NAME = source.TEACHER_NAME, PULPIT = source.PULPIT
              WHEN NOT MATCHED THEN INSERT (TEACHER, TEACHER_NAME, PULPIT)
              VALUES (source.TEACHER, source.TEACHER_NAME, source.PULPIT);
            `);
      
          return {
            teacherId: teacher.teacherId,
            teacherName: teacher.teacherName,
            pulpit: { pulpitId: teacher.pulpit },
          };
        } finally {
          sql.close();
        }
      },

    delTeacher: async (_, { teacherId }) => {
        try {
          const pool = await sql.connect(config);
      
          const result = await pool.request()
            .input('teacherId', sql.NVarChar, teacherId)
            .query('SELECT * FROM TEACHER WHERE TEACHER = @teacherId');
      
          if (result.recordset.length === 0) {
            return false; 
          }
      
          await pool.request()
            .input('teacherId', sql.NVarChar, teacherId)
            .query('DELETE FROM TEACHER WHERE TEACHER = @teacherId');
      
          return true; 
        } finally {
          sql.close();
        }
      },
      
    setPulpit: async (_, { pulpit }) => {
      try {
        const pool = await sql.connect(config);
        await pool.request()
          .input('pulpit', sql.NVarChar, pulpit.pulpitId)
          .input('pulpit_name', sql.NVarChar, pulpit.pulpitName)
          .input('faculty', sql.NVarChar, pulpit.facultyId)
          .query(`
            MERGE PULPIT AS target
            USING (SELECT @pulpit AS PULPIT, @pulpit_name AS PULPIT_NAME, @faculty AS FACULTY) AS source
            ON target.PULPIT = source.PULPIT
            WHEN MATCHED THEN UPDATE SET PULPIT_NAME = source.PULPIT_NAME, FACULTY = source.FACULTY
            WHEN NOT MATCHED THEN INSERT (PULPIT, PULPIT_NAME, FACULTY)
            VALUES (source.PULPIT, source.PULPIT_NAME, source.FACULTY);
          `);

        return {
          pulpitId: pulpit.pulpitId,
          pulpitName: pulpit.pulpitName,
          faculty: { facultyId: pulpit.facultyId },
          subjects: [],
          teachers: [],
        };
      } finally {
        sql.close();
      }
    },

    delPulpit: async (_, { pulpitId }) => {
      try {
        const pool = await sql.connect(config);
    
        const pulpitResult = await pool.request()
          .input('pulpitId', sql.NVarChar, pulpitId)
          .query('SELECT * FROM PULPIT WHERE PULPIT = @pulpitId');
    
        if (pulpitResult.recordset.length === 0) {
          return false; 
        }
    
        const teacherResult = await pool.request()
          .input('pulpitId', sql.NVarChar, pulpitId)
          .query('SELECT * FROM TEACHER WHERE PULPIT = @pulpitId');
    
        if (teacherResult.recordset.length > 0) {
          throw new Error(`Cannot delete pulpit ${pulpitId} because it is referenced by one or more teachers.`);
        }
    
        await pool.request()
          .input('pulpitId', sql.NVarChar, pulpitId)
          .query('DELETE FROM PULPIT WHERE PULPIT = @pulpitId');
    
        return true;
      } finally {
        sql.close();
      }
    },
      

    setSubject: async (_, { subject }) => {
      try {
        const pool = await sql.connect(config);
        await pool.request()
          .input('subject', sql.NVarChar, subject.subjectId)
          .input('subject_name', sql.NVarChar, subject.subjectName)
          .input('pulpit', sql.NVarChar, subject.pulpitId)
          .query(`
            MERGE SUBJECT AS target
            USING (SELECT @subject AS SUBJECT, @subject_name AS SUBJECT_NAME, @pulpit AS PULPIT) AS source
            ON target.SUBJECT = source.SUBJECT
            WHEN MATCHED THEN UPDATE SET SUBJECT_NAME = source.SUBJECT_NAME, PULPIT = source.PULPIT
            WHEN NOT MATCHED THEN INSERT (SUBJECT, SUBJECT_NAME, PULPIT)
            VALUES (source.SUBJECT, source.SUBJECT_NAME, source.PULPIT);
          `);

        return {
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          pulpit: { pulpitId: subject.pulpitId },
        };
      } finally {
        sql.close();
      }
    },

    delSubject: async (_, { subjectId }) => {
        try {
          const pool = await sql.connect(config);
      
          const result = await pool.request()
            .input('subjectId', sql.NVarChar, subjectId)
            .query('SELECT * FROM SUBJECT WHERE SUBJECT = @subjectId');
      
          if (result.recordset.length === 0) {
            return false; 
          }
      
          await pool.request()
            .input('subjectId', sql.NVarChar, subjectId)
            .query('DELETE FROM SUBJECT WHERE SUBJECT = @subjectId');
      
          return true; 
        } finally {
          sql.close();
        }
      },
      
  },
};

const server = http.createServer(async (req, res) => {
  const { pathname } = parse(req.url);

  if (pathname === '/graphql' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const { query, variables } = JSON.parse(body);
        const result = await graphql({
          schema,
          source: query,
          rootValue: resolvers,
          variableValues: variables,
          fieldResolver: (source, args, context, info) => {
            const field = resolvers?.[info.parentType.name]?.[info.fieldName];
            if (typeof field === 'function') {
              return field(source, args, context, info);
            }
            return source?.[info.fieldName];
          }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`GraphQL Server is running on http://localhost:${PORT}/graphql`);
});
