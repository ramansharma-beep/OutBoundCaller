const { client, validateTwilioConfig } = require('../config/twilioConfig');


const endCall = async (req, res) => {
  try {
    const { callSid } = req.body;

    if (!callSid) {
      return res.status(400).json({
        error: 'Call SID is required'
      });
    }

    if (!validateTwilioConfig() || !client){
      return res.status(500).json({
        success: false,
        error: 'Twilio credentials not configured. Please check your .env file.'
      });
    }

       await client.calls(callSid).update({ status: 'completed' });
      // console.log('call update response-----', res);

    return res.status(200).json({
      success: true,
      message: 'Call ended successfully',
      callSid: callSid
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
  endCall,
};
