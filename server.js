import express from "express";
import cors from "cors";

const app = express();
const PORT = 8088;

app.use(cors());
app.use(express.json());

let votes = { support: 1, oppose: 1 };
const voters = new Set(); // basit IP temelli oy sınırlayıcı
const visitors = new Set(); // IP temelli ziyaretçi sınırlayıcı

app.post("/vote", (req, res) => {
    const { vote } = req.body;
    const ip = req.ip;

    if (voters.has(ip)) {
        return res.status(403).json({ message: "You already voted." });
    }

    if (vote === "support" || vote === "oppose") {
        votes[vote]++;
        voters.add(ip);
        return res.json({ success: true });
    }

    return res.status(400).json({ message: "Invalid vote." });
});

app.get("/results", (req, res) => {
    const ip = req.ip;

    if (!visitors.has(ip)) {
        visitors.add(ip);
    }

    res.json({
        votes: votes,
        visitors: visitors.size,
        message: "Thank you for your visit!",
    });
});

app.post("/change-side", (req, res) => {
    const { vote } = req.body;
    const ip = req.ip;

    if (!voters.has(ip)) {
        return res.status(403).json({ message: "You have not voted yet." });
    }

    if (vote === "support" || vote === "oppose") {
        votes[vote]++;
        const otherVote = vote === "support" ? "oppose" : "support";
        votes[otherVote]--;
        return res.json({ success: true });
    }

    return res.status(400).json({ message: "Invalid vote." });
});

app.listen(PORT, () => {
    console.log(`🎉 Server running on http://localhost:${PORT}`);
});
