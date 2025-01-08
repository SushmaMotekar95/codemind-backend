
const mongoose = require('mongoose');

const ScholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  collegeName: {type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true },
  graduationMarks: { type: Number, require: true },
  hscMarks: { type: Number, require: true },
  sscMarks: { type: Number, require: true },
  address: { type: String , require: true },
  course:  { type: String},
  batch:  { type: String},
  scholarshipStatus: { type: String },
  scholarshipScore: { type: Number, default: 0,},
  interviewFeedback: { type: String,},
  date: { type: Date , default: Date.now},
  source:{ type: String },
  sourcecomment:{ type: String },
});

const Scholarship= mongoose.model('Scholarship',ScholarshipSchema);

module.exports =  Scholarship;


