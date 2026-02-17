const { client } = require("../config/twilioConfig");
const { addParentInHoldFlow } = require("../store/callState");

const holdCall = async (req, res) => {
    try{
        const {parentCallSid} = req.body;
        if(!parentCallSid){
            return res.status(400).json({
                success:false,
                message:"Parent Call SID is required",
            })
        }
        if(!client){
            return res.status(500).json({
                success:false,
                message:"Twilio client not initialized",
            })
        }

        const childCalls = await client.calls.list({
            parentCallSid: parentCallSid,
            status: 'in-progress',
        });

        if(childCalls.length === 0){
            return res.status(400).json({
                success:false,
                message:"Child call not found",
            })
        }
        const childCallSid = childCalls[0].sid;

        const conferences = await client.conferences.list({
            friendlyName: parentCallSid,
            status: 'in-progress',
        });
        const conference = conferences[0];

        if (conference) {
            const participants = await client.conferences(conference.sid).participants.list();
            const childParticipant = participants.find((p) => p.callSid === childCallSid);
            if (childParticipant) {
                await client.conferences(conference.sid).participants(childCallSid).update({
                    hold: true,
                });
                return res.status(200).json({
                    success: true,
                    message: "Child call held successfully",
                });
            }
        }

        addParentInHoldFlow(parentCallSid);
        await client.calls(childCallSid).update({
            url: `${process.env.PUBLIC_WEBHOOK_URL}/api/call-events?conferenceName=${parentCallSid}`
        });
        await new Promise((r) => setTimeout(r, 1000));
        const conferencesAfter = await client.conferences.list({
            friendlyName: parentCallSid,
            status: 'in-progress',
        });
        const conferenceAfter = conferencesAfter[0];
        if(conferenceAfter){
            const conferenceSid = conferenceAfter.sid;
            await client.conferences(conferenceSid).participants(childCallSid).update({
                hold: true,
            });
        }
        else{
            throw new Error('Conference not found');
        }
        return res.status(200).json({
            success:true,
            message:"Child call held successfully",
        })
    }
    catch(error){
        console.error('Error in holding call', error);
        return res.status(500).json({
            success:false,
            message:"Failed to hold call",
        })
    }
}

const unholdCall = async (req, res) => {
    try{
        const {parentCallSid} = req.body;   
        if(!parentCallSid){
            return res.status(400).json({
                success:false,
                message:"Parent Call SID is required",
            })
        }
        if(!client){
            return res.status(500).json({
                success:false,
                message:"Twilio client not initialized",
            })
        }

        const conferences = await client.conferences.list({
            friendlyName: parentCallSid,
            status: 'in-progress',
        })
        if(conferences.length === 0){
            return res.status(400).json({
                success:false,
                message:"Conference not found",
            })
        }
        const conferenceSid = conferences[0].sid;
        const participants = await client.conferences(conferenceSid).participants.list();

        if(participants.length === 0){
            return res.status(400).json({
                success:false,
                message:"Participant not found",
            })
        }
        const childCall = participants.find((p) => p.callSid !== parentCallSid);

        if(!childCall){
            return res.status(400).json({
                success:false,
                message:"Child call not found",
            })
        }
        const childCallSid = childCall.callSid;
        await client.conferences(conferenceSid).participants(childCallSid).update({
            hold: false,
        });

        return res.status(200).json({
            success:true,
            message:"Child call unheld successfully",
        })
    }
    catch(error){
        console.error('Error in unholding call', error);
        return res.status(500).json({
            success:false,
            message:"Failed to unhold call",
        })
    }
}

module.exports = {
    holdCall,
    unholdCall
}