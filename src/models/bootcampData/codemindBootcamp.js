const mongoose = require('mongoose');

const bootcampSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    course: { type: String },
    source: { type: String, require: true },
    selectedBootcamp: { type: String , require: true},
    date: { type: Date, default:Date.now },
});

const Bootcamp = mongoose.model('CodemindBootcamp', bootcampSchema);

module.exports = Bootcamp;