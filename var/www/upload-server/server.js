// ============================================================
// VPS Upload Server — deploy this on your Hostinger VPS
// Save as: /var/www/upload-server/server.js
//
// Setup on VPS:
//   mkdir -p /var/www/upload-server/uploads
//   cd /var/www/upload-server
//   npm init -y
//   npm install express multer cors dotenv
//   node server.js   (or use pm2: pm2 start server.js)
//
// Nginx config (add to your site's server block):
//   location /media/ {
//     alias /var/www/upload-server/uploads/;
//     add_header Access-Control-Allow-Origin *;
//   }
//   location /api/ {
//     proxy_pass http://localhost:4000;
//   }
//
// .env file on VPS:
//   API_KEY=your_secret_key_here
//   PORT=4000
//   BASE_URL=https://yourvps.com
// ============================================================

require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.API_KEY || "changeme";
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const UPLOAD_DIR = path.join(__dirname, "uploads");

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/media", express.static(UPLOAD_DIR));

// ── Auth middleware ───────────────────────────────────────────
function requireKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ── Multer storage ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Organise by type: uploads/images/ or uploads/videos/
    const isVideo = file.mimetype.startsWith("video/");
    const subDir = path.join(UPLOAD_DIR, isVideo ? "videos" : "images");
    fs.mkdirSync(subDir, { recursive: true });
    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "video/mp4", "video/webm", "video/quicktime",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// ── POST /api/upload ──────────────────────────────────────────
// Field name: "file" (single file)
// Returns: { url, filename, size, type }
app.post("/api/upload", requireKey, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const isVideo = req.file.mimetype.startsWith("video/");
  const subPath = isVideo ? "videos" : "images";
  const url = `${BASE_URL}/media/${subPath}/${req.file.filename}`;

  return res.json({
    url,
    filename: req.file.filename,
    size: req.file.size,
    type: isVideo ? "video" : "image",
  });
});

// ── DELETE /api/delete ────────────────────────────────────────
// Body: { url: "https://yourvps.com/media/images/filename.jpg" }
app.delete("/api/delete", requireKey, (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });

  try {
    // Extract relative path from URL
    const relativePath = url.replace(`${BASE_URL}/media/`, "");
    const filePath = path.join(UPLOAD_DIR, relativePath);

    // Security: make sure we're not escaping the upload dir
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return res.status(400).json({ error: "Invalid path" });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ success: true, message: "File deleted" });
    } else {
      return res.status(404).json({ error: "File not found" });
    }
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: "Failed to delete file" });
  }
});

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Upload server running on port ${PORT}`);
  console.log(`Files served at ${BASE_URL}/media/`);
});