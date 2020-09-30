const syllabiRouter = require('express').Router();
const { OAuth2Client } = require('google-auth-library');
const config = require('../utils/config');
const Syllabus = require('../models/syllabus');
const CourseDepartment = require('../models/department');
const Course = require('../models/course');
const User = require('../models/user');

syllabiRouter.get('/', async (req, res) => {
  try {
    const savedSyllabi = await Syllabus.find({})
      .populate({
        path: 'course',
        select: {
          department: 1,
          courseNumber: 1
        },
        populate: {
          path: 'department',
          select: {
            courses: 0
          }
        }
      });

    return res.json(savedSyllabi);
  } catch(error) {
    console.log(`Error retrieving syllabi : ${error.messag}`);
    return res.status(400).send({ message: error.message });
  }
});

syllabiRouter.get('/:courseDept/:courseNumber', async (req, res) => {
  try {
    const department = req.params.courseDept.toUpperCase();
    const courseNumber = req.params.courseNumber.toUpperCase();
    const savedDepartment = await CourseDepartment.findOne({ name: department });

    if(!savedDepartment) {
      return res.status(404).send({ error: 'Department does not exist' });
    }

    const course = await Course.findOne({ 
      department: savedDepartment,
      courseNumber: courseNumber
    });

    if(!course) {
      return res.status(404).send({
        error: `No syllabus found for ${req.params.courseDept.toUpperCase()} ${courseNumber}`
      });
    }

    const savedSyllabi = await Syllabus.find({ course: course })
      .populate('courseDept', { name: 1 })
      .populate('course', { courseNumber: 1 })
      .sort({ year: -1 });

    if(savedSyllabi.length > 0) {
      return res.json(savedSyllabi);
    } else {
      return res.status(404).send({
        error: `No syllabus found for ${req.params.courseDept.toUpperCase()} ${courseNumber}`
      });
    }
  } catch(error) {
    console.log(`Error retrieving a syllabus : ${error.message}`);
    return res.json({ error });
  }
});

syllabiRouter.post('/', async (req, res) => {
  try {
    const body = req.body;

    //Verify that the ID token received is valid.
    //If invalid, the request is invalid.
    const client = new OAuth2Client(config.CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: req.headers.authorization,
      audience: config.CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];

    //Check to see if the user exists.
    //If they don't exist, add them as a new user to the database.
    let user = await User.findOne({ googleId });

    if(!user) {
      const newUser = new User({ googleId });
      await newUser.save();
      user = await User.findOne({ googleId });
    }

    //Find the department and/or course in the request.
    //If the department isn't found, it is a bad request.
    //If the course isn't found, create it and add it to the database.
    const department = await CourseDepartment.findOne({ name: body.department });
    let savedCourse = await Course.findOne({ department, courseNumber: body.courseNumber });

    if(!department) {
      return res.json({
        error: `The department ${body.department} does not exist.`
      });
    }

    if(!savedCourse) {
      const newCourse = new Course({
        department,
        courseNumber: body.courseNumber,
      });
      
      await newCourse.save();
      savedCourse = await Course.findOne({ department, courseNumber: body.courseNumber });
      department.courses = department.courses.concat(savedCourse._id);
      await department.save();
    }

    //Grab all the parameters from the request and save it as a new syllabus to the database.
    //Return the saved syllabus.

    const newSyllabus = new Syllabus({
      course: savedCourse._id,
      instructor: body.instructor,
      quarter: body.quarter,
      year: body.year,
      url: body.url,
      addedBy: googleId,
      type: body.fileType
    });

    const savedSyllabus = await newSyllabus.save();
    savedCourse.syllabi = savedCourse.syllabi.concat(savedSyllabus._id);
    await savedCourse.save();
    user.syllabiContributed = user.syllabiContributed.concat(savedSyllabus._id);
    await user.save();
    
    return res.json(savedSyllabus);
  } catch(error) {
    console.log(`Error saving a syllabus: ${error.message}`);
    res.status(400).send({ message: error.message });
  }
});

syllabiRouter.patch('/:syllabusId', async(req, res) => {
  try {
    const syllabusId = req.params.syllabusId;
    const body = req.body;

    //Verify that the ID token received is valid.
    //If invalid, the request is invalid.
    const client = new OAuth2Client(config.CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: req.headers.authorization,
      audience: config.CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];

    //Find the syllabus if it exists.
    //If it doesn't exist, it is an invalid request.
    //If the syllabus was not added by the user, it is also
    //an invalid request.
    let savedSyllabus = await Syllabus.findById(syllabusId)
      .populate({
        path: 'course',
        select: {
          department: 1,
          courseNumber: 1
        },
        populate: {
          path: 'department',
          select: {
            courses: 0
          }
        }
      });

    if(!savedSyllabus) {
      return res.status(404).send({
        error: `Syllabus with id ${syllabusId} does not exist.`
      });
    }

    if(savedSyllabus.addedBy !== googleId) {
      return res.status(401);
    }

    //Alter the syllabus to reflect changes and save.
    //Return the new syllabus to the user.
    savedSyllabus.instructor = body.instructor;
    savedSyllabus.quarter = body.quarter;
    savedSyllabus.year = body.year;
    savedSyllabus = await savedSyllabus.save();

    return res.json(savedSyllabus);
  } catch(error) {
    console.log(error.message);
    res.status(400).send({ message: error.message });
  }
});

syllabiRouter.delete('/:syllabusId', async (req, res) => {
  try {
    const syllabusId = req.params.syllabusId;

    //Verify that the ID token received is valid.
    //If invalid, the request is invalid.
    const client = new OAuth2Client(config.CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: req.headers.authorization,
      audience: config.CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];

    //Find the syllabus if it exists.
    //If it doesn't exist, it is an invalid request.
    //If the syllabus was not added by the user, it is also
    //an invalid request.
    const savedSyllabus = await Syllabus.findById(syllabusId);

    if(!savedSyllabus) {
      return res.status(404).send({
        error: `Syllabus with id ${syllabusId} does not exist.`
      });
    }

    if(savedSyllabus.addedBy !== googleId) {
      return res.status(401);
    }

    //Delete syllabus from user's contributions
    //If the user no longer has contributions after deletion, delete them from the database
    const user = await User.findOne({ googleId });
    user.syllabiContributed = user.syllabiContributed.filter((syllabus) => syllabus.toString() !== savedSyllabus._id.toString());

    if(user.syllabiContributed == 0) {
      await User.findByIdAndDelete(user._id)
    } else {
      await user.save();
    }

    //Delete the syllabus from the course
    //If the course has no syllabi after deletion, delete the course and update the department
    const savedCourse = await Course.findById(savedSyllabus.course._id);
    savedCourse.syllabi = savedCourse.syllabi.filter((syllabus) => syllabus.toString() !== savedSyllabus._id.toString());
    
    if(!savedCourse.syllabi.length) {
      const department = await CourseDepartment.findById(savedCourse.department._id);
      department.courses = department.courses.filter((course) => course.toString() !== savedCourse._id.toString());
      await department.save();
      await Course.findByIdAndDelete(savedCourse._id);
    } else {
      await savedCourse.save();
    }

    //Delete the syllabus itself
    await Syllabus.findByIdAndDelete(syllabusId);

    return res.status(200).end();
  } catch(error) {
    console.log(error.message);
    res.status(400).send({ message: error.message });
  }
});

module.exports = syllabiRouter;