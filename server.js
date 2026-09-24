const express = require('express');
const app = express();

// Enable CORS so your Chrome extension can communicate with the server
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

// In-memory database object (Stores stars: { "userId": count })
const starDatabase = {};

// GET: Fetch stars for a specific user ID
app.get('/get-stars/:userId', (req, res) => {
  const userId = req.params.userId;
  const stars = starDatabase[userId] || 0;
  res.status(200).json({ userId, stars });
});

// POST: Add a star to a specific user ID
app.post('/add-star', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  // Increment star count
  starDatabase[userId] = (starDatabase[userId] || 0) + 1;
  
  console.log(`⭐ Star added for User ID ${userId}. Total stars: ${starDatabase[userId]}`);
  res.status(200).json({ success: true, stars: starDatabase[userId] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Star system server running on port ${PORT}`);
});
