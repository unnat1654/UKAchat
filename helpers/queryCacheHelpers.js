import { redisClient } from "../config/init_redis.js";

class queryCahce {
  async set(key, value, timeSec) {
    if (!key) {
      throw new Error("Arguments missing in query cache set method.");
    }
    if (!timeSec) {
      await redisClient.set(key, JSON.stringify(value), "EX", 10); //expires in 10sec
      return;
    }
    if (!+timeSec) {
      throw new Error("timeSec parameter is a number type");
    }
    await redisClient.set(key, JSON.stringify(value), "EX", timeSec);
  }
  async get(key) {
    try {
      return JSON.parse(await redisClient.get(key));
    } catch (error) {
      return null;
    }
  }
  async exists(key) {
    const exist = await redisClient.EXISTS(key);
    return exist > 0;
  }
}

export default new queryCahce();
