const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const starDatabase = {};
const giversDatabase = {}; 
const userVotes = {};

app.get('/get-stars/:userId', (req, res) => {
  const userId = req.params.userId;
  const stars = starDatabase[userId] || 0;
  res.status(200).json({ userId, stars });
});

app.get('/get-givers/:targetUserId', (req, res) => {
  const targetUserId = req.params.targetUserId;
  const page = parseInt(req.query.page) || 1;
  const limit = 50;

  const allGivers = giversDatabase[targetUserId] || [];
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedGivers = allGivers.slice(startIndex, endIndex);

  res.status(200).json({
    givers: paginatedGivers,
    hasMore: endIndex < allGivers.length
  });
});

app.post('/add-star', (req, res) => {
  const { targetUserId, giverId, giverUsername, isVerified } = req.body;
  if (!targetUserId || !giverId) {
    return res.status(400).json({ error: 'Missing targetUserId or giverId' });
  }

  const voteKey = `${targetUserId}_${giverId}`;

  // אפשור למנהל הראשי לתת כמה כוכבים שירצה או לעקוף חסימות אם נדרש
  if (giverId !== "3696650661" && userVotes[voteKey]) {
    return res.status(400).json({ error: 'You have already given a star!', stars: starDatabase[targetUserId] || 0 });
  }

  userVotes[voteKey] = true;
  starDatabase[targetUserId] = (starDatabase[targetUserId] || 0) + 1;

  if (!giversDatabase[targetUserId]) {
    giversDatabase[targetUserId] = [];
  }

  giversDatabase[targetUserId].unshift({
    userId: giverId,
    username: giverUsername || `User_${giverId}`,
    isVerified: !!isVerified
  });
  
  res.status(200).json({ success: true, stars: starDatabase[targetUserId] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Star system server running on port ${PORT}`);
});
