const mongoose = require('mongoose');

const bootcampInterestedSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true , unique: true},
  course: { type: String, required: true },
  inquiryStatus: { type: String, default: 'Not Interested' },  
  date: { type: Date, required: true }, 
  batch: { type: String },
  admission:{ type: String},
  source: { type: String},
  sourcecomment: { type: String},
});

const bootcampInterestedStudent = mongoose.model('bootcampInterested', bootcampInterestedSchema);

module.exports = bootcampInterestedStudent;
