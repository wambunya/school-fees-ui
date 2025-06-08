const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  invoiceId: Number,
  phoneNumber: String,
  amount: Number,
  status: { type: String, enum: ["PAID", "FAILED", "PENDING"], default: "PENDING" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
