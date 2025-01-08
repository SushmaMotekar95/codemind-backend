const mongoose = require('mongoose');

const bootcampFollowUpSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true , unique: true},
  course: { type: String, required: true },
  inquiryStatus: { type: String },
  date: { type: Date, default: Date.now },
  batch: { type: String },
  source: {type: String},
  sourcecomment: {type: String},
  comments: [{
    date: { type: Date, required: true, default: Date.now },
    comment: { type: String, required: true }
  }]
});

const bootcampFollowUp = mongoose.model('bootcampFollowUp', bootcampFollowUpSchema);

module.exports = bootcampFollowUp;
