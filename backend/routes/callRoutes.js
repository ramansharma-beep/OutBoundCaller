const express = require('express');
const router = express.Router();
const { endCall } = require('../controllers/callController');
const {getCallLogs, deleteCallLog} = require('../controllers/callLogController');
const {login, signup} = require('../controllers/authController');
const {getCallStatus} = require('../controllers/callStatusController');
const authenticateToken = require('../middleware/authMiddleWare'); 
const { agentJoin, childJoinConference, dialAction } = require('../controllers/voiceController');
const {getToken} =  require('../controllers/tokenController');
const {holdCall, unholdCall} = require('../controllers/holdController');
router.post('/login', login);
 
router.post('/signup', signup);

router.post('/end-call', authenticateToken, endCall);

router.get('/call-logs', authenticateToken, getCallLogs);

router.delete('/delete-call-log/:callSid', authenticateToken, deleteCallLog);

router.post('/call-status/:userId', getCallStatus);

router.get('/getToken', authenticateToken, getToken);

router.post('/agent-join', agentJoin);

router.post('/call-events', childJoinConference);

router.post('/dial-action', dialAction);

router.post('/hold-call', authenticateToken, holdCall);

router.post('/unhold-call', authenticateToken, unholdCall);

module.exports = router;
