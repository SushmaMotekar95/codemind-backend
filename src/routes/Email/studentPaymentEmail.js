const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


const generatePaymentPDF = async (paymentArray, filePath,  firstName, lastName, batch, codemindUrl) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const payment = paymentArray;

  const templatePath = path.join(__dirname, '../../templates/studentPaymentTemplate.html');
  let template = fs.readFileSync(templatePath, 'utf-8');

  const fullName = `${firstName} ${lastName}`;
  const formattedPaymentDate = payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A';
// console.log("codemind url:=>",codemindUrl)
 
  template = template
    .replace('{{codemindUrl}}', codemindUrl)
    .replace('{{fullName}}', fullName)
    .replace('{{batch}}', batch)
    .replace('{{totalFees}}', payment.totalFees || 'N/A')
    .replace('{{totalPaidFees}}', payment.totalPaidFees || 'N/A')
    .replace('{{paidFees}}', payment.paidFees || 'N/A')
    .replace('{{remainingFees}}', payment.remainingFees || 'N/A')
    .replace('{{course}}', payment.course || 'N/A')
    .replace('{{installment}}', payment.installment || 'N/A')
    .replace('{{paymentStatus}}', payment.paymentStatus || 'N/A')
    .replace('{{transactionWay}}', payment.transactionWay || 'N/A')
    .replace('{{transactionId}}', payment.transactionId || 'N/A')
    .replace('{{bankName}}', payment.bankName || 'N/A')
    .replace('{{paymentDate}}', formattedPaymentDate)
    .replace('{{generatedTime}}', new Date().toLocaleString());

  await page.setContent(template , { waitUntil: 'networkidle0' });
  await page.pdf({
    path: filePath,
    format: 'A4',
    printBackground: true,
  });

  await browser.close();
};

  const sendPaymentEmail = async (studentEmail, firstName,lastName, batch, payments) => {
  const pdfFilePath = path.join(__dirname, '../../studentsReports/paymentDetails.pdf');
  const codemindUrl = "https://www.codemindtechnology.com/assets/img/logo-shape.png";

  await generatePaymentPDF(payments, pdfFilePath, firstName, lastName, batch,codemindUrl);
  // const payments = payment[0]; 

  const emailOptions = {
    from: process.env.EMAIL_USER,
    to: `${studentEmail}, ${process.env.EMAIL_CODEMIND}`,
    subject: 'Your Payment Update',
    text: `Dear ${firstName} ${lastName},\n\n` +
          `We are pleased to inform you that your payment for the ${batch} has been ${payments.paymentStatus}. ` +
          `\nHere are the details of your payment:\n\n` +
          `• **Total Fees:** ${payments.totalFees || 'N/A'}\n` +
          `• **Total Paid Fees:** ${payments.totalPaidFees || 'N/A'}\n` +
          `• **Current Paid Fees:** ${payments.paidFees || 'N/A'}\n` +
          `• **Remaining Fees:** ${payments.remainingFees || 'N/A'}\n\n` +
          `Thank you for your prompt payment!\n We appreciate your commitment to your education. If you have any questions or require further assistance, please do not hesitate to contact us.\n\n` +
          `Best regards,\n` +
          `Codemind Technology Team\n` +
          `\n` +
          `---\n` +
          `This is an automated email, please do not reply.`,
    attachments: [
      {
        filename: 'PaymentDetails.pdf',
        path: pdfFilePath 
      }
    ]
  };

  return transporter.sendMail(emailOptions);
};

module.exports = { sendPaymentEmail };
