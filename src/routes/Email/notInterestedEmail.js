const nodemailer = require('nodemailer');
require('dotenv').config();
const NotInterested = require('../../models/notInterested'); 
const Course = require('../../models/coursesData/course'); 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendNotInterestedEmail = async (notInterestedId) => {
  try {
    const notInterested = await NotInterested.findById(notInterestedId);
    
    if (!notInterested) {
      throw new Error('Not Interested inquiry not found');
    }
    console.log('Not Interested Inquiry:', notInterested);

    const courseName = notInterested.course;

    const course = await Course.findOne({  courseName  });
    console.log('Looking for course:', courseName);
    
    if (!course) {
      throw new Error('Course not found');
    }

    const { firstName, lastName, email } = notInterested;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Exclusive Opportunity: Upcoming ${course.courseName} ${course.batch}`,
      html: `
        <p>Dear ${firstName} ${lastName},</p>
        <p>Gain expertise with our upcoming program in <strong>${course.courseName}</strong>. ${course.description}</p>
        <p>The best time to enroll is NOW! Claim your 10% exclusive scholarship and secure your spot.</p>
        <p><strong>Upcoming Batch Starting Date:</strong> ${course.batchStartDate.toDateString()}</p>
        <p><strong>Course Duration:</strong> ${course.duration}</p>
        <p><strong>Topics Covered:</strong> ${course.topicsCovered.join(', ')}</p>
        <p>Don't miss out on this opportunity to excel in cloud technologies. Enroll now and take your career to the next level!</p>
        <p>Regards,<br>Team Codemind Technology.</p>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Not Interested inquiry email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendNotInterestedEmail };
