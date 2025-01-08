const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  batch: { type: String, required:true },
  batchStartDate: { type: Date, required: true },
  topicsCovered: { type: [String], required: true },
  
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
