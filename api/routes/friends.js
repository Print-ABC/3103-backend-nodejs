const express = require('express');
const router = express.Router();

const FriendController = require('../controllers/friend-controller');

// Handles GET requests (Retrieve all requests with a given requester uid)
router.get('/req/:uid', FriendController.friend_get_requests_requester);

// Handles GET requests (Retrieve all requests with a given recipient uid)
router.get('/recp/:uid', FriendController.friend_get_requests_recipient);

// Handles POST requests (Create a new friend request)
router.post('/:uid', FriendController.friend_post_request);

// Handles POST requests (Adds a new friend to friendlist)
router.post("/update/add", FriendController.update_friendlist_add);

// Handles POST requests (Removes an existing friend from friendlist)
router.post("/update/remove", FriendController.update_friendlist_remove);

// Handles DELETE requests (Delete a request with a given recipient uid)
router.delete('/:uid/:id', FriendController.friend_delete_request);

module.exports = router;
