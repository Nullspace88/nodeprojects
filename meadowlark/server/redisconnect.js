//const RedisStore = require('connect-redis')(expressSession)
const redis = require('redis')
const { credentials } = require('./config')
const redisClient = redis.createClient({url: credentials.redis.url})

async function initRedis() {
    //console.log("reidsClient: " + redisClient)
    redisClient.on('error', (err) => console.error('Redis client error', err))
    if (!redisClient.isOpen) {
        await redisClient.connect()
        console.log('Redis connected: ' + redisClient)
    }
    return redisClient
}

initRedis().catch(console.error)

module.exports = { initRedis }