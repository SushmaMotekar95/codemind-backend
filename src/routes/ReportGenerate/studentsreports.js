const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, '../../studentsReports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

const loadTemplate = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

router.post('/generate-studentsReport', async (req, res) => {
  try {
    const { studentsData } = req.body;
    console.log("student data :=> ",studentsData);
    const templatePath = path.join(__dirname, '../../templates/studentsReportTemplate.html');

    let content = await loadTemplate(templatePath);
    const tableRows = studentsData.map((student, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${student.firstName + ' ' + student.lastName}</td>
        <td>${student.email}</td>
        <td>${student.mobileNumber}</td>
        <td>${student.batch}</td>
        <td>${student.course}</td>
      </tr>
    `).join('');

    content = content.replace('<!-- User data will be inserted here -->', tableRows);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(content);

    const fileName = `user-report-${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);
    await page.pdf({ path: filePath, format: 'A4' });

    await browser.close();

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending the PDF:', err);
        res.status(500).send('Error downloading the file');
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).send('Error generating report');
  }
});

module.exports = router;
