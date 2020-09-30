const mongoose = require('mongoose');
const helper = require('./test_helper')
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const Department = require('../models/department')
const Course = require('../models/course')

beforeEach(async () => {
  await Department.deleteMany({})
  await Course.deleteMany({})

  for (let department of helper.initialDepartments) {
    let departmentObject = new Department({ name: department })
    await departmentObject.save()
  }

  for (let course of helper.initialCourses) {
    let savedDepartment = await Department.findOne({ name: course.department })
    let courseObject = new Course({ department: savedDepartment._id, courseNumber: course.courseNumber })
    await courseObject.save()
  }
})

test('courses are returned as json', async () => {
  await api
    .get('/api/courses')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('correct number of courses are returned', async () => {
  await api
    .get('/api/courses')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const coursesAtEnd = await helper.coursesInDb()
  expect(coursesAtEnd).toHaveLength(helper.initialCourses.length)
})

afterAll(() => {
  mongoose.connection.close()
})