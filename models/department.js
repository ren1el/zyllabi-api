const mongoose = require('mongoose');

const courseDepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  courses: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ]
  }
});

courseDepartmentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('CourseDepartment', courseDepartmentSchema);