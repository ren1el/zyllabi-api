const mongoose = require('mongoose');
const helper = require('./test_helper');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const Department = require('../models/department')

beforeEach(async () => {
  await Department.deleteMany({})
  
  const departmentObjects = helper.initialDepartments
    .map(department => new Department({ name: department }))
  const promiseArray = departmentObjects.map(department => department.save())
  await Promise.all(promiseArray)
})

test('departments are returned as json', async () => {
  await api
    .get('/api/departments')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('can post a new department', async () => {
  await api
    .post('/api/departments')
    .send({ name: "WRITING" })
    .expect(200)
})

test('cannot post an existing department', async () => {
  await api
    .post('/api/departments')
    .send({ name: "I&C SCI" })
    .expect(400)
})

test('differing casing does not count as a new department', async () => {
  await api
    .post('/api/departments')
    .send({ name: "i&c sci" })
    .expect(400)
})

test('cannot post an empty department', async() => {
  await api
    .post('/api/departments')
    .send({ name: "" })
    .expect(400)
})

afterAll(() => {
  mongoose.connection.close()
})