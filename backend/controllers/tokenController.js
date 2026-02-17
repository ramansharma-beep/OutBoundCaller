const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;


const getToken = async (req, res) => {
    try{
        const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioApiKey = process.env.TWILIO_API_KEY_SID;
        const twilioApiSecret = process.env.TWILIO_API_KEY_SECRET;

        const outgoingApplicationSid = process.env.TWILIO_TWIML_APP_SID;
        const identity = 'user';

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: outgoingApplicationSid,
            incomingAllow: true, 
          });

        const token = new AccessToken(
            twilioAccountSid,
            twilioApiKey,
            twilioApiSecret,
            {identity: identity}
          );
          token.addGrant(voiceGrant);
          return res.status(200).json({
            success: true,
            token: token.toJwt(),
            userId: req.user.userId,
          })

    }
    catch(error){
        console.log("Error in getting the token", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get the token",
        })
    }

}

module.exports = {
    getToken
}
