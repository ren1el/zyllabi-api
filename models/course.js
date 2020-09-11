const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseDepartment'
  },
  courseNumber: {
    type: String,
    required: true
  },
  syllabi: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Syllabus'
      }
    ]
  }
});

courseSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Course', courseSchema);