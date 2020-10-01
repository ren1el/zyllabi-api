const Course = require('../models/course');

const initialDepartments = [
  'I&C SCI',
  'ART',
  'MATH'
];

const initialCourses = [
  {
    department: initialDepartments[0],
    courseNumber: '31',
  },
  {
    department: initialDepartments[1],
    courseNumber: '8'
  },
  {
    department: initialDepartments[2],
    courseNumber: '2A'
  }
];

const coursesInDb = async () => {
  const courses = await Course.find({});
  return courses.map(course => course.toJSON());
};

module.exports = {
  initialDepartments, initialCourses, coursesInDb
};