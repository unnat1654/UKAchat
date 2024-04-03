import { createClient } from "redis";

export const client = createClient({
    port: process.env.REDIS_PORT,
    host: `${process.env.REDIS_HOST}`
});

client.on("connect",()=>{
    console.log("Connected to redis server...");
});
client.on("ready",()=>{
    console.log("Redis server is Up and Ready...".bgYellow.red);
});
client.on("error",(err)=>{
    console.log(`${err.message}`.bgRed.black);
    client.quit();
});
client.on("end",()=>{
    console.log("Redis server disconnected".bgYellow.red);
    
});

process.on("SIGINT",()=>{
    client.quit();
});

export const connectRedis = async ()=>{
    try {
        await client.connect();
    } catch (error) {
    }
};