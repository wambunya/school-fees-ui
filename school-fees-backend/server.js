const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Payment = require("./models/Payment");
const { auth, requireRole } = require("./middleware/auth");

const JWT_SECRET = "supersecretkey"; // In production, use env vars!

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*", // Update this with your frontend origin if needed
  },
});

// Middleware
app.use(cors());
app.use(express.json());

/* ------------------------ 🔐 AUTH ROUTES ------------------------ */

// Signup
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || "parent",
    });

    res.json({ message: "User created", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Signup error", error: err.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

/* ------------------------ 💳 PAYMENT ROUTES ------------------------ */

// STK Push simulation and saving to DB
app.post("/api/payments/stkpush", async (req, res) => {
  const { invoiceId, phoneNumber } = req.body;

  try {
    const newPayment = await Payment.create({
      invoiceId,
      phoneNumber,
      amount: 1000, // Replace with actual invoice amount if needed
      status: "PENDING",
    });

    console.log(`📲 STK Push initiated for Invoice ${invoiceId} to ${phoneNumber}`);

    // Simulated payment confirmation after 5 seconds
    setTimeout(async () => {
      newPayment.status = "PAID";
      await newPayment.save();

      console.log(`💰 Payment confirmed for Invoice ${invoiceId}`);

      io.to(`invoice-${invoiceId}`).emit("paymentUpdate", {
        invoiceId,
        status: newPayment.status,
      });
    }, 5000);

    res.json({ message: "STK Push initiated", paymentId: newPayment._id });
  } catch (err) {
    console.error("❌ Error processing payment:", err);
    res.status(500).json({ message: "Error initiating STK Push" });
  }
});

// Protected: Get all payments (admin only)
app.get("/api/admin/payments", auth, requireRole("admin"), async (req, res) => {
  try {
    const payments = await Payment.find({});
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments" });
  }
});

/* ------------------------ 🔌 SOCKET.IO ------------------------ */

io.on("connection", (socket) => {
  console.log("🔌 Client connected");

  socket.on("joinInvoiceRoom", (invoiceId) => {
    socket.join(`invoice-${invoiceId}`);
    console.log(`📦 Joined room: invoice-${invoiceId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

/* ------------------------ 🔗 DATABASE + SERVER ------------------------ */

mongoose.connect("mongodb://127.0.0.1:27017/school_fees", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("✅ Connected to MongoDB");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
