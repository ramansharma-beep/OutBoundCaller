const pool = require("../config/dbConfig");
const {redisClient} = require('../config/redisConfig');
const saveCallLog = async (userId, callLogData) => {

    const {callSid, fromNumber, toNumber, call_Status, duration} = callLogData;
    const cachedKey = `call_logs:${userId}`;
    try{
        const [result] = await pool.execute('INSERT INTO call_logs ( user_id, call_sid, from_number, to_number, status, duration) VALUES (?,?,?,?,?,?)', [userId, callSid, fromNumber, toNumber, call_Status, duration]);
        try{            
          await redisClient.del(cachedKey);
          console.log('cache invalidated successfully');
        }
        catch(error){
            console.warn('Error invalidating call logs cache', error);
        }
        return result.insertId; 
    }
    catch(error){
        throw error;
    }
}
const updateCallLog = async (userId, callLogData) => {
  const { callSid, call_Status, duration } = callLogData;
  const cachedKey = `call_logs:${userId}`;
  try {
    const [result] = await pool.execute(
      'UPDATE call_logs SET status = ?, duration = ? WHERE user_id = ? AND call_sid = ?',
      [call_Status, duration, userId, callSid]
    );
    try{
      await redisClient.del(cachedKey);
      console.log('cache invalidated successfully');
    }
    catch(error){
      console.warn('Error invalidating cache for call logs', error);
    }
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