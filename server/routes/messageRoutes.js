import { Router } from "express";
import { isLoggedIn } from "../middlewares/authMiddlewares.js";
import {
  getMessagesController,
  saveBulkMessagesController,
  sendMessageController,
} from "../controllers/messageController.js";

const router = Router();

//save messages in conversations
router.post("/save-backup-messages", isLoggedIn, saveBulkMessagesController);

//send offline Message
router.post("/send-message-api", isLoggedIn, sendMessageController);

//get 200 messages in a batch from a contact
router.get("/get-messages", isLoggedIn, getMessagesController);

export default router;
