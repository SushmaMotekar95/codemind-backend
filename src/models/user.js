const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true},
  mobile_number: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  plainPassword: { type: String, select: false}, 
  // course: { type: String, required: true },
  /*city: { type: String },
  gitUrl: { type: String },
  resume: { type: String },
  photo: { type: String },
  mockFeedback: { type: String }, 
  attendance: {type: String },  */
});

UserSchema.pre('save', async function (next) {
  if (this.firstname) {
    this.firstname = this.firstname.charAt(0).toUpperCase() + this.firstname.slice(1).toLowerCase();
  }
  if (this.lastname) {
    this.lastname = this.lastname.charAt(0).toUpperCase() + this.lastname.slice(1).toLowerCase();
  }
  if (!this.isModified('password')) return next();
  this.plainPassword = this.password;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
