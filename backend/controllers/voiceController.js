const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const agentJoin = async (req, res) => {

  try {
    const phoneNumber = req.body?.phoneNumber;
    const userId = req.body?.userId;
    console.log('twiml will make a call at this number', phoneNumber);
    const e164Regex = /^\+[1-9]\d{1,14}$/;

    if (!phoneNumber || !e164Regex.test(phoneNumber)) {
      throw new Error('Invalid phone number format. Please use E.164 format (e.g., +1234567890)');
    }
    const twiml = new VoiceResponse();
    const actionUrl = `${process.env.PUBLIC_WEBHOOK_URL}/api/call-events`;
    const callerId = process.env.TWILIO_PHONE_NUMBER;
    const statusCallbackUrl = userId ? `${process.env.PUBLIC_WEBHOOK_URL}/api/call-status/${encodeURIComponent(userId)}` : `${process.env.PUBLIC_WEBHOOK_URL}/api/call-status`;
    const dial = twiml.dial({ action: actionUrl, timeout: 30, callerId });

    dial.number(
        { statusCallback: statusCallbackUrl,
          statusCallbackMethod: 'POST',
          statusCallbackEvent: 'initiated ringing answered completed',
        },
        phoneNumber);

        res.type('text/xml');
        res.status(200).send(twiml.toString());
  } catch (error) {
    console.log('Error in agent joining call', error);
    const twiml = new VoiceResponse();
    twiml.say('Sorry, something went wrong. Please try again later.');
    twiml.hangup();
    res.type('text/xml');
    res.status(200).send(twiml.toString());
  }
};

const callEvents = (req, res) => {
  const twiml = new VoiceResponse();
  twiml.hangup();
  res.type('text/xml');
  res.status(200).send(twiml.toString());
};

module.exports = {
  agentJoin,
  callEvents,
};