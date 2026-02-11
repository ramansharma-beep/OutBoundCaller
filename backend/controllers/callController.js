const { client, getTwilioPhoneNumber, validateTwilioConfig } = require('../config/twilioConfig');
const {saveCallLog, updateCallLog} = require('../services/callLogServices');
const pool = require('../config/dbConfig');

// Make a call
const makeCall = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }

    let formattedNumber = phoneNumber.replace(/[^\d+]/g, ''); 

    const e164Regex = /^\+[1-9]\d{1,14}$/;

    if (!e164Regex.test(formattedNumber)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Please use E.164 format (e.g., +1234567890)'
      });
    }

    if (!validateTwilioConfig() || !client) {
        return res.status(500).json({
        success: false,
        error: 'Twilio credentials not configured. Please check your .env file.'
      });
    }
    const webhookUrl = `${process.env.PUBLIC_WEBHOOK_URL}/api/call-status/${req.user.userId}`;
    console.log("Webhook URL:", webhookUrl);
    // Make the call using Twilio 
    const call = await client.calls.create({
      to: formattedNumber,
      from: getTwilioPhoneNumber(),
      url: 'http://demo.twilio.com/docs/voice.xml',
      statusCallback: webhookUrl,
      statusCallbackEvent: [
        "initiated",
        "ringing",
        "answered",
        "completed",
      ],
      statusCallbackMethod: 'GET'
    });
      // console.log("call created successfully", call);
    try{  
      const callLogData = {
        callSid: call.sid,
        fromNumber: call.from,
        toNumber: call.to,
        call_Status: call.status,
        duration: call.duration,
      }
       const callLogId = await saveCallLog(req.user.userId, callLogData);

       console.log('Call log saved successfully with ID:', callLogId);
    }
    catch(error){
      console.error('call Made but error in saving call log:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save call log',
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      callSid: call.sid,
      status: call.status,
      message: 'Call initiated successfully'
    });

  } catch (error) {
    console.error('Error making call:', error);
    return res.status(500).json({
      error: 'Failed to make call',
      message: error.message
    });
  }
};

const endCall = async (req, res) => {
  try {
    const { callSid } = req.body;

    if (!callSid) {
      return res.status(400).json({
        error: 'Call SID is required'
      });
    }

    if (!validateTwilioConfig() || !client) {
      return res.status(500).json({
        success: false,
        error: 'Twilio credentials not configured. Please check your .env file.'
      });
    }

    // Verify the call belongs to the user before proceeding
    const [callLogRows] = await pool.execute(
      'SELECT call_sid FROM call_logs WHERE user_id = ? AND call_sid = ? AND is_deleted = FALSE',
      [req.user.userId, callSid]
    );

    if (callLogRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Call not found or you do not have permission to end this call'
      });
    }
   
    try {
      await client.calls(callSid).update({ status: 'completed' });
    } catch (err) {
      console.log(`Note: Could not update call status for ${callSid} (likely already ended)`);
    }

    const finalCall = await client.calls(callSid).fetch();
     const callLogData = {
      callSid: finalCall.sid,
      call_Status: finalCall.status,
      duration: finalCall.duration,
    }

   try{
        await updateCallLog(req.user.userId, callLogData);
        console.log(`Call log updated successfully with id ${callSid}`);
     }
     catch(error){

      console.error(`Error updating call log with id ${callSid}`, error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update call log',
        message: error.message
      });
     }

    return res.status(200).json({
      success: true,
      message: 'Call ended successfully',
      status: finalCall.status,
      duration: finalCall.duration,
      to: finalCall.to,
      from: finalCall.from
    });

  } catch (error) {
    console.error('Error ending call:', error);
    return res.status(500).json({
      error: 'Failed to retrieve call details',
      message: error.message
    });
  }
};


module.exports = {
  makeCall,
  endCall
};
