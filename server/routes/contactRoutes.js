import { Router } from "express";
import { isLoggedIn } from "../middlewares/authMiddlewares.js";
import {
  getRoomController,
  getAllContactsController,
  searchContactContoller,
  getPublicKeyController,
} from "../controllers/contactController.js";

const router = Router();

//find contact from _id
router.get("/search-contact/:contactId", isLoggedIn, searchContactContoller);

//create a room to share and store messages if it does not exist else share the exist id
router.get("/get-room/:contactId", isLoggedIn, getRoomController);

//get all the users who ever sent/received message to/from the user (sorted in descending order according to recent message)
router.get("/get-all-contacts", isLoggedIn, getAllContactsController);

// get the rooms who need the contact's public key
router.get("/get-public-key", isLoggedIn, getPublicKeyController);

export default router;
