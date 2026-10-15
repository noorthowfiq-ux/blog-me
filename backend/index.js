
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin initialization
const serviceAccount = require("./firebaseServiceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/blogDB")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

// Blog schema
const blogSchema = new mongoose.Schema({
  newTitle: { type: String, required: true, trim: true },
  newContent: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString() },
  likes: { type: Number, default: 0, min: 0 },
});

const Blog = mongoose.model("Blog", blogSchema);

// Verify Firebase login token
async function verifyFirebaseToken(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Please sign in to continue.",
      });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired login. Please sign in again.",
    });
  }
}

// Allow only the configured administrator
function requireAdmin(req, res, next) {
  const adminUid = process.env.ADMIN_UID;

  if (!adminUid) {
    return res.status(500).json({
      message: "Admin account is not configured on the server.",
    });
  }

  if (req.user.uid !== adminUid) {
    return res.status(403).json({
      message: "Administrator access required.",
    });
  }

  next();
}

// PUBLIC: Get all blogs
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ _id: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Could not load blogs." });
  }
});

// PUBLIC: Like a blog
app.patch("/api/blogs/like/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    res.json(blog);
  } catch (err) {
    const status = err.name === "CastError" ? 400 : 500;
    res.status(status).json({ message: "Could not like this blog." });
  }
});

// ADMIN ONLY: Create a blog
app.post(
  "/api/blogs",
  verifyFirebaseToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { newTitle, newContent } = req.body;

      if (
        typeof newTitle !== "string" ||
        !newTitle.trim() ||
        typeof newContent !== "string" ||
        !newContent.trim()
      ) {
        return res.status(400).json({
          message: "A title and content are required.",
        });
      }

      const blog = await Blog.create({
        newTitle: newTitle.trim(),
        newContent: newContent.trim(),
        date: new Date().toISOString(),
        likes: 0,
      });

      res.status(201).json(blog);
    } catch (err) {
      res.status(500).json({ message: "Could not create blog." });
    }
  }
);

// ADMIN ONLY: Update a blog
app.put(
  "/api/blogs/:id",
  verifyFirebaseToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { newTitle, newContent } = req.body;

      if (
        typeof newTitle !== "string" ||
        !newTitle.trim() ||
        typeof newContent !== "string" ||
        !newContent.trim()
      ) {
        return res.status(400).json({
          message: "A title and content are required.",
        });
      }

      const blog = await Blog.findByIdAndUpdate(
        req.params.id,
        {
          newTitle: newTitle.trim(),
          newContent: newContent.trim(),
        },
        { new: true, runValidators: true }
      );

      if (!blog) {
        return res.status(404).json({ message: "Blog not found." });
      }

      res.json(blog);
    } catch (err) {
      const status = err.name === "CastError" ? 400 : 500;
      res.status(status).json({ message: "Could not update blog." });
    }
  }
);

// ADMIN ONLY: Delete a blog
app.delete(
  "/api/blogs/:id",
  verifyFirebaseToken,
  requireAdmin,
  async (req, res) => {
    try {
      const blog = await Blog.findByIdAndDelete(req.params.id);

      if (!blog) {
        return res.status(404).json({ message: "Blog not found." });
      }

      res.json({ message: "Blog deleted successfully." });
    } catch (err) {
      const status = err.name === "CastError" ? 400 : 500;
      res.status(status).json({ message: "Could not delete blog." });
    }
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});