const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

const sendBootcampEmail = async ( name, email, selectedBootcamp ) => {
  try {
    const emailTemplatePath = path.join(__dirname, '../../bootcampData/template/codemindBootcampEmail.html');
    let emailHtml = fs.readFileSync(emailTemplatePath, 'utf8');

    emailHtml = emailHtml.replace('{{name}}', name)
                         .replace('{{selectedBootcamp}}', selectedBootcamp);

    const mailOptions = {
      from:  process.env.EMAIL_USER,
      to: email,
      subject: 'Bootcamp Application Received Successfully',
      html: emailHtml, 
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:',  email);
  } catch (error) {
    console.error('Error sending Codemind Bootcamp email:', error);
    throw error;
  }
};

module.exports = { sendBootcampEmail };
