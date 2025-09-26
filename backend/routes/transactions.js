const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');

// All routes here are protected
router.use(auth);

// @route   POST /transactions
// @desc    Create a transaction
router.post('/', createTransaction); // [cite: 22]

// @route   GET /transactions
// @desc    Get all transactions for a user
router.get('/', getTransactions); // [cite: 20]

// @route   PUT /transactions/:id
// @desc    Update a transaction
router.put('/:id', updateTransaction); // [cite: 23]

// @route   DELETE /transactions/:id
// @desc    Delete a transaction
router.delete('/:id', deleteTransaction); // [cite: 24]

module.exports = router;