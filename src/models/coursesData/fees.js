const mongoose = require('mongoose');

const courseFeesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalFees: { type: Number, required: true }
});

const CourseFees = mongoose.model('CourseFees',  courseFeesSchema);

module.exports = CourseFees;
