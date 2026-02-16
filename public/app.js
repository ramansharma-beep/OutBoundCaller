// Check authentication on page load
const Device = Twilio.Device;

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) {
        return;
    }
    

    document.getElementById('logoutBtn').addEventListener('click', () => {
        auth.logout();
    });

    initializeDialer();     
    intitalizeDevice();

    socket = io(window.location.origin);

    socket.on('call-status', (data) =>{
        console.log('emitted events recieved');

        console.log('Call status received frontend : ', data);

        if(data.callSid !== currentCallSid){
             return;
        }
        const callStatus = ( data.callStatus || '' ).toLowerCase();
        console.log("callStatus here is -- ",callStatus);
        const message = statusMessages[callStatus] || callStatus;
        console.log("message here is -- ",message);
        showStatus(message);

        if( callStatus == "completed" || callStatus == "busy" || callStatus == "no-answer"){
            console.log("the updated status here is  --- ", callStatus);
            showCallResult({
                duration: parseInt(data.duration, 10) || 0,
                status: callStatus,
            });
            socket.emit('leave-call', { callSid: data.callSid });
            setLoadingState(false);
            currentCallSid = null;
        }
        
    });
});

const statusMessages = {
    "initiated": 'Call initiated',
    "ringing": 'Ringing…',
    "in-progress": 'In progress',
    "completed" : 'Call completed'
  };

let currentCallSid = null;
let currentUserId = null;
let socket = null;
let device = null;
let phoneNumberInput, makeCallBtn, endCallBtn, statusDiv, callInfoDiv, callStatusSpan, callDurationSpan, durationItem;

function initializeDialer() {
    phoneNumberInput = document.getElementById('phoneNumber');
    makeCallBtn = document.getElementById('makeCallBtn');
    endCallBtn = document.getElementById('endCallBtn');
    statusDiv = document.getElementById('status');
    callInfoDiv = document.getElementById('callInfo');
    callStatusSpan = document.getElementById('callStatus');
    callDurationSpan = document.getElementById('callDuration');
    durationItem = document.getElementById('durationItem');
    
    makeCallBtn.addEventListener('click', makeCall);
    endCallBtn.addEventListener('click', endCall);
    phoneNumberInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            makeCall();
        }
    });
    
    phoneNumberInput.addEventListener('input', () => {
        if (statusDiv.classList.contains('visible') && (statusDiv.classList.contains('error') || statusDiv.classList.contains('success'))) {
            hideStatus();
        }
    });
}

async function intitalizeDevice(){
    try{
        const tokenResponse = await fetch('/api/getToken',{
            headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        });

        if(tokenResponse.status === 401){
            auth.logout();
            return;
        }
        const tokenData = await tokenResponse.json();
        if(tokenData.success){
            const token = tokenData.token;
            if(tokenData.userId != null){
                currentUserId = tokenData.userId;
            }
            // console.log("token for twilio device is ---- ", token);
            device  = new Device(token);
            device.on('error', (error) =>{
                console.error('Device error:', error);
                showStatus('Error initializing the device');
            })
            device.on('registered' , ()=>{
                console.log('Device registered successfully');
            })

            device.on("incoming", (call) => {
                console.log("Incoming call...");
                call.accept();
                showStatus('Incoming Call accepted', 'success');
              });
            await device.register();
        }
        else{
            throw new Error(tokenData.message || "Failed to get the token");
        }
    }
    catch(error){
        console.log("Error in intitalizing the dialer", error);
    }
}
const statusColors = {
    completed: '#10b981', 
    failed: '#ef4444',    
    'no-answer': '#f59e0b', 
    canceled: '#94a3b8',   
    busy: '#ef4444',
    queued: '#3b82f6',    
    ringing: '#3b82f6',
    'in-progress': '#3b82f6'
};



async function makeCall() {
    const phoneNumber = phoneNumberInput.value.trim();

    if (!phoneNumber) {
        showStatus('Please enter a phone number', 'error');
        return;
    }
    const e164Regex = /^\+[1-9]\d{1,14}$/; 
    if (!e164Regex.test(phoneNumber)) {
        showStatus('Invalid format. Use E.164 (e.g., +1234567890)', 'error');
        return;
    }

    setLoadingState(true);
    // showStatus('Initiating call...', 'info');
    callInfoDiv.style.display = 'none';

    try {
        let call = await device.connect({
            params: {
              phoneNumber: phoneNumber,
              userId: currentUserId != null ? String(currentUserId) : undefined
            }
          });
          showStatus('Call initiated successfully!', 'success');
          console.log('twilio device sdk call object here gives -- ', call);
        
          call.on('ringing', () =>{
           console.log('call is ringing-----');
           currentCallSid = call.parameters.CallSid;
           console.log('currentCallSid-----', currentCallSid);
        if(socket){
            console.log('joining call-----', currentCallSid);
            socket.emit('join-call', {callSid: currentCallSid});
        }
         showStatus('Call initiated successfully!', 'success');
         endCallBtn.disabled = false;
       })

    } catch (error) {
        console.error('Error making call:', error);
        showStatus(error.message, 'error: please reload to try again');
        setLoadingState(false);
    }
}

async function endCall() {
    if (!currentCallSid) {
        showStatus('No active call to end', 'error');
        return;
    }

    endCallBtn.disabled = true;
    showStatus('Ending call...', 'info');

    try {
        const response = await fetch('/api/end-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
            body: JSON.stringify({ callSid: currentCallSid }),
        });

        if (response.status === 401) {
            auth.logout();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to end call');
        }

        showStatus('Call Cancelled', 'success');
        // currentCallSid = null;
        setLoadingState(false);

    } catch (error) {
        console.error('Error ending call:', error);
        showStatus(error.message, 'error');
        endCallBtn.disabled = false; 
    }
}

function showCallResult(data) {
    const status = data.status || 'unknown';
    const duration = data.duration || 0;

    callStatusSpan.textContent = status.toUpperCase();
    callStatusSpan.style.backgroundColor = statusColors[status] || statusColors.canceled;

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    callDurationSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    durationItem.style.display = 'flex'; 
    callInfoDiv.style.display = 'block';
}

function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type} visible`;
}

function hideStatus() {
    statusDiv.classList.remove('visible');
}

function setLoadingState(isCalling) {
    if (isCalling) {
        makeCallBtn.disabled = true;
        endCallBtn.disabled = true;
        phoneNumberInput.disabled = true;
    } else {
        makeCallBtn.disabled = false;
        endCallBtn.disabled = true;
        phoneNumberInput.disabled = false;
    }
}
