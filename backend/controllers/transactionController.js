const Transaction = require('../models/Transaction');

// @route   POST /transactions [cite: 22]
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

// @route   GET /transactions [cite: 20]
// @desc    Get all transactions for a user with pagination and filtering
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'date', order = 'desc', fromDate, toDate } = req.query; // [cite: 21]

    const query = { user: req.user.id };

    // Search filter [cite: 21]
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { payee: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filter [cite: 21]
    if (fromDate || toDate) {
        query.date = {};
        if(fromDate) query.date.$gte = new Date(fromDate);
        if(toDate) query.date.$lte = new Date(toDate);
    }

    const sortOptions = {};
    if (sortBy) {
        sortOptions[sortBy] = order === 'asc' ? 1 : -1; // [cite: 21]
    }

    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalRecords = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    // [cite: 26]
    res.json({
      data: transactions, // [cite: 28]
      page: parseInt(page), // [cite: 29]
      limit: parseInt(limit), // [cite: 30]
      totalPages, // [cite: 31]
      totalRecords, // [cite: 32]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /transactions/:id [cite: 23]
// @desc    Update a transaction
exports.updateTransaction = async (req, res) => {
    const { date, description, amount, payee, category } = req.body;

    const transactionFields = { date, description, amount, payee, category };
    
    try {
        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

        // Make sure user owns the transaction
        if (transaction.user.toString() !== req.user.id) {
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

// @route   DELETE /transactions/:id [cite: 24]
// @desc    Delete a transaction
exports.deleteTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

        // Make sure user owns the transaction
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Transaction.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Transaction removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};