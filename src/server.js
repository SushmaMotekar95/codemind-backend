/*const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

//Login Data
const authRoutes = require('./routes/auth');

//Dashboard Data
const studentInformationRoutes = require('./routes/studentInformation');

//Student-Leads Data
const inquiryRoutes = require('./routes/Inquiry');
const notInterestedRoutes = require('./routes/notInterested');
const interestedRoutes = require('./routes/interested');
const followUpRoutes = require('./routes/followUp');
const totalRecordsRouter = require('./routes/totalTableRecords');

//Report Data
const reportRoutes = require('./routes/report');
const usersReportRoutes = require('./routes/usersReport');
const studentsReportRoutes = require('./routes/ReportGenerate/studentsreports');

// const studentMockInformationRoutes = require('./routes/studentMockInformation');

//Course and Fees Data
const courseRoutes = require('./routes/course');
const feesRoutes = require('./routes/fees');


//Bootcamp Data
const bootcampRoutes = require('./routes/bootcampData/bootcamp');
const bootcampInterestedRoutes = require('./routes/bootcampData/interested');
const bootcampNotInterestedRoutes = require('./routes/bootcampData/notInterested');
const bootcampFollowUpRoutes = require('./routes/bootcampData/followUp');
const bootcampTotalRecordsRouter = require('./routes/bootcampData/totalTableRecords');
const codemindBootcampRoutes =require('./routes/bootcampData/codemindBootcamp');

//HirUs Data 
const HireUsRoutes = require('./routes/hireFromUsData/newLeads');
const HireUsInterestedRoutes = require('./routes/hireFromUsData/interested');
const HireUsNotInterestedRoutes = require('./routes/hireFromUsData/notInterested');
const HireUsFollowUpRoutes = require('./routes/hireFromUsData/followUps');
const HireUsTotalRecordsRouter = require('./routes/hireFromUsData/totalRecords');

//College Data
const collegeInfoRoutes = require('./routes/collegeData/collegeInfo');

//Scholarship Data 
const scholarshipRoutes = require('./routes/scholarshipData/scholarship');

//Student Issue Data
const studentIssueRoutes = require('./routes/studentIssueData/studentIssue');

//Inventory Data
const inventoryRoutes = require('./routes/inventoryData/inventory');

//Intialize Express
const app = express();

// mongoose.connect('mongodb://localhost:27017/roleBasedApp')
// mongoose.connect('mongodb://127.0.0.1:27017/roleBasedApp')
mongoose.connect(process.env.MONGODBURL)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

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
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
*/
