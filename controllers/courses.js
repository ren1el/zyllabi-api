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
  try {
    const departmentParam = req.params.department.toUpperCase();
    const courseNumberParam = req.params.courseNumber.toUpperCase();
    const department = await CourseDepartment.findOne({ name: departmentParam });

    if(!department) {
      return res.status(404).json({
        error: `Department ${departmentParam} does not exist`
      });
    }

    const course = await Course.findOne({ department: department, courseNumber: courseNumberParam })
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
    
    if(!course) {
      return res.status(404).json({
        error: `Course ${departmentParam} ${courseNumberParam} does not exist`
      });
    }

    res.json(course);
  } catch(error) {
    console.log(error.message);
    res.status(400).send({ message: error.message });
  }
});

module.exports = coursesRouter;