require('dotenv').config();
const {createClient} = require('redis');

const redisUrl = process.env.REDIS_URL;

const redisClient = createClient({
    url: redisUrl,
});

redisClient.on('error', (err) => {
    console.log('Redis error', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

async function connectRedis() {
    try{
        await redisClient.connect();
    }
    catch(error){
        console.log('Error connecting to Redis', error);
    }
}

module.exports = { redisClient, connectRedis };