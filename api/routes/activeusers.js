const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const ActiveUsersController = require('../controllers/active-user-controller');

// Handles DELETE requests (Remove entry from database)
router.post('/logout/:uid', checkAuth, ActiveUsersController.active_users_logout);

module.exports = router;
