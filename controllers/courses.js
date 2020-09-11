const coursesRouter = require('express').Router();
const CourseDepartment = require('../models/department');
const Course = require('../models/course');

coursesRouter.get('/', async (req, res) => {
  const savedCourses = await Course.find({})
    .populate({
      path: 'department',
      select: {
        courses: 0
      }
    })
    .populate({
      path: 'syllabi',
      select: {
        course: 0,
        courseDept: 0
      }
    });
  res.json(savedCourses);
});

coursesRouter.get('/:department/:courseNumber', async (req, res) => {
  const department = await CourseDepartment.findOne({ name: req.params.department });

  if(!department) {
    return res.status(404).json({
      error: 'Department does not exist'
    });
  }

  const course = await Course.find({ department: department, courseNumber: req.params.courseNumber });

  console.log(course);
  
  if(!course) {
    return res.status(404).json({
      error: 'Course does not exist'
    });
  }

  res.json({ hi: 'hi' });
});

coursesRouter.post('/', async (req, res) => {
  const body = req.body;
  
  const department = await CourseDepartment.findOne({ name: body.department });

  if(!department) {
    //SEND APPROPRIATE STATUS CODE
    return res.json({
      error: 'Department does not exist'
    });
  }

  const newCourse = new Course({
    department: body.department,
    courseNumber: body.courseNumber
  });

  try {
    const savedCourse = await newCourse.save();
    return res.json(savedCourse);
  } catch (error) {
    console.log(`Error adding a course : ${error.message}`);
    return res.json({ error });
  }
});

module.exports = coursesRouter;