const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user-controller');

// Handles POST requests (Register a user)
router.post('/register', UserController.users_register_user);

//Retrieve all namecards of a user, return username, name and organization/school
router.post('/cards', UserController.users_get_cards_info);

//Retrieve cardId of user
router.post('/cardId', UserController.users_get_card_id);

// User Login
router.post('/login', UserController.users_login);

// Gets username of a specific user
router.post("/username", UserController.users_get_username);

// Retrive friends of a specific user
router.get("/:uid/friends/", UserController.users_get_friends);

// Check if card exists for that user, if not then update to array
router.post("/findCards", UserController.users_find_cards);

// Check for 2fa
router.get("/check2fa/:fatoken", UserController.users_2fa);


module.exports = router;
