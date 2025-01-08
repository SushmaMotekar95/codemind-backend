const mongoose = require('mongoose');

const collegeInfoSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  universityName: { type: String, required: true },
  address: { type: String, required: true },
  city:{ type: String },
  state:{ type: String },
  district: { type: String, required: true },
  principalName: { type: String, required: true },
  collegeContact: { type: String, required: true },
  totalStudents: { type: Number, required: true },
  totalBranches: { type: Number, required: true },
  visitedStatus: { type: String, required: true },
  websiteLink: { type: String, required:true },
  companiesVisited: { type: [String], required: false },
  visitedPlanDate: { type: Date, required: false ,default: Date.now },

});

// Create model based on schema
const CollegeInfo = mongoose.model('CollegeData', collegeInfoSchema);

module.exports = CollegeInfo;
