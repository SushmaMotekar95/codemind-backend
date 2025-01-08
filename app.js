//codemind websites
/*const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { db } = require('./firebase.js')

// const followUpRoutes = require('./routes/followUp');
// const bootCampRoutes = require('./routes/bootcamp');
// const studentInformationRoutes = require('./routes/studentInformation');
// const reportRoutes = require('./routes/report');
// const studentMockInformationRoutes = require('./routes/studentMockInformation');

//SignUp and Login
// const authRoutes = require('./src/routes/auth');

// Inquiry Routes
const inquiryRoutes = require('./src/routes/inquiry');

//Hire From Us Routes
const hireUsRoutes = require('./src/routes/hireFromUs');

//Scholarship
const scholarshipRoutes = require('./src/routes/scholarship/scholarship');

//Student Issues
const studentIssuesRoutes = require('./src/routes/studentIssues/studentIssues');

//Bootcamp
const bootCampRoutes = require('./src/routes/bootcamp/bootcamp');

require('dotenv').config();

const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'UP', timestamp: new Date() });
});

//mongoose.connect(process.env.MONGO_DB_URL)
//.then(() => console.log('MongoDB connected'))
//.catch(err => console.log('MongoDB connection error:', err));

app.use(cors());
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
});*/

//Codemind Admin Dashboard
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const logger = require('./logger.js');
const { db } = require('./firebase.js')
const morgan = require('morgan');

//Login Data
const authRoutes = require('./src1/routes/auth');

//Dashboard Data
const studentInformationRoutes = require('./src1/routes/studentInformation');

//Student-Leads Data
const inquiryRoutes = require('./src1/routes/Inquiry');
const notInterestedRoutes = require('./src1/routes/notInterested');
const interestedRoutes = require('./src1/routes/interested');
const followUpRoutes = require('./src1/routes/followUp');
const totalRecordsRouter = require('./src1/routes/totalTableRecords');

//Report Data
const reportRoutes = require('./src1/routes/report');
const usersReportRoutes = require('./src1/routes/usersReport');
const studentsReportRoutes = require('./src1/routes/ReportGenerate/studentsreports');

// const studentMockInformationRoutes = require('./routes/studentMockInformation');

//Course and Fees Data
const courseRoutes = require('./src1/routes/course');
const feesRoutes = require('./src1/routes/fees');


//Bootcamp Data
const bootcampRoutes = require('./src1/routes/bootcampData/bootcamp');
const bootcampInterestedRoutes = require('./src1/routes/bootcampData/interested');
const bootcampNotInterestedRoutes = require('./src1/routes/bootcampData/notInterested');
const bootcampFollowUpRoutes = require('./src1/routes/bootcampData/followUp');
const bootcampTotalRecordsRouter = require('./src1/routes/bootcampData/totalTableRecords');
const codemindBootcampRoutes =require('./src1/routes/bootcampData/codemindBootcamp');

//HirUs Data 
const HireUsRoutes = require('./src1/routes/hireFromUsData/newLeads');
const HireUsInterestedRoutes = require('./src1/routes/hireFromUsData/interested');
const HireUsNotInterestedRoutes = require('./src1/routes/hireFromUsData/notInterested');
const HireUsFollowUpRoutes = require('./src1/routes/hireFromUsData/followUps');
const HireUsTotalRecordsRouter = require('./src1/routes/hireFromUsData/totalRecords');

//College Data
const collegeInfoRoutes = require('./src1/routes/collegeData/collegeInfo');

//Scholarship Data 
const scholarshipRoutes = require('./src1/routes/scholarshipData/scholarship');

//Student Issue Data
const studentIssueRoutes = require('./src1/routes/studentIssueData/studentIssue');

//Inventory Data
const inventoryRoutes = require('./src1/routes/inventoryData/inventory');

//Intialize Express
const app = express();

// Log HTTP requests to Winston using morgan
const stream = {
  write: (message) => logger.http(message.trim()) 
};

const logFormat = ':method :url :status :res[content-length] - :response-time ms';

app.use(morgan(logFormat, { stream }));

// mongoose.connect('mongodb://localhost:27017/roleBasedApp')
// mongoose.connect('mongodb://127.0.0.1:27017/roleBasedApp')
// mongoose.connect(process.env.MONGODBURL)
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log('MongoDB connection error:', err));

app.use(cors());
app.use(bodyParser.json());
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));
app.use('/usersReports', express.static(path.join(__dirname, 'usersReports')));
app.use('/studentsReports', express.static(path.join(__dirname, 'studentsReports')));

//Login Routes
app.use('/api/auth', authRoutes);

//Dashboard Routes
app.use('/api/studentInformation', studentInformationRoutes);

//Student-Leads Routes
app.use('/api/students', inquiryRoutes);
app.use('/api/notInterested',notInterestedRoutes);
app.use('/api/interested',interestedRoutes)
app.use('/api/followup', followUpRoutes);
app.use('/api/total-records', totalRecordsRouter);

//Reports Routes
app.use('/api', reportRoutes);
app.use('/api/', usersReportRoutes);
app.use('/api/',studentsReportRoutes);
// app.use('/api/studentMockInformation', studentMockInformationRoutes);

//Course and Fees Routes
app.use('/api/course', courseRoutes);
app.use('/api/fees', feesRoutes);

//Bootcamp Routes
app.use('/api/bootcamp', bootcampRoutes);
app.use('/api/bootcamp/interested',bootcampInterestedRoutes);
app.use('/api/bootcamp/notInterested',bootcampNotInterestedRoutes);
app.use('/api/bootcamp/followUp', bootcampFollowUpRoutes);
app.use('/api/bootcamp/totalRecords', bootcampTotalRecordsRouter);
app.use('/api/bootcamp/codemindBootcamp', codemindBootcampRoutes);

//HireUs Routes
app.use('/api/hireus', HireUsRoutes);
app.use('/api/hireus/interested', HireUsInterestedRoutes);
app.use('/api/hireus/notInterested', HireUsNotInterestedRoutes);
app.use('/api/hireus/followUp',HireUsFollowUpRoutes);
app.use('/api/hireus/totalRecords', HireUsTotalRecordsRouter);

//College Data
app.use('/api/collegeData', collegeInfoRoutes);

//Scholarship
app.use('/api/scholarship', scholarshipRoutes);

//Student Issue
app.use('/api/studentIssues', studentIssueRoutes);

//Inventory
app.use('/api/inventory', inventoryRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

const port = process.env.PORT || 3000; 
app.listen(port, '0.0.0.0',() => {
  console.log(`Server running on port ${port}`);
});


