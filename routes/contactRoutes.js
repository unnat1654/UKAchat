import { Router } from "express";
import { isLoggedIn } from "../middlewares/authMiddlewares.js";
import {
  createRoomController,
  getAllContactsController,
  getContactOnlineController,
  getContactsController,
  searchContactContoller,
  stayOnlineController,
} from "../controllers/contactController.js";

const router = Router();

//set the user to online or offline in userModel
router.patch("/stay-online", isLoggedIn, stayOnlineController);

//find contact from _id
router.get("/search-contact/:contactId", isLoggedIn, searchContactContoller);

//get if a contact is online
router.get("/get-online/:contactId", isLoggedIn, getContactOnlineController);

//create a room to share and store messages if it does not exist else share the exist id
router.post("/create-room", isLoggedIn, createRoomController);

//get the 20 users along with their required information who last sent a message to user. (sorted in descending order according to recent message)
router.get("/get-contacts", isLoggedIn, getContactsController);

//get all the users who ever sent/received message to/from the user (sorted in descending order according to recent message)
router.get("/get-all-contacts", isLoggedIn, getAllContactsController);

export default router;
