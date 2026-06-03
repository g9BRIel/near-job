require('dotenv').config();
const { sendSMS } = require('./utils/sendOTP');

const testNumber = process.argv[2];

if (!testNumber) {
    console.error("❌ Please provide a phone number. Example: node test-sms.js 0612345678");
    process.exit(1);
}

const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

console.log(`🚀 Testing SMS sending to: ${testNumber}`);
console.log(`🔑 Using SID: ${process.env.TWILIO_SID ? '✅ Found' : '❌ MISSING'}`);
console.log(`🔑 Using TOKEN: ${process.env.TWILIO_TOKEN ? '✅ Found' : '❌ MISSING'}`);
console.log(`🔑 Using FROM: ${process.env.TWILIO_PHONE ? '✅ Found' : '❌ MISSING'}`);

sendSMS(testNumber, randomCode)
    .then(success => {
        if (success) {
            console.log("\n✅ The script finished its job.");
            console.log("Check your phone! If it's NOT there, look at the terminal for errors above.");
        }
    })
    .catch(err => {
        console.error("💥 CRITICAL ERROR:", err.message);
    });
