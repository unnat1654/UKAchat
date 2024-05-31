import { Router } from "express";
import { isLoggedIn } from "../middlewares/authMiddlewares.js";
import {
  getRoomController,
  getAllContactsController,
  getContactsController,
  searchContactContoller,
} from "../controllers/contactController.js";

const router = Router();


//find contact from _id
router.get("/search-contact/:contactId", isLoggedIn, searchContactContoller);

//create a room to share and store messages if it does not exist else share the exist id
router.get("/get-room/:contactId", isLoggedIn, getRoomController);

//get the 20 users along with their required information who last sent a message to user. (sorted in descending order according to recent message)
router.get("/get-contacts", isLoggedIn, getContactsController);

//get all the users who ever sent/received message to/from the user (sorted in descending order according to recent message)
router.get("/get-all-contacts", isLoggedIn, getAllContactsController);

export default router;
