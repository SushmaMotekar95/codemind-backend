/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const functions = require('firebase-functions');
/*const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize the Express app
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Example route to check if the app works
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Your app's logic can be added here
app.get('/', (req, res) => {
  res.send('Hello, Firebase!');
});

// Export the Express app as a Firebase function
exports.app = functions.https.onRequest(app);*/


//codemind websites
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { db } = require('../firebase.js')

// const followUpRoutes = require('./routes/followUp');
// const bootCampRoutes = require('./routes/bootcamp');
// const studentInformationRoutes = require('./routes/studentInformation');
// const reportRoutes = require('./routes/report');
// const studentMockInformationRoutes = require('./routes/studentMockInformation');

//SignUp and Login
// const authRoutes = require('../src/routes/auth');

// Inquiry Routes
const inquiryRoutes = require('../src/routes/inquiry.js');

//Hire From Us Routes
const hireUsRoutes = require('../src/routes/hireFromUs');

//Scholarship
const scholarshipRoutes = require('../src/routes/scholarship/scholarship');

//Student Issues
const studentIssuesRoutes = require('../src/routes/studentIssues/studentIssues');

//Bootcamp
const bootCampRoutes = require('../src/routes/bootcamp/bootcamp');

require('dotenv').config();

const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'UP', timestamp: new Date() });
});

/*mongoose.connect(process.env.MONGO_DB_URL)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));*/

// Your app's logic can be added here
app.get('/', (req, res) => {
    res.send('Hello, Firebase!');
  });
  

app.use(cors({ origin: true }));
app.use(bodyParser.json());
// app.use('/upload', express.static(path.join(__dirname, 'upload')));
// app.use('/reports', express.static(path.join(__dirname, 'reports')));

//SignUp and Login
// app.use('/api/auth', authRoutes);

//Inquiry
app.use('/api/students', inquiryRoutes);

//HireFromUs 
app.use('/api/hireUs', hireUsRoutes)

//Scholarship
app.use('/api/scholarship', scholarshipRoutes)

//Student-Issues
app.use('/api/studentIssues', studentIssuesRoutes)

//Bootcamp
app.use('/api/bootcamp', bootCampRoutes);

//app.use('/api/followup', followUpRoutes);
// app.use('/api/bootcamp', bootCampRoutes);
// app.use('/api/studentInformation', studentInformationRoutes);
// app.use('/api', reportRoutes);
// app.use('/api/studentMockInformation', studentMockInformationRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

const port = process.env.PORT || 3000; 
app.listen(port, '0.0.0.0',() => {
  console.log(`Server running on port ${port}`);
});
// Export the Express app as a Firebase function
exports.app = functions.https.onRequest(app);