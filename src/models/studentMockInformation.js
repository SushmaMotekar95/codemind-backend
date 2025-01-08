/*const mongoose = require('mongoose');

const mockInformationSchema = new mongoose.Schema({
  mockNumber: { type: String,},
  mockDate: { type: Date, },
  mockTime: { type: String, },
  mockStatus: { type: String, },
  feedback: { type: String,}
});

const studentMockInformationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNo: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  batch: { type: String, },
  graduation: { type: String,  },
  passingYear: { type: Number,  },
  mocks: [mockInformationSchema]
});

const StudentMockInformation = mongoose.model('StudentMockInformation', studentMockInformationSchema);
module.exports = StudentMockInformation;*/
