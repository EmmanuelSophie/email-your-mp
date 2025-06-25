const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ✅ Route: Admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// ✅ Get suggestions from file
app.get('/api/get-suggestions', (req, res) => {
  const file = path.join(__dirname, 'suggestions.json');
  if (!fs.existsSync(file)) return res.json([]);
  const data = fs.readFileSync(file, 'utf8');
  res.json(JSON.parse(data));
});

// ✅ Save new suggestion to file
app.post('/api/submit-suggestion', (req, res) => {
  const { suggestion } = req.body;
  if (!suggestion) return res.status(400).json({ message: 'No suggestion provided' });

  const file = path.join(__dirname, 'suggestions.json');
  const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];

  existing.push({ suggestion, timestamp: new Date().toISOString() });
  fs.writeFileSync(file, JSON.stringify(existing, null, 2));
  res.json({ message: 'Suggestion saved successfully' });
});

// ✅ Lookup MP API route
app.post('/api/lookup-mp', async (req, res) => {
  const { postcode } = req.body;
  if (!postcode) return res.status(400).json({ message: 'Postcode is required' });

  const apiKey = 'FPVcrWCuYcxoDEhDqyHB35ga';
  try {
    const response = await fetch(`https://www.theyworkforyou.com/api/getMP?postcode=${encodeURIComponent(postcode)}&output=js&key=${apiKey}`);
    const data = await response.json();

    if (!data || !data.full_name) {
      return res.status(404).json({ message: 'MP not found' });
    }

    res.json({
      name: data.full_name,
      party: data.party,
      constituency: data.constituency
    });

  } catch (err) {
    console.error('❌ MP API Error:', err.message);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});

// ✅ Simulate email send
app.post('/api/send-email', (req, res) => {
  res.json({ message: 'Email sent successfully (simulated)' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
