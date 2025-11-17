const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Helper: 어떤 값이 들어와도 문자열로 강제 변환
function toSafeString(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

// 이미지 폴더
const UNCLASSIFIED_DIR = path.join(__dirname, "images", "unclassified");
const CLASSIFIED_DIR = path.join(__dirname, "images", "classified");

// 이미지 제공
app.get("/images/:filename", (req, res) => {
  const filename = toSafeString(req.params.filename);
  const filePath = path.join(UNCLASSIFIED_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Image not found");
  }

  res.sendFile(filePath);
});

// 무작위 이미지
app.get("/random", (req, res) => {
  const files = fs.readdirSync(UNCLASSIFIED_DIR).filter(f => {
    return f.toLowerCase().endsWith(".jpg") || f.toLowerCase().endsWith(".png");
  });

  if (files.length === 0) {
    return res.status(404).send("No images left");
  }

  const random = files[Math.floor(Math.random() * files.length)];
  res.json({
    filename: random,
    url: `/images/${random}`
  });
});

// 파일 이동
app.post("/move", (req, res) => {
  const filename = toSafeString(req.body.filename);
  const category = toSafeString(req.body.category);

  if (!filename || !category) {
    return res.status(400).send("filename and category required");
  }

  const sourcePath = path.join(UNCLASSIFIED_DIR, filename);
  const targetDir = path.join(CLASSIFIED_DIR, category);

  if (!fs.existsSync(sourcePath)) {
    return res.status(404).send("File not found");
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const destPath = path.join(targetDir, filename);

  fs.rename(sourcePath, destPath, err => {
    if (err) return res.status(500).send("Error moving file");
    res.send("OK");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
