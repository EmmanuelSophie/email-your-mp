const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Route: Admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// Route: Lookup MP (sample logic)
app.get('/api/lookup-representative', async (req, res) => {
  const postcode = req.query.postcode;
  const apiKey = 'FPVcrWCuYcxoDEhDqyHB35ga'; // You can move this to .env later
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://www.theyworkforyou.com/api/getMP?key=${apiKey}&postcode=${postcode}&output=json`);
    const data = await response.json();
    res.json({ name: data.full_name, email: data.email, title: data.party });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch MP data' });
  }
});

// Route: Send Email (disabled to avoid costs)
app.post('/api/send-email', (req, res) => {
  // Just simulate success
  res.json({ message: 'Email sent successfully (simulated)' });
});

// Start server
const PORT = 3000;
let suggestions = [];

app.post('/api/submit-suggestion', (req, res) => {
  app.get('/api/get-suggestions', (req, res) => {
  console.log('Suggestions sent to frontend:', suggestions);
  res.json(suggestions);
});

  const { suggestion } = req.body;
  if (!suggestion) {
    return res.status(400).json({ message: 'No suggestion provided' });
  }
  suggestions.push({
    suggestion,
    timestamp: new Date().toISOString()
  });
  res.json({ message: 'Suggestion submitted successfully' });
});
 // Add this at the top of the file if not there already

app.post('/api/lookup-mp', async (req, res) => {
  const { postcode } = req.body;

  if (!postcode) {
    return res.status(400).json({ message: 'Postcode is required' });
  }

  try {
    const apiKey = 'FPVcrWCuYcxoDEhDqyHB35ga';
    const response = await fetch(`https://www.theyworkforyou.com/api/getMP?postcode=${encodeURIComponent(postcode)}&output=js&key=${apiKey}`);
    const data = await response.json();

    if (!data || !data.full_name) {
      return res.status(404).json({ message: 'MP not found for that postcode' });
    }

    res.json({
      name: data.full_name,
      party: data.party,
      constituency: data.constituency
    });

  } catch (error) {
  console.error('❌ ERROR contacting TheyWorkForYou API:', error.message);
  res.status(500).json({ message: 'Something went wrong', error: error.message });
}
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
