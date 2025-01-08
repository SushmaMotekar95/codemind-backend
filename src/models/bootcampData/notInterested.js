const mongoose = require('mongoose');

const bootcampNotInterestedSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  inquiryStatus: { type: String, default: 'Not Interested' }, 
  source: {type: String},
  sourcecomment: {type: String},
  date: { type: Date, required: true }, 
});

const bootcampNotInterested = mongoose.model('bootcampNotInterested', bootcampNotInterestedSchema);

module.exports = bootcampNotInterested;
