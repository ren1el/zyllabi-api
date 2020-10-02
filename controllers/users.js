const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/:id', async (req, res) => {
  try {
    const googleId = req.params.id;
    
    const user = await User.findOne({ googleId })
      .populate({
        path: 'syllabiContributed',
        select: {
          courseDept: 0
        },
        populate: {
          path: 'course',
          select: {
            syllabi: 0
          },
          populate: {
            path: 'department',
            select: {
              courses: 0
            }
          }
        }
      });

    if(!user) {
      return res.status(404);
    }

    return res.json(user);
  } catch(error) {
    console.log(`Error retrieving user : ${error.message}`);
    res.status(400).send({ message: error.message });
  }
});

module.exports = usersRouter;