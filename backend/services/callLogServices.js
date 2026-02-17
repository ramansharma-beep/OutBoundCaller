const pool = require("../config/dbConfig");

const saveCallLog = async (userId, callLogData) => {

    const {callSid, fromNumber, toNumber, call_Status, duration} = callLogData;

    try{
        const [result] = await pool.execute('INSERT INTO call_logs ( user_id, call_sid, from_number, to_number, status, duration) VALUES (?,?,?,?,?,?)', [userId, callSid, fromNumber, toNumber, call_Status, duration]);
        return result.insertId; 
    }
    catch(error){
        throw error;
    }
}
const updateCallLog = async (userId, callLogData) => {
  const { callSid, call_Status, duration } = callLogData;
  try {
    const [result] = await pool.execute(
      'UPDATE call_logs SET status = ?, duration = ? WHERE user_id = ? AND call_sid = ?',
      [call_Status, duration, userId, callSid]
    );
    return result.affectedRows;
  } catch (error) {
    throw error;
  }
};


const updateCallLogByCallSid = async (callSid, callLogData) => {
  const { call_Status, duration } = callLogData;
  try {
    const [result] = await pool.execute(
      'UPDATE call_logs SET status = ?, duration = ? WHERE call_sid = ?',
      [call_Status, duration, callSid]
    );
    return result.affectedRows;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  saveCallLog,
  updateCallLog,
  updateCallLogByCallSid,
};