const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// ✅ Serve dashboard/index.html on root "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/index.html'));
});


app.get('/dashboard', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/dashboard/index.html'));
});
app.get('/profile', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/profile/profile.html'));
});

app.get('/exercise', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/exercise/exercise.html'));
});

app.get('/tracker', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/tracker/tracker.html'));
});

app.get('/meal', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/dashboard/meal.html'));
});



// ✅ Now API routes
app.use('/api/meals', require('./routes/meals'));
app.use('/api/exercise', require('./routes/exercise'));
app.use('/api/tracker', require('./routes/tracker'));
app.use('/api/user', require('./routes/user'));
app.use('/api/product', require('./routes/product'));

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ✅ Mongo connection
mongoose.connect('mongodb://localhost:27017/healthapp', {
  useNewUrlParser: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error", err));

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

