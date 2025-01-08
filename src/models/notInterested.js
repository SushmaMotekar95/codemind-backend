const mongoose = require('mongoose');

const notInterestedSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  inquiryStatus: { type: String, default: 'Not Interested' }, 
  source: {type: String},
  sourcecomment: {type: String},
  // date: { type: Date, required: true }, 
  // batch: { type: String },  
//   comments: [{
//     date: { type: Date, required: true, default: Date.now },
//     comment: { type: String, required: true }
//   }]
});

const NotInterested = mongoose.model('NotInterested', notInterestedSchema);

module.exports = NotInterested;
