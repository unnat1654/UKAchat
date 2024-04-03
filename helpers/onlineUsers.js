import { client } from "../config/init_redis.js";
class onlineUsers {
  #hashname = "onlineUsers";

  async setOnline(userId) {
    if (!userId) {
      throw {
        error: "Error while setting user online",
        message: "UserId not provided",
      };
    }
    await client.HSETNX(this.#hashname, userId, "");
  }

  async setOffline(userId) {
    if (!userId) {
      throw {
        error: "Error while setting user offline",
        message: "UserId not provided",
      };
    }
    await client.HDEL(this.#hashname, userId);
  }

  async isOnline(userId) {
    if (!userId) {
      throw {
        error: "Error while checking online status",
        message: "UserId not provided",
      };
    }
    let online = await client.HEXISTS(this.#hashname, String(userId));
    return online == 1;
  }
}

export default new onlineUsers();
