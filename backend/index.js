
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. CORS AND MIDDLEWARE
// ==========================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://depfront.vercel.app",
  "https://blog-8p23hg6vk-noorthowfiq-ux1.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow direct API requests without an Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Simple health-check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Blog Portfolio API is running.",
  });
});

// ==========================================
// 2. FIREBASE ADMIN INITIALIZATION
// ==========================================

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, "firebaseServiceAccountKey.json");

let firebaseInitialized = false;

try {
  const serviceAccount = require(serviceAccountPath);

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  firebaseInitialized = true;
  console.log("Firebase Admin initialized successfully.");
} catch (err) {
  console.error(
    "Firebase Admin initialization failed:",
    err.message
  );
}

// ==========================================
// 3. MONGODB CONNECTION
// ==========================================

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not configured.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ==========================================
// 4. BLOG SCHEMA
// ==========================================

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

// ==========================================
// 5. FIREBASE TOKEN VERIFICATION
// ==========================================

async function verifyFirebaseToken(req, res, next) {
  if (!firebaseInitialized) {
    return res.status(503).json({
      message: "Authentication service is unavailable.",
    });
  }

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
    return next();
  } catch (err) {
    console.error(
      "Firebase token verification failed:",
      err.message
    );

    return res.status(401).json({
      message: "Invalid or expired login. Please sign in again.",
    });
  }
}

// ==========================================
// 6. ADMIN AUTHORIZATION
// ==========================================

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
    console.warn("Admin authorization failed.");

    return res.status(403).json({
      message:
        "This account is not authorized to manage blog posts. Sign in with your configured administrator account.",
    });
  }

  return next();
}

// ==========================================
// 7. PUBLIC: GET ALL BLOGS
// ==========================================

app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ _id: -1 });

    return res.status(200).json(blogs);
  } catch (err) {
    console.error("Could not load blogs:", err.message);

    return res.status(500).json({
      message: "Could not load blogs.",
    });
  }
});

// ==========================================
// 8. PUBLIC: LIKE A BLOG
// ==========================================

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

    return res.status(200).json(blog);
  } catch (err) {
    console.error("Could not like blog:", err.message);

    const status = err.name === "CastError" ? 400 : 500;

    return res.status(status).json({
      message: "Could not like this blog.",
    });
  }
});

// ==========================================
// 9. ADMIN ONLY: CREATE A BLOG
// ==========================================

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

// ==========================================
// 10. ADMIN ONLY: UPDATE A BLOG
// ==========================================

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
        {
          new: true,
          runValidators: true,
        }
      );

      if (!blog) {
        return res.status(404).json({
          message: "Blog not found.",
        });
      }

      return res.status(200).json(blog);
    } catch (err) {
      console.error("Could not update blog:", err.message);

      const status = err.name === "CastError" ? 400 : 500;

      return res.status(status).json({
        message: "Could not update blog.",
      });
    }
  }
);

// ==========================================
// 11. ADMIN ONLY: DELETE A BLOG
// ==========================================

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

      return res.status(200).json({
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

// ==========================================
// 12. START SERVER
// ==========================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
