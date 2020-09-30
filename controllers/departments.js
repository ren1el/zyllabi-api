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
  try {
    const body = req.body;
    const documentExists = await CourseDepartment.exists({ name: body.name.toUpperCase() });

    if(documentExists) {
      res.status(400).json({ error: 'The department already exists!' });
      return;
    }
    
    const newDepartment = new CourseDepartment({
      name: body.name.toUpperCase(),
    });

    const savedDepartment = await newDepartment.save();
    res.json(savedDepartment);
  } catch(error) {
    console.log(`Error adding a department : ${error.message}`);
    res.status(400).send({ message: error.message });
  }
});

module.exports = courseDepartmentRouter;