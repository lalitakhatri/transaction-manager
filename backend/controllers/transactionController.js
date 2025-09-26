const Transaction = require('../models/Transaction');

// @route   GET /transactions
// @desc    Get all transactions with pagination and filtering
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'date', order = 'desc', fromDate, toDate } = req.query;

    // Base query
    const query = {};

    // Role-based filtering: Admins see all, users see their own
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    // Search filter
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { payee: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filter
    if (fromDate || toDate) {
        query.date = {};
        if(fromDate) query.date.$gte = new Date(fromDate);
        if(toDate) query.date.$lte = new Date(toDate);
    }

    const sortOptions = {};
    if (sortBy) {
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    }

    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalRecords = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      data: transactions,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      totalRecords,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /transactions
// @desc    Create a transaction
exports.createTransaction = async (req, res) => {
    const { date, description, amount, payee, category } = req.body;
    try {
        const newTransaction = new Transaction({
            user: req.user.id,
            date,
            description,
            amount,
            payee,
            category,
        });
        const transaction = await newTransaction.save();
        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /transactions/:id
// @desc    Update a transaction
exports.updateTransaction = async (req, res) => {
    const { date, description, amount, payee, category } = req.body;

    const transactionFields = { date, description, amount, payee, category };

    try {
        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

        // Make sure user owns the transaction OR is an admin
        if (transaction.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { $set: transactionFields },
            { new: true }
        );

        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /transactions/:id
// @desc    Delete a transaction
exports.deleteTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

        // Make sure user owns the transaction OR is an admin
        if (transaction.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Transaction.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Transaction removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};