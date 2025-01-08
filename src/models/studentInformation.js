const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  username: {type:String},
  paidFees: { type: Number, required: true },
  course: { type:String, required: true },
  totalFees: { type: Number, required: true },
  totalPaidFees:{type: Number, required: true},
  installment: { type: String },
  discountPercentage: { type: Number, default: 0 },
  discountComment: { type: String },
  reference: { type: Number, required: true },
  referenceComment: { type: String },
  remainingFees: { type: Number, required: true },
  paymentStatus: { type: String, required: true },
  paymentDate: { type: Date, default: Date.now },
  transactionWay: { type: String },
  transactionId: { type: String },  
  bankName: { type: String },
  cashReceiverName: { type:String},       
  screenshot: { type: String } 
});


const studentInformationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, },
  cityName: { type: String, },
  state: { type: String },
  batch: { type: String, },
  course: { type: String, },
  graduation: { type: String, },
  passingYear: { type: Number, },
  collegeName: { type: String, },
  birthdate: { type: Date, default: Date.now },
  gender:{ type: String},
  currentlyWorking:{ type: String },
  attendance: { type: String, },
  parentEmail: { type: String },
  parentMobileNumber: { type: String },
  mock1Feedback: { type: String },
  mock2Feedback: { type: String },
  mock3Feedback: { type: String },
  paymentStatus: { type: String },
  placementStatus: { type: String },
  source: { type: String},
  sourcecomment: { type: String},
  //payment data
  payments: [paymentSchema], 
});

const StudentInformation = mongoose.model('StudentInformation', studentInformationSchema);

module.exports = StudentInformation;
