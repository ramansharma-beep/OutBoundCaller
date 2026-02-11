const express = require('express');
const router = express.Router();

const { makeCall, endCall } = require('../controllers/callController');
const {getCallLogs, deleteCallLog} = require('../controllers/callLogController');
const {login, signup} = require('../controllers/authController');
const {getCallStatus} = require('../controllers/callStatusController');
const authenticateToken = require('../middleware/authMiddleWare'); 

router.post('/login', login);
 
router.post('/signup', signup);

router.post('/make-call',authenticateToken, makeCall);

router.post('/end-call', authenticateToken, endCall);

router.get('/call-logs', authenticateToken, getCallLogs);

router.delete('/delete-call-log/:callSid', authenticateToken, deleteCallLog);

router.get('/call-status/:id', getCallStatus);

module.exports = router;
