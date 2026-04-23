import { redisClient } from "../config/redis_config.js";
import { findOnlineContacts } from "./contactHelpers.js";

class onlineUsers {
  async setOnlineGetContacts(userId, socketId) {
    this.setOnline(userId, socketId);
    const { activeUserRooms, onlineContacts } = await findOnlineContacts(
      userId
    );
    const contactSocketIds = await this.getSocketIds(onlineContacts);
    return { activeUserRooms, onlineContacts, contactSocketIds };
  }

  async setOnline(userId, socketId) {
    if (!userId) {
      throw {
        error: "Error while setting user online",
        message: "UserId not provided",
      };
    }
    await redisClient.set(`onlineUsers:${userId}`, socketId);
  }

  async getSocketIds(contactIdArray) {
    const contactSocketIds = await Promise.all(
      contactIdArray.map(async (contactId) => {
        return await redisClient.get(`onlineUsers:${contactId}`);
      })
    );
    return contactSocketIds;
  }

  async setOffline(userId) {
    if (!userId) {
      throw {
        error: "Error while setting user offline",
        message: "UserId not provided",
      };
    }
    await redisClient.del(`onlineUsers:${userId}`);
    const { activeUserRooms } = await findOnlineContacts(userId);
    return activeUserRooms;
  }

  async isOnline(userId) {
    if (!userId) {
      throw {
        error: "Error while checking online status",
        message: "UserId not provided",
      };
    }
    let online = await redisClient.exists(`onlineUsers:${userId}`);
    return online == 1;
  }
}

export default new onlineUsers();
