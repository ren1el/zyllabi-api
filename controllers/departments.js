const courseDepartmentRouter = require('express').Router();
const CourseDepartment = require('../models/department');

courseDepartmentRouter.get('/', async (req, res) => {
  const savedDepartments = await CourseDepartment.find({})
    .populate({
      path: 'courses',
      select: {
        department: 0,
        syllabi: 0
      }
    });
  res.json(savedDepartments);
});

courseDepartmentRouter.post('/', async (req, res) => {
  const body = req.body;
  const documentExists = await CourseDepartment.exists({ name: body.name });

  if(documentExists) {
    res.json({ error: 'The department already exists!' });
    return;
  }
  
  const newDepartment = new CourseDepartment({
    name: body.name,
  });

  try {
    const savedDepartment = await newDepartment.save();
    res.json(savedDepartment);
  } catch(error) {
    console.log(`Error adding a department : ${error.message}`);
    res.json({ error });
  }
});

module.exports = courseDepartmentRouter;