const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const StudentController = require('../controllers/student-controller');

// Handles POST requests (Create a student name card)
router.post('/create', StudentController.stu_create_card);

module.exports = router;
