const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  asset: { type: String, required: true },  // Representa o ativo (ex: BTC, AAPL, etc.)
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['open', 'executed', 'canceled'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  executedAt: { type: Date }
});

module.exports = mongoose.model('Order', OrderSchema);
