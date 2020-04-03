const express = require('express');
const router = express.Router();

const OrgController = require('../controllers/organization-controller');

// Handles POST requests (Create an organization name card)
router.post('/create', OrgController.org_create_card);

// Handles GET requests for an organization card(Retrieve info from one card)
router.get('/:uid/:cardId', OrgController.org_get_one);

module.exports = router;
