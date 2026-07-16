import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testEmail() {
  console.log('SMTP Config:');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('Secure:', process.env.SMTP_SECURE);
  console.log('User:', process.env.SMTP_USER);
  console.log('Pass length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 5000, // 5 seconds timeout
    greetingTimeout: 5000,
    socketTimeout: 5000
  });

  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // send to self
      subject: 'Test SMTP Verification',
      text: 'If you receive this, Nodemailer and SMTP are working!'
    });
    console.log('✅ Email sent successfully! MessageId:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP Error:', err);
  }
}

testEmail();
