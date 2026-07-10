const express = require("express");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());

/* -------------------- CONFIG -------------------- */

const PORT = 5000;
const JWT_SECRET = "secret123"; // change later
const uri = "YOUR_MONGODB_URI"; // replace

const client = new MongoClient(uri);

let db;

/* -------------------- CONNECT DB -------------------- */

async function connectDB() {
  await client.connect();
  db = client.db("ecommerce");
  console.log("MongoDB Connected");
}
connectDB();

/* -------------------- MIDDLEWARE -------------------- */

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid Token" });
  }
};

/* -------------------- AUTH APIs -------------------- */

// Register / Guest Create
app.post("/api/auth/register", async (req, res) => {
  const user = {
    ...req.body,
    password: req.body.password || "default@123",
    createdAt: new Date(),
  };

  const result = await db.collection("users").insertOne(user);

  const token = jwt.sign({ id: result.insertedId }, JWT_SECRET);

  res.json({ user, token });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await db.collection("users").findOne({ email });

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET);

  res.json({ user, token });
});

/* -------------------- PRODUCT APIs -------------------- */

app.get("/api/products", async (req, res) => {
  const products = await db.collection("products").find().toArray();
  res.json(products);
});

app.get("/api/products/:id", async (req, res) => {
  const product = await db.collection("products").findOne({
    _id: new ObjectId(req.params.id),
  });
  res.json(product);
});

app.post("/api/products", async (req, res) => {
  const result = await db.collection("products").insertOne(req.body);
  res.json(result);
});

app.put("/api/products/:id", async (req, res) => {
  await db.collection("products").updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );
  res.json({ message: "Updated" });
});

app.delete("/api/products/:id", async (req, res) => {
  await db.collection("products").deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.json({ message: "Deleted" });
});

/* -------------------- CART APIs -------------------- */

app.get("/api/cart/:userId", async (req, res) => {
  const cart = await db
    .collection("cart")
    .find({ userId: req.params.userId })
    .toArray();

  res.json(cart);
});

app.post("/api/cart", async (req, res) => {
  const { userId, productId } = req.body;

  const existing = await db.collection("cart").findOne({
    userId,
    productId,
  });

  if (existing) {
    await db.collection("cart").updateOne(
      { _id: existing._id },
      { $inc: { quantity: 1 } }
    );
  } else {
    await db.collection("cart").insertOne({
      userId,
      productId,
      quantity: 1,
    });
  }

  res.json({ message: "Cart updated" });
});

app.delete("/api/cart/:id", async (req, res) => {
  await db.collection("cart").deleteOne({
    _id: new ObjectId(req.params.id),
  });

  res.json({ message: "Removed" });
});

/* -------------------- ORDER APIs -------------------- */

app.post("/api/orders", async (req, res) => {
  const order = {
    ...req.body,
    status: "pending",
    createdAt: new Date(),
  };

  const result = await db.collection("orders").insertOne(order);

  res.json(result);
});

app.get("/api/orders/:userId", async (req, res) => {
  const orders = await db
    .collection("orders")
    .find({ "user.id": req.params.userId })
    .toArray();

  res.json(orders);
});

/* -------------------- PAYMENT (bKash MOCK) -------------------- */

// create payment request
app.post("/api/payment/create", async (req, res) => {
  const { amount } = req.body;

  res.json({
    paymentURL: `/payment-page?amount=${amount}`,
  });
});

// verify payment (manual entry)
app.post("/api/payment/verify", async (req, res) => {
  const { trxId, amount } = req.body;

  if (!trxId) {
    return res.status(400).json({ message: "Transaction ID required" });
  }

  res.json({
    success: true,
    message: "Payment verified",
  });
});

/* -------------------- SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});