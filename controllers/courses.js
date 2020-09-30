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
  
  if(!course) {
    return res.status(404).json({
      error: 'Course does not exist'
    });
  }

  res.json(course);
});

module.exports = coursesRouter;