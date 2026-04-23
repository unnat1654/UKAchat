import createClient from "ioredis";

export const redisClient = new createClient(process.env.REDIS_HOST);

redisClient.on("connect", () => {
  console.log("Connected to redis server...");
});
redisClient.on("ready", () => {
  console.log("Redis server is Up and Ready...".bgYellow.red);
});
redisClient.on("error", (err) => {
  console.log(`${err.message}`.bgRed.black);
});
redisClient.on("end", () => {
  console.log("Redis server disconnected".bgYellow.red);
});

process.on("SIGINT", () => {
  redisClient.quit();
});
