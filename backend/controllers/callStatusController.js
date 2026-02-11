const {updateCallLog} = require('../services/callLogServices');

const getCallStatus = async (req, res) => {
    try {
        console.log("webhooks response recieved ", req.query);
        const userId = req.params.id;
        
        const {CallSid, CallStatus, CallDuration} = req.query;
            const callLogData = {
                callSid: CallSid,
                call_Status: CallStatus,
                duration: CallDuration || 0,
            }
            console.log("update kar rha hu details on webhook ---- ");
            await updateCallLog(userId, callLogData);

        const io = req.app.get('io');
        
        if(io && CallSid){
            io.to(CallSid).emit('call-status', {   
                callSid: CallSid,
                callStatus: CallStatus,
                duration: CallDuration || 0,
            });
            console.log(`Emitting call status to ${CallSid}: ${CallStatus}`);
        }
        return res.status(200).send('OK');
        
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(200).send('OK');
    }
}

module.exports = {
    getCallStatus
};