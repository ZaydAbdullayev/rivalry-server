import express from "express";
import cors from "cors";

const app = express();
const PORT = 8088;

app.use(cors());
app.use(express.json());

let votes = { support: 0, oppose: 0 };
const allVoters = new Set(); // basit IP temelli oy sınırlayıcı
const all_visitors = new Set(); // IP temelli ziyaretçi sınırlayıcı

app.post("/vote", (req, res) => {
    const { vote } = req.body;
    const ip = req.ip;

    if (allVoters.has(ip)) {
        return res.status(403).json({ message: "You already voted." });
    }

    if (vote === "support" || vote === "oppose") {
        votes[vote]++;
        allVoters.add(ip);
        return res.json({ success: true });
    }

    return res.status(400).json({ message: "Invalid vote." });
});

app.get("/results", (req, res) => {
    const ip = req.ip;

    if (!all_visitors.has(ip)) {
        all_visitors.add(ip);
    }

    res.json({
        votes: votes,
        visitors: all_visitors.size,
        message: "Thank you for your visit!",
    });
});

app.listen(PORT, () => {
    console.log(`🎉 Server running on http://localhost:${PORT}`);
});
