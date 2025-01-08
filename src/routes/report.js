const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const StudentInformation = require('../models/studentInformation');
require('dotenv').config();

router.post('/generate-report', async (req, res) => {
    const studentData = new StudentInformation(req.body);
    const fileName = `Report_${studentData.firstName}_${studentData.lastName}.pdf`;
    const filePath = path.join(__dirname, `../reports/${fileName}`);

    const templatePath = path.join(__dirname, '../templates/reportTemplate.html');
    let template = fs.readFileSync(templatePath, 'utf-8');

    template = template.replace('{{firstName}}', studentData.firstName)
        .replace('{{lastName}}', studentData.lastName)
        .replace('{{email}}', studentData.email)
        .replace('{{mobileNumber}}', studentData.mobileNumber)
        .replace('{{address}}', studentData.address)
        .replace('{{cityName}}', studentData.cityName)
        .replace('{{batch}}', studentData.batch)
        .replace('{{course}}', studentData.course)
        .replace('{{graduation}}', studentData.graduation)
        .replace('{{passingYear}}', studentData.passingYear)
        .replace('{{collegeName}}', studentData.collegeName)
        .replace('{{attendance}}', studentData.attendance)
        .replace('{{feedback}}', studentData.feedback)
        .replace('{{parentEmail}}', studentData.parentEmail)
        .replace('{{parentMobileNumber}}', studentData.parentMobileNumber)
        .replace('{{mock1Feedback}}', studentData.mock1Feedback)
        .replace('{{mock2Feedback}}', studentData.mock2Feedback)
        .replace('{{mock3Feedback}}', studentData.mock3Feedback);


    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(template);
    await page.pdf({ path: filePath, format: 'A4' });
    await browser.close();

    const pdfUrl = `${req.protocol}://${req.get('host')}/reports/${fileName}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: studentData.email,
        subject: 'Student Report',
        text: `Dear ${studentData.firstName},\n\nPlease find attached your student report.\n\nBest regards,\nYour Team`,
        attachments: [
            {
                filename: fileName,
                path: filePath
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send({ error: 'Error sending email' });
        } else {
            console.log('Email sent:', info.response);
            console.log('filePath', fileName);
            res.json({ pdfUrl: pdfUrl });
        }
    });
});

module.exports = router;

