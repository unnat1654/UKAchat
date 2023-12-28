import { Router } from "express";
import { isLoggedIn } from "../middlewares/authMiddlewares.js";
import {
  createRoomController,
  getAllContactsController,
  getContactsController,
} from "../controllers/contactController.js";

const router = Router();

//create a room to share and store messages
router.post("/create-room", isLoggedIn, createRoomController);

//get the 20 users along with their required information who last sent a message to user. (sorted in descending order according to recent message)
router.get("/get-contacts", isLoggedIn, getContactsController);

//get all the users who ever sent/recieved message to/from the user (sorted in descending order according to recent message)
router.get("/get-all-contacts", isLoggedIn, getAllContactsController);

export default router;
