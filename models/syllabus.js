const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  quarter: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  addedBy: {
    type: String
  },
  type: {
    type: String,
    required: true
  }
});

syllabusSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.addedBy;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Syllabus', syllabusSchema);