require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =====================
   CORS CONFIGURATION
===================== */
const allowedOrigins = [
  "https://zexario-frontend.onrender.com",
  "https://www.zexario.com",
  "https://zexario.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server, Postman, etc.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
};

// Enable CORS
app.use(cors(corsOptions));

// Handle preflight
app.options("*", cors(corsOptions));

/* =====================
   MIDDLEWARE
===================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================
   MONGODB CONNECTION
===================== */
mongoose
  .connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

/* =====================
   ORDER SCHEMA
===================== */
const orderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  paymentMethod: String,
  cart: Array,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);

/* =====================
   CHECKOUT ROUTE
===================== */
app.post("/checkout", async (req, res) => {
  try {
    const { name, email, phone, address, city, paymentMethod, cart } = req.body;

    if (!cart || !cart.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const order = new Order({ 
      name, 
      email, 
      phone, 
      address, 
      city, 
      paymentMethod, 
      cart 
    });

    await order.save();

    console.log("🧾 Order saved");
    res.status(200).json({ message: "Order placed successfully" });

  } catch (error) {
    console.error("❌ Checkout Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   ROOT TEST ROUTE
===================== */
app.get("/", (req, res) => {
  res.send("Zexario Backend Running");
});

/* =====================
   START SERVER
===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
