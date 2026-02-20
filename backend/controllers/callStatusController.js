const twilio = require('twilio');
const { updateCallLog, saveCallLog } = require('../services/callLogServices');
function validateTwilioSignature(req) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;
  const signature = req.headers['x-twilio-signature'] || req.headers['X-Twilio-Signature'];
  if (!signature) return false;
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
  const host = req.get('host') || '';
  const url = `${protocol}://${host}${req.originalUrl}`;
  return twilio.validateRequest(authToken, signature, url, req.body);
}

const getCallStatus = async (req, res) => {
  try {
    if (!validateTwilioSignature(req)) {
      console.error('Call status webhook: invalid Twilio signature');
      return res.status(403).send('Forbidden');
    }
    const { ParentCallSid, CallSid, CallStatus, CallDuration } = req.body;

    const userId = req.params.userId;

    const callSidForRoom = ParentCallSid || CallSid;
    
    if (!callSidForRoom) {
      return res.status(200).send('OK');
    }

    const io = req.app.get('io');
    if (io && callSidForRoom) {
      io.to(callSidForRoom).emit('call-status', {
        callSid: callSidForRoom,
        callStatus: CallStatus || '',
        duration: CallDuration || 0,
      });
    }

    if (userId) {
      if ((CallStatus || '').toLowerCase() === 'initiated') {
        const callLogData = {
          callSid: callSidForRoom,
          fromNumber: req.body.From || process.env.TWILIO_PHONE_NUMBER,
          toNumber: req.body.To || '',
          call_Status: CallStatus,
          duration: CallDuration || 0,
        };
        await saveCallLog(userId, callLogData);
      } else {
        const callLogData = {
          callSid: callSidForRoom,
          call_Status: CallStatus,
          duration: CallDuration || 0,
        };
        await updateCallLog(userId, callLogData);
      }
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(200).send('OK');
  }
};

module.exports = {
  getCallStatus,
};
