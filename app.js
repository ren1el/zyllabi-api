const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const config = require('./utils/config');
const mongoose = require('mongoose');
const syllabiRouter = require('./controllers/syllabi');
const courseDepartmentRouter = require('./controllers/departments');
const coursesRouter = require('./controllers/courses');
const zyllabis3bucketRouter = require('./controllers/zyllabis3bucket');
const usersRouter = require('./controllers/users');

console.log('Connecting to MongoDB...');

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log(`Error connecting to MongoDB: ${error.message}`);
  });

if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  app.use(cors());
}

app.use(express.static('build'));
app.use(express.json());
app.use('/api/syllabi', syllabiRouter);
app.use('/api/departments', courseDepartmentRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/zyllabis3bucket', zyllabis3bucketRouter);
app.use('/api/user', usersRouter);
app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/build/index.html'));
});

module.exports = app;