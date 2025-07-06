const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  gender: String,
  age: Number,
  height: Number,
  weight: Number,
  goals: {
    dailyCalories: Number,
    dailyWaterGlasses: Number,
    dailySteps: Number,
  },
});

const User = mongoose.model('User', userSchema);

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const saved = await newUser.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save user profile' });
    }
});


module.exports = router;
