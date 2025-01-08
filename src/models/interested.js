const mongoose = require('mongoose');

const interestedSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true , unique: true},
  course: { type: String, required: true },
  inquiryStatus: { type: String, default: 'Not Interested' },  
  date: { type: Date, required: true }, 
  batch: { type: String },
  reference: { type: String},
  admission:{ type: String},
  source: { type: String},
  sourcecomment: { type: String},
  comments: [{
    date: { type: Date, required: true, default: Date.now },
    comment: { type: String}
  }]
});

const InterestedStudent = mongoose.model('Interested', interestedSchema);

module.exports = InterestedStudent;
