const mongoose = require('mongoose');

const hireusnotinterestedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true},
  inquiryStatus: { type: String, },  
  date: { type: Date, required: true }, 
  source: { type: String},
  sourcecomment: { type: String},
});

const HireUsNotInterested = mongoose.model('HireUsNotInterested', hireusnotinterestedSchema );

module.exports = HireUsNotInterested;