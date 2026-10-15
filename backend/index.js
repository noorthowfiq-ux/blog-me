
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin initialization
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, "firebaseServiceAccountKey.json");

const serviceAccount = require(serviceAccountPath);

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// MongoDB connection
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not configured.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Blog schema
const blogSchema = new mongoose.Schema({
  newTitle: {
    type: String,
    required: true,
    trim: true,
  },
  newContent: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: () => new Date().toISOString(),
  },
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const Blog = mongoose.model("Blog", blogSchema);

// Verify Firebase ID token
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
    console.error("Firebase token verification failed:", err.message);

    return res.status(401).json({
      message: "Invalid or expired login. Please sign in again.",
    });
  }
}

// Allow only the configured administrator
function requireAdmin(req, res, next) {
  const adminUid = process.env.ADMIN_UID;

  if (!adminUid || !adminUid.trim()) {
    console.error("ADMIN_UID is not configured.");

    return res.status(500).json({
      message: "Admin account is not configured on the server.",
    });
  }

  const authenticatedUid = req.user?.uid;

  if (
    typeof authenticatedUid !== "string" ||
    authenticatedUid.trim() !== adminUid.trim()
  ) {
    // Do not log UIDs, passwords, or authentication tokens.
    console.warn("Admin authorization mismatch:", {
      uidMatches: false,
      authenticatedUidLength:
        typeof authenticatedUid === "string"
          ? authenticatedUid.length
          : 0,
      configuredUidLength: adminUid.trim().length,
    });

    return res.status(403).json({
      message:
        "This account is not authorized to manage blog posts. Sign in with your configured administrator account.",
    });
  }

  console.log("Admin authorization successful");
  next();
}

// PUBLIC: Get all blog posts
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ _id: -1 });
    return res.json(blogs);
  } catch (err) {
    console.error("Could not load blogs:", err.message);

    return res.status(500).json({
      message: "Could not load blogs.",
    });
  }
});

// PUBLIC: Like a blog post
app.patch("/api/blogs/like/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found.",
      });
    }

    return res.json(blog);
  } catch (err) {
    console.error("Could not like blog:", err.message);

    const status = err.name === "CastError" ? 400 : 500;

    return res.status(status).json({
      message: "Could not like this blog.",
    });
  }
});

// ADMIN ONLY: Create a blog post
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

      return res.status(201).json(blog);
    } catch (err) {
      console.error("Could not create blog:", err.message);

      return res.status(500).json({
        message: "Could not create blog.",
      });
    }
  }
);

// ADMIN ONLY: Update a blog post
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
        return res.status(404).json({
          message: "Blog not found.",
        });
      }

      return res.json(blog);
    } catch (err) {
      console.error("Could not update blog:", err.message);

      const status = err.name === "CastError" ? 400 : 500;

      return res.status(status).json({
        message: "Could not update blog.",
      });
    }
  }
);

// ADMIN ONLY: Delete a blog post
app.delete(
  "/api/blogs/:id",
  verifyFirebaseToken,
  requireAdmin,
  async (req, res) => {
    try {
      const blog = await Blog.findByIdAndDelete(req.params.id);

      if (!blog) {
        return res.status(404).json({
          message: "Blog not found.",
        });
      }

      return res.json({
        message: "Blog deleted successfully.",
      });
    } catch (err) {
      console.error("Could not delete blog:", err.message);

      const status = err.name === "CastError" ? 400 : 500;

      return res.status(status).json({
        message: "Could not delete blog.",
      });
    }
  }
);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
