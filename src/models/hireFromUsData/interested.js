const mongoose = require('mongoose');

const hireusinterestedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true , unique: true},
  inquiryStatus: { type: String, },  
  date: { type: Date, required: true, default: Date.now}, 
  source: { type: String},
  sourcecomment: { type: String},
});

const HireUsInterested = mongoose.model('HireUsInterested', hireusinterestedSchema);

module.exports = HireUsInterested;