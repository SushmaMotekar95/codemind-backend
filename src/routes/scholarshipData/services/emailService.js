const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

const sendScholarshipEmail = async (email, name) => {
  try {
    const emailTemplatePath = path.join(__dirname, '../../scholarshipData/templates/scholarshipEmailTemplate.html');
    let emailHtml = fs.readFileSync(emailTemplatePath, 'utf8');

    emailHtml = emailHtml.replace('{{name}}', name);

    const mailOptions = {
      from:  process.env.EMAIL_USER,
      to: email,
      subject: 'Scholarship Application Received Successfully',
      html: emailHtml, 
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:',  email);
  } catch (error) {
    console.error('Error sending scholarship email:', error);
    throw error;
  }
};

module.exports = { sendScholarshipEmail };
