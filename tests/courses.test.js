const mongoose = require('mongoose');
const helper = require('./test_helper');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const Department = require('../models/department');
const Course = require('../models/course');

beforeEach(async () => {
  await Department.deleteMany({});
  await Course.deleteMany({});

  for (let department of helper.initialDepartments) {
    let departmentObject = new Department({ name: department });
    await departmentObject.save();
  }

  for (let course of helper.initialCourses) {
    let savedDepartment = await Department.findOne({ name: course.department });
    let courseObject = new Course({ department: savedDepartment._id, courseNumber: course.courseNumber });
    await courseObject.save();
  }
});

test('courses are returned as json', async () => {
  await api
    .get('/api/courses')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('can get course from department and course number', async () => {
  const response = await api
    .get('/api/courses/I&C SCI/31')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(response.body).not.toBe(null);
});

test('can get the same course even with different case', async () => {
  const response = await api
    .get('/api/courses/i&c SCi/31')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const course = { courseNumber: '31' };
  expect(response.body).toMatchObject(course);
});

test('trying to find a nonexistent department returns 404', async () => {
  await api
    .get('/api/courses/IN4MATX/41')
    .expect(404);
});

test('trying to find a nonexistent course returns 404', async () => {
  await api
    .get('/api/courses/I&C SCI/32')
    .expect(404);
});

test('correct number of courses are returned', async () => {
  await api
    .get('/api/courses')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const coursesAtEnd = await helper.coursesInDb();
  expect(coursesAtEnd).toHaveLength(helper.initialCourses.length);
});

afterAll(() => {
  mongoose.connection.close();
});