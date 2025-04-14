import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 8088;
const DB_FILE = "./data.json";

app.use(cors());
app.use(express.json());

// Kalıcı veriyi oku
const readVotes = () => {
    try {
        const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
        return {
            support: data.support || 0,
            oppose: data.oppose || 0,
            voters: new Set(data.voters || []),
            visitors: new Set(data.visitors || []),
        };
    } catch {
        return {
            support: 0,
            oppose: 0,
            voters: new Set(),
            visitors: new Set(),
        };
    }
};

// Kalıcı veriyi kaydet
const saveVotes = (votes, voters, visitors) => {
    const data = {
        support: votes.support,
        oppose: votes.oppose,
        voters: Array.from(voters),
        visitors: Array.from(visitors),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data), "utf-8");
};

const stored = readVotes();
let votes = { support: stored.support, oppose: stored.oppose };
let allVoters = stored.voters;
let all_visitors = stored.visitors;

app.post("/vote", (req, res) => {
    const { vote } = req.body;
    const ip = req.ip;

    if (allVoters.has(ip)) {
        return res.status(403).json({ message: "You already voted." });
    }

    if (vote === "support" || vote === "oppose") {
        votes[vote]++;
        allVoters.add(ip);
        saveVotes(votes, allVoters, all_visitors);
        return res.json({ success: true });
    }

    return res.status(400).json({ message: "Invalid vote." });
});

app.get("/results", (req, res) => {
    const ip = req.ip;
    if (!all_visitors.has(ip)) {
        all_visitors.add(ip);
        saveVotes(votes, allVoters, all_visitors);
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