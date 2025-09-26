const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: Date, required: true }, // [cite: 10]
  description: { type: String, required: true }, // [cite: 11]
  amount: { type: Number, required: true }, // [cite: 12]
  payee: { type: String, required: true }, // [cite: 13]
  category: { type: String, required: true }, // [cite: 14]
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);