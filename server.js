const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 정적 파일 제공 (index.html 포함)
app.use(express.static(__dirname));

// 이미지 목록 불러오기 API
app.get("/images", (req, res) => {
    const folder = path.join(__dirname, "unclassified");

    fs.readdir(folder, (err, files) => {
        if (err) return res.status(500).json({ error: "폴더 읽기 실패" });

        // 이미지 파일만 필터링
        const imageFiles = files.filter(f =>
            f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".jpeg")
        );

        res.json(imageFiles);
    });
});

// 이미지 이동 API
app.post("/move", (req, res) => {
    const { filename, label } = req.body;

    const src = path.join(__dirname, "unclassified", filename);
    const destFolder = path.join(__dirname, "classified", label);

    // 폴더 없으면 자동 생성
    if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder);

    const dest = path.join(destFolder, filename);

    fs.rename(src, dest, (err) => {
        if (err) return res.status(500).json({ error: "이동 실패" });
        res.json({ message: "이동 완료" });
    });
});

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log("📡 Server running at http://localhost:3000");
});
