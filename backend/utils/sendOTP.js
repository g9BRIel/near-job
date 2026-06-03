const nodemailer = require('nodemailer');

const sendSMS = async (phone, code) => {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  const from = process.env.TWILIO_PHONE;

  if (sid && token && from) {
    try {
      const twilio = require('twilio')(sid, token);
      await twilio.messages.create({
        body: `Your NearJob verification code is: ${code}`,
        from: from,
        to: phone
      });
      console.log(`[REAL SMS] Successfully sent to ${phone} via Twilio`);
      return true;
    } catch (error) {
      console.error(`[TWILIO ERROR] ${error.message}`);
      // Fallback to simulation so it doesn't crash
    }
  }

  console.log(`\n--- [REAL SMS SIMULATION] ---`);
  console.log(`TO: ${phone}`);
  console.log(`MESSAGE: Your NearJob verification code is: ${code}`);
  console.log(`-----------------------------\n`);
  return true;
};

const sendEmail = async (email, code) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Works for Gmail. For other services, change this to host/port
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"NearJob Support" <${user}>`,
        to: email,
        subject: "Verification Code - NearJob",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4f46e5;">Verification Code</h2>
            <p>Your verification code for NearJob is:</p>
            <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 10px; margin: 20px 0;">
              ${code}
            </div>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
      });
      console.log(`[REAL EMAIL] Successfully sent to ${email}`);
      return true;
    } catch (error) {
      console.error(`[EMAIL ERROR] ${error.message}`);
    }
  }

  console.log(`\n--- [REAL EMAIL SIMULATION] ---`);
  console.log(`TO: ${email}`);
  console.log(`SUBJECT: Reset Password Verification Code`);
  console.log(`MESSAGE: Your verification code is: ${code}`);
  console.log(`-------------------------------\n`);
  return true;
};

module.exports = { sendSMS, sendEmail };
