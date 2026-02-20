const pool = require('../config/dbConfig');
const {redisClient} = require('../config/redisConfig');
const getCallLogs = async (req, res) => {   
    try{
        const {userId} = req.user;
        const cachedKey = `call_logs:${userId}`;
        try{
            const cachedLogs = await redisClient.get(cachedKey);
            if(cachedLogs){
                console.log('cache hit');
                return res.status(200).json({
                    success: true,
                    logs: JSON.parse(cachedLogs),
                })
            }
        }
        catch(error){
            console.warn('Error fetching call logs from cache', error);
        }
        const [logs] = await pool.execute(
            `SELECT id, call_sid, from_number, to_number, status, duration, created_at FROM call_logs WHERE user_id = ? AND is_deleted = FALSE ORDER BY created_at DESC`,
            [userId]
          );

          try{
            await redisClient.set(cachedKey, JSON.stringify(logs), {EX: 300});
          }
          catch(error){
            console.warn('Error caching call logs', error);
          }
        return res.status(200).json({
            success: true,
            message: "Call logs fetched successfully",
            logs,
        })
    }
    catch(error){
        console.log("Error in fetching call logs", error);
        return res.status(500).json({
            error: "Failed to fetch call logs",
        })
    }
}

const deleteCallLog = async (req, res) => {
   try{
    const {userId} = req.user;
    const {callSid} = req.params;
    const cachedKey = `call_logs:${userId}`;
    if(!callSid){
        return res.status(400).json({
            success: false,
            message: "Call SID is required",
        })
    }
    const [result] = await pool.execute('UPDATE call_logs SET is_deleted = TRUE WHERE user_id = ? AND call_sid = ?', [userId, callSid]); // cant have another person deleting call records of someone else;
    console.log('deleted call log result---- ',result);
    if(result.affectedRows === 0){ 
        return res.status(400).json({
            success: false,
            message: "call log not found or already deleted",
        })
      }
      try{
        await redisClient.del(cachedKey);
        console.log('cache invalidated successfully');
      }
      catch(error){
        console.warn('Error deleting call logs from cache', error);
      }
      return res.status(200).json({
           success: true,
           message: "Call log deleted successfully",
        })
    }
    catch(error){
        console.log("Error in deleting call log", error);
        return res.status(500).json({
            error: "Failed to delete call logs",
        })
    }
}

module.exports = {
    getCallLogs,
    deleteCallLog,
}