const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register); // [cite: 16]

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login); // [cite: 17]

module.exports = router;