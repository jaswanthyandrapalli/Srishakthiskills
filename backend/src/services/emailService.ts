import nodemailer from 'nodemailer';

/**
 * Creates a Nodemailer transporter based on SMTP environment variables.
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('SMTP configuration is missing. Nodemailer transporter could not be initialized.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Sends a secure verification OTP email to a customer.
 * 
 * @param toEmail Recipient email address
 * @param otp The 6-digit OTP code
 * @returns Promise<boolean> True if successfully sent, false otherwise
 */
export const sendOTPEmail = async (toEmail: string, otp: string): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    
    if (!transporter) {
      throw new Error('SMTP credentials are not configured in environment variables.');
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Sri Sakthi Sarees" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Sri Sakthi Sarees - Email Verification',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #800000 0%, #4a0000 100%); padding: 35px; text-align: center; border-bottom: 3px solid #d4af37;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Sri Sakthi Sarees</h1>
              <p style="color: #d4af37; margin: 5px 0 0 0; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase;">Heritage & Luxury</p>
            </div>
            <!-- Body -->
            <div style="padding: 40px 30px; color: #333333; text-align: left; line-height: 1.6;">
              <h2 style="color: #800000; margin-top: 0; font-size: 20px; font-weight: 600; text-align: center;">Email Verification</h2>
              <p style="font-size: 15px; margin-bottom: 20px; text-align: center; color: #555555;">
                Welcome to Sri Sakthi Sarees! Thank you for registering with us. To complete your account verification, please use the secure One-Time Password (OTP) below:
              </p>
              
              <!-- OTP Container -->
              <div style="background-color: #fcf8f2; border: 1px dashed #d4af37; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #777777; margin-bottom: 8px; font-weight: bold;">Your Verification Code</span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #800000; letter-spacing: 8px; display: inline-block;">${otp}</span>
              </div>
              
              <p style="font-size: 14px; color: #555555; text-align: center; margin-bottom: 5px;">
                This OTP is valid for <strong>5 minutes</strong>.
              </p>
              
              <!-- Security Alert -->
              <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 12px 16px; border-radius: 4px; margin: 25px 0;">
                <p style="margin: 0; font-size: 13px; color: #c53030; font-weight: 600;">
                  ⚠️ Security Notice: Do not share this OTP with anyone. Sri Sakthi Sarees staff will never ask for your OTP.
                </p>
              </div>
            </div>
            <!-- Footer -->
            <div style="background-color: #f7f9fc; padding: 25px 30px; border-top: 1px solid #eef2f6; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #777777; line-height: 1.5;">
                This is an automated email, please do not reply directly to this message.<br>
                &copy; ${new Date().getFullYear()} Sri Sakthi Sarees. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};
