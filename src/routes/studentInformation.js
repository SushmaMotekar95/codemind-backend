const express = require('express');
const router = express.Router();
const multer = require('multer');
const StudentInformation = require('../models/studentInformation');
const CourseFees = require('../models/coursesData/fees');
const { sendPaymentEmail } = require('../routes/Email/studentPaymentEmail');

// API Endpoint to Save Student Information Data
router.post('/', async (req, res) => {
  try {
    const studentInfo = new StudentInformation(req.body);
    await studentInfo.save();
    res.status(201).send(studentInfo);
  } catch (error) {
    res.status(400).send({ error: 'Error saving student information', details: error });
  }
});

router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.search?.trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { batch, course, feedback, paymentStatus, placementStatus } = req.query;

    let studentInfo, totalDocuments;

    // Base filter setup
    const baseFilter = {
      ...(searchQuery ? {
        $or: [
          { firstName: new RegExp(searchQuery, 'i') },
          { lastName: new RegExp(searchQuery, 'i') },
          { email: new RegExp(searchQuery, 'i') },
          { mobileNumber: new RegExp(searchQuery, 'i') },
          { course: new RegExp(searchQuery, 'i') },
          { batch: new RegExp(searchQuery, 'i') },
          { graduation: new RegExp(searchQuery, 'i') },
          { placementStatus: new RegExp(searchQuery, 'i') },
          { 'payments.paymentStatus': new RegExp(searchQuery, 'i') },
        ]
      } : {})
    };

    // Apply filters for batch, course, paymentStatus, and placementStatus
    if (batch && batch !== 'All') {
      baseFilter.batch = batch;
    }

    if (course && course !== '') {
      baseFilter.course = course;
    }

    if (paymentStatus && paymentStatus !== 'All') {
      if (paymentStatus === 'Not Paid') {
        baseFilter.$or = [
          { 'payments': { $exists: false } },
          { 'payments': { $size: 0 } },
          { 'payments.paymentStatus': { $exists: false } },
          { 'payments.paymentStatus': 'Not Paid' }
        ];
      } else {
        baseFilter.$or = [{ 'payments.paymentStatus': paymentStatus }];
      }
    }

    if (placementStatus && placementStatus !== 'All') {
      baseFilter.placementStatus = placementStatus;
    }

    // Get all student records without pagination for feedback filtering
    const allStudents = await StudentInformation.find(baseFilter);

    // Function to calculate overall feedback based on mock feedback
    const calculateOverallFeedback = (student) => {
      const feedbackScores = { Poor: 1, Average: 2, Good: 3, Excellent: 4 };
      const mock1Score = feedbackScores[student.mock1Feedback] || 0;
      const mock2Score = feedbackScores[student.mock2Feedback] || 0;
      const mock3Score = feedbackScores[student.mock3Feedback] || 0;

      const totalScore = mock1Score + mock2Score + mock3Score;
      const feedbackCount = [mock1Score, mock2Score, mock3Score].filter(score => score > 0).length || 1; // Avoid division by zero

      const averageScore = totalScore / feedbackCount;

      if (averageScore <= 1.5) return 'Poor';
      if (averageScore <= 2.5) return 'Average';
      if (averageScore <= 3.5) return 'Good';
      return 'Excellent';
    };

    // Apply feedback filtering globally on all student data
    const studentsWithFeedback = allStudents.map(student => ({
      ...student.toObject(),
      overallFeedback: calculateOverallFeedback(student), // Add calculated feedback
    }));

    // Apply feedback filter if provided
    let filteredStudents = studentsWithFeedback;
    if (feedback && feedback !== 'All') {
      filteredStudents = studentsWithFeedback.filter(
        (student) => student.overallFeedback === feedback
      );
    }

    // After applying feedback filter, continue with pagination and other filters
    totalDocuments = filteredStudents.length;

    // Apply pagination to filtered students
    const paginatedStudents = filteredStudents.slice(skip, skip + limit);

    //TitleCase
    const toTitleCase = (str) => {
      return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    // Add course fees information
    const studentInfoWithFees = await Promise.all(
      paginatedStudents.map(async (student) => {
        const courseFees = await CourseFees.findOne({ name: student.course });
        return {
          ...student,
          name: toTitleCase(`${student.firstName} ${student.lastName}`),
          totalFees: courseFees ? courseFees.totalFees : 'Course not found',
        };
      })
    );

    // Calculate total pages based on filtered count
    const totalPages = Math.ceil(totalDocuments / limit);

    // Send response
    res.status(200).send({
      totalRecords: totalDocuments,
      totalPages,
      currentPage: page,
      data: studentInfoWithFees,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: 'Error fetching student information', details: error.message });
  }
});



// API Endpoint to Update Student Information Data
router.put('/:id', async (req, res) => {

  try {
    const studentInfo = await StudentInformation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!studentInfo) {
      return res.status(404).send({ error: 'Student not found' });
    }
    res.status(200).send(studentInfo);
  } catch (error) {
    res.status(400).send({ error: 'Error updating student information', details: error });
  }
});

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// API Endpoint to Update Student Information Data
router.put('/payments/:id', upload.single('screenshot'), async (req, res) => {
  try {
    const { payments, ...updateData } = req.body;


    if (req.file) {

      const screenshotPath = req.file.path;
      payments.forEach(payment => {
        payment.screenshot = screenshotPath;
      });
    }

    const studentInfo = await StudentInformation.findById(req.params.id);
    if (!studentInfo) {
      return res.status(404).send({ error: 'Student not found' });
    }

    if (payments) {
      payments.forEach(payment => {
        const existingPaymentIndex = studentInfo.payments.findIndex(p => p.reference === payment.reference);
        const newPayment = {
          ...payment,
          timestamp: new Date()
        };

        if (existingPaymentIndex !== -1) {
          studentInfo.payments.push(newPayment);
        } else {

          studentInfo.payments.push(newPayment);
        }
      });
      // await sendPaymentEmail(studentInfo.email, studentInfo.firstName, studentInfo.lastName, studentInfo.batch, payments);
    }

    Object.assign(studentInfo, updateData);
    await studentInfo.save();
    return res.status(200).send(studentInfo);
  } catch (error) {
    return res.status(400).send({ error: 'Error updating student information', details: error.message });
  }
});

router.get('/send-payment-email/:id', async (req, res) => {
  try {
    const studentInfo = await StudentInformation.findById(req.params.id);
    if (!studentInfo) {
      return res.status(404).send({ success: false, error: 'Student not found' });
    }

    // Check if payments array exists and has at least one entry
    const latestPayment = studentInfo.payments && studentInfo.payments.length > 0
      ? studentInfo.payments[studentInfo.payments.length - 1]
      : null;

    if (latestPayment) {
      try {
        // Attempt to send the email
        await sendPaymentEmail(
          studentInfo.email,
          studentInfo.firstName,
          studentInfo.lastName,
          studentInfo.batch,
          latestPayment
        );
        // Send a success response if email is sent successfully
        return res.status(200).send({ success: true, message: 'Email sent successfully' });
      } catch (emailError) {
        console.error('Error sending email:', emailError.message);
        return res.status(500).send({ success: false, error: 'Failed to send email', details: emailError.message });
      }
    } else {
      return res.status(400).send({ success: false, error: 'No payment information found for this student' });
    }
  } catch (error) {
    // Log the full error and send a response with error details
    console.error('Error retrieving student information:', error);
    res.status(500).send({ success: false, error: 'Error retrieving student information', details: error.message });
  }
});



// API Endpoint to Delete perticular Student
router.delete('/:id', async (req, res) => {
  try {
    const deleteStudent = await StudentInformation.findByIdAndDelete(req.params.id);
    if (!deleteStudent) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error deleting user', details: error });
  }
});


/*router.get('/fees-summary', async (req, res) => {
  try {
    const { startDate, endDate, course, batch } = req.query;

    // Check if startDate and endDate are provided
    if (!startDate || !endDate) {
      return res.status(400).send({ error: 'Both startDate and endDate are required' });
    }

    const from = new Date(startDate);
    from.setHours(0, 0, 0, 0); // Start of the day
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999); // End of the day

    // Build the query object
    const query = {
      'payments.paymentDate': {
        $gte: from,
        $lte: to
      }
    };

    if (course && course !== 'All') {
      query.course = course;
    }
    if (batch && batch !== 'All') {
      query.batch = batch;
    }

    const students = await StudentInformation.find(query);
    const courseSummary = {};

    students.forEach((student) => {
      const studentCourse = student.course;
      const studentBatch = student.batch;

      // Initialize course summary if not already done
      if (!courseSummary[studentCourse]) {
        courseSummary[studentCourse] = {
          totalFees: 0,
          totalPaidFees: 0,
          totalRemainingFees: 0,
          totalDiscount: 0,
          referenceAmount: 0,
          totalStudents: 0,

        };
      }

      if (!courseSummary[`${studentCourse}_${studentBatch}`]) {
        courseSummary[`${studentCourse}_${studentBatch}`] = {
          course: studentCourse,
          batch: studentBatch,
          totalFees: 0,
          totalPaidFees: 0,
          totalRemainingFees: 0,
          totalDiscount: 0,
          referenceAmount: 0,
          totalStudents: 0
        };
      }

      // Filter the payments within the date range
      const filteredPayments = student.payments.filter((payment) => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= from && paymentDate <= to;
      });

      // Check if there are any payments within the range
      if (filteredPayments.length > 0) {
        // Find the last payment in the array (most recent one)
        const lastPayment = filteredPayments[filteredPayments.length - 1];

        const { totalFees = 0, totalPaidFees = 0, remainingFees = 0, discountPercentage, discountAmount, reference } = lastPayment;

        // Update total course data
        courseSummary[studentCourse].totalFees += totalFees;
        courseSummary[studentCourse].totalPaidFees += totalPaidFees;
        courseSummary[studentCourse].totalRemainingFees += remainingFees;

        // Calculate discount
        if (discountPercentage) {
          const discount = (discountPercentage / 100) * totalFees;
          courseSummary[studentCourse].totalDiscount += discount;
        }
        if (discountAmount) {
          courseSummary[studentCourse].totalDiscount += discountAmount;
        }
        if (reference) {
          courseSummary[studentCourse].referenceAmount += reference;
        }

        // Update batch-specific data
        courseSummary[`${studentCourse}_${studentBatch}`].totalFees += totalFees;
        courseSummary[`${studentCourse}_${studentBatch}`].totalPaidFees += totalPaidFees;
        courseSummary[`${studentCourse}_${studentBatch}`].totalRemainingFees += remainingFees;

        // Calculate batch-specific discount
        if (discountPercentage) {
          const discount = (discountPercentage / 100) * totalFees;
          courseSummary[`${studentCourse}_${studentBatch}`].totalDiscount += discount;
        }
        if (discountAmount) {
          courseSummary[`${studentCourse}_${studentBatch}`].totalDiscount += discountAmount;
        }

        if (reference) {
          courseSummary[`${studentCourse}_${studentBatch}`].referenceAmount += reference;
        }

        // Increment total students
        courseSummary[studentCourse].totalStudents += 1;
        courseSummary[`${studentCourse}_${studentBatch}`].totalStudents += 1;
      }
    });

    // Generate the final summary in a flat format
    let finalSummary = [];

    // Loop over all course + batch keys and add them as flat records
    Object.keys(courseSummary).forEach((key) => {
      // Skip courses without batches (used to keep total course level data if needed)
      if (key.includes('_')) {
        finalSummary.push(courseSummary[key]);
      }
    });

    res.status(200).json({
      data: finalSummary,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: 'Error fetching fees summary', details: error.message });
  }
});*/


router.get('/fees-summary', async (req, res) => {
  try {
    const { startDate, endDate, course, batch, page = 1, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).send({ error: 'Both startDate and endDate are required' });
    }

    const from = new Date(startDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    const query = {
      'payments.paymentDate': { $gte: from, $lte: to },
    };

    if (course && course !== 'All') query.course = course;
    if (batch && batch !== 'All') query.batch = batch;

    const students = await StudentInformation.find(query);

    const courseSummary = {};
    students.forEach((student) => {
      const studentCourse = student.course;
      const studentBatch = student.batch;

      if (!courseSummary[`${studentCourse}_${studentBatch}`]) {
        courseSummary[`${studentCourse}_${studentBatch}`] = {
          course: studentCourse,
          batch: studentBatch,
          totalFees: 0,
          totalPaidFees: 0,
          totalRemainingFees: 0,
          totalDiscount: 0,
          referenceAmount: 0,
          totalStudents: 0,
        };
      }

      const filteredPayments = student.payments.filter((payment) => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= from && paymentDate <= to;
      });

      if (filteredPayments.length > 0) {
        const lastPayment = filteredPayments[filteredPayments.length - 1];
        const { totalFees = 0, totalPaidFees = 0, remainingFees = 0, discountPercentage, discountAmount, reference } = lastPayment;

        const summary = courseSummary[`${studentCourse}_${studentBatch}`];
        summary.totalFees += totalFees;
        summary.totalPaidFees += totalPaidFees;
        summary.totalRemainingFees += remainingFees;
        summary.totalDiscount += discountPercentage ? (discountPercentage / 100) * totalFees : 0;
        summary.totalDiscount += discountAmount || 0;
        summary.referenceAmount += reference || 0;
        summary.totalStudents += 1;
      }
    });

    const finalSummary = Object.values(courseSummary);

    // Pagination
    const totalRecords = finalSummary.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const currentPage = parseInt(page);
    const paginatedData = finalSummary.slice((currentPage - 1) * limit, currentPage * limit);

    res.status(200).json({
      totalRecords,
      totalPages,
      currentPage,
      data: paginatedData,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: 'Error fetching fees summary', details: error.message });
  }
});

module.exports = router;

