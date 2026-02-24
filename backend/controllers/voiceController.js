const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;
const { isParentInHoldFlow, removeParentFromHoldFlow } = require('../store/callState');

const agentJoin = async (req, res) => {
  try {
    const phoneNumber = req.body?.phoneNumber;
    const userId = req.body?.userId;
    const e164Regex = /^\+[1-9]\d{1,14}$/;

    if (!phoneNumber || !e164Regex.test(phoneNumber)) {
      throw new Error('Invalid phone number format. Please use E.164 format (e.g., +1234567890)');
    }
    const twiml = new VoiceResponse();
    const dialActionUrl = `${process.env.PUBLIC_WEBHOOK_URL}/api/dial-action`;
    const callerId = process.env.TWILIO_PHONE_NUMBER;
    const statusCallbackUrl = userId ? `${process.env.PUBLIC_WEBHOOK_URL}/api/call-status/${encodeURIComponent(userId)}` : `${process.env.PUBLIC_WEBHOOK_URL}/api/call-status`;
    const dial = twiml.dial({ action: dialActionUrl, timeout: 30, callerId });

    dial.number(
        { statusCallback: statusCallbackUrl,
          statusCallbackMethod: 'POST',
          statusCallbackEvent: 'initiated ringing answered completed',
        },
        phoneNumber);

    res.type('text/xml');
    res.status(200).send(twiml.toString());
  } catch (error) {
    console.error('Error in agent joining call', error);
    const twiml = new VoiceResponse();
    twiml.say('Sorry, something went wrong. Please try again later.');
    twiml.hangup();
    res.type('text/xml');
    res.status(200).send(twiml.toString());
  }
};

const childJoinConference = (req, res) => {
  const conferenceName = req.query.conferenceName;
  if (!conferenceName) {
    const twiml = new VoiceResponse();
    twiml.hangup();
    res.type('text/xml');
    return res.status(200).send(twiml.toString());
  }
  const twiml = new VoiceResponse();
  const dial = twiml.dial();
  dial.conference({
    startConferenceOnEnter: true,
    endConferenceOnExit: true
    }, conferenceName);

  res.type('text/xml');
  res.status(200).send(twiml.toString());
};

const dialAction = (req, res) => {
  const twiml = new VoiceResponse();
  const parentCallSid = req.body.CallSid;

  if (isParentInHoldFlow(parentCallSid)) { // condition to check if child call is in conference or not 
    removeParentFromHoldFlow(parentCallSid);

    const dial = twiml.dial();
    const conferenceName = String(parentCallSid);
    dial.conference({
    startConferenceOnEnter: true,
    endConferenceOnExit: true
    }, conferenceName);

   } else {
    const message = req.body.DialCallStatus;
    if (message) twiml.say({ voice: 'alice' }, `Call ended. ${message}`);
    twiml.hangup();
  }

  res.type('text/xml');
  res.status(200).send(twiml.toString());
};

module.exports = {
  agentJoin,
  childJoinConference,
  dialAction,
};
