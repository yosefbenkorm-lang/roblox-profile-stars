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

// Stores stars: { "targetUserId": count }
const starDatabase = {};
// Stores who gave a star: { "targetUserId_giverId": true }
const userVotes = {};

app.get('/get-stars/:userId', (req, res) => {
  const userId = req.params.userId;
  const stars = starDatabase[userId] || 0;
  res.status(200).json({ userId, stars });
});

app.post('/add-star', (req, res) => {
  const { targetUserId, giverId } = req.body;
  if (!targetUserId || !giverId) {
    return res.status(400).json({ error: 'Missing targetUserId or giverId' });
  }

  const voteKey = `${targetUserId}_${giverId}`;

  // Check if this user already gave a star to this profile
  if (userVotes[voteKey]) {
    return res.status(400).json({ error: 'You have already given a star to this user!', stars: starDatabase[targetUserId] || 0 });
  }

  // Register vote and increment
  userVotes[voteKey] = true;
  starDatabase[targetUserId] = (starDatabase[targetUserId] || 0) + 1;
  
  console.log(`⭐ Star added for User ID ${targetUserId} by Giver ID ${giverId}. Total: ${starDatabase[targetUserId]}`);
  res.status(200).json({ success: true, stars: starDatabase[targetUserId] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Star system server running on port ${PORT}`);
});
