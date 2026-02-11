require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Initialize Twilio client directly
const client = (accountSid && authToken && accountSid.startsWith('AC'))
  ? twilio(accountSid, authToken)
  : null;

module.exports = {
  client,
  getTwilioPhoneNumber: () => process.env.TWILIO_PHONE_NUMBER,
  validateTwilioConfig: () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    return !!(
      accountSid &&
      authToken &&
      phoneNumber &&
      accountSid.startsWith('AC')
    );
  }
};
