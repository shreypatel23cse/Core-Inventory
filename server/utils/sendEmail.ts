import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const sendEmail = async ({ to, subject, text }: { to: string, subject: string, text: string }) => {
  try {
    let transporter;

    const hasRealCredentials = 
      process.env.EMAIL_USER && 
      process.env.EMAIL_PASS && 
      !process.env.EMAIL_USER.includes('your_gmail_address');

    if (hasRealCredentials) {
      // 1. Use real Gmail SMTP if configured in .env
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // 2. Automated Fallback: Ethereal Email (Nodemailer's built-in testing service)
      // This guarantees the app is 100% workable without manual setup.
      console.log('⚠️ Real Gmail credentials not detected in .env.');
      console.log('🔧 Utilizing Ethereal test account to send email...');
      
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user, 
          pass: testAccount.pass, 
        },
      });
    }

    const info = await transporter.sendMail({
      from: hasRealCredentials 
        ? `"CoreInventory Support" <${process.env.EMAIL_USER}>` 
        : '"CoreInventory Test Auth" <test@coreinventory.com>',
      to,
      subject,
      text,
    });

    console.log('✅ Email successfully processed!');
    
    // If using the testing service, provide the link to view the email in the browser!
    if (!hasRealCredentials) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('----------------------------------------------------');
      console.log('📧 CLICK HERE TO VIEW YOUR OTP EMAIL:');
      console.log(previewUrl);
      console.log('----------------------------------------------------');
    }

  } catch (err) {
    console.error('❌ Error sending email:', err);
    throw new Error('Email sending failed');
  }
};
