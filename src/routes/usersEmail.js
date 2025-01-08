const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS   
  }
});

const sendUserCreationEmail = async (user, plainPassword) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email, 
    subject: 'Welcome to CodeMind Dashboard',
    html: `
      <h1>Welcome, ${user.firstname} ${user.lastname}!</h1>
      <p>Your account has been created on CodeMind Dashboard.</p>
      <p>Here are your account details:</p>
      <ul>
        <li><strong>Name:</strong> ${user.firstname} ${user.lastname}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Role:</strong> ${user.role}</li>
        <li><strong>Password:</strong> ${plainPassword}</li>
      </ul>
      <p>You can now log in to your dashboard with these credentials.</p>
        <!-- Add the link to Codemind Dashboard here -->
      <p>Visit the dashboard at: 
        <a href="https://www.codemindtechnology.com/" target="_blank">Codemind Dashboard</a>
      </p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('User creation email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendUserCreationEmail };
