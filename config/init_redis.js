import { createClient } from "redis";

export const redisClient = createClient({
    port: process.env.REDIS_PORT,
    host: `${process.env.REDIS_HOST}`
});

redisClient.on("connect",()=>{
    console.log("Connected to redis server...");
});
redisClient.on("ready",()=>{
    console.log("Redis server is Up and Ready...".bgYellow.red);
});
redisClient.on("error",(err)=>{
    console.log(`${err.message}`.bgRed.black);
    redisClient.quit();
});
redisClient.on("end",()=>{
    console.log("Redis server disconnected".bgYellow.red);
    
});

process.on("SIGINT",()=>{
    redisClient.quit();
});

export const connectRedis = async ()=>{
    try {
        await redisClient.connect();
    } catch (error) {
    }
};