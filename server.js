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

// Stores stars count: { "targetUserId": count }
const starDatabase = {};
// Stores who gave stars: { "targetUserId": [giverId1, giverId2, ...] }
const giversDatabase = {};
// Stores unique votes to prevent duplicates: { "targetUserId_giverId": true }
const userVotes = {};

// GET: Fetch total stars for a user
app.get('/get-stars/:userId', (req, res) => {
  const userId = req.params.userId;
  const stars = starDatabase[userId] || 0;
  res.status(200).json({ userId, stars });
});

// GET: Fetch list of users who gave a star
app.get('/get-givers/:targetUserId', (req, res) => {
  const targetUserId = req.params.targetUserId;
  const givers = giversDatabase[targetUserId] || [];
  res.status(200).json({ givers });
});

// POST: Add a star
app.post('/add-star', (req, res) => {
  const { targetUserId, giverId } = req.body;
  if (!targetUserId || !giverId) {
    return res.status(400).json({ error: 'Missing targetUserId or giverId' });
  }

  const voteKey = `${targetUserId}_${giverId}`;

  if (userVotes[voteKey]) {
    return res.status(400).json({ error: 'You have already given a star to this user!', stars: starDatabase[targetUserId] || 0 });
  }

  // Register vote
  userVotes[voteKey] = true;
  starDatabase[targetUserId] = (starDatabase[targetUserId] || 0) + 1;

  if (!giversDatabase[targetUserId]) {
    giversDatabase[targetUserId] = [];
  }
  giversDatabase[targetUserId].push(giverId);
  
  console.log(`⭐ Star added for User ID ${targetUserId} by ${giverId}. Total: ${starDatabase[targetUserId]}`);
  res.status(200).json({ success: true, stars: starDatabase[targetUserId] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Star system server running on port ${PORT}`);
});
