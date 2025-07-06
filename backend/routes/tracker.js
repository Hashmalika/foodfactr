const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const trackerSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  caloriesIn: Number,
  caloriesOut: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  waterGlasses: Number,
  steps: Number
});

const Tracker = mongoose.model('Tracker', trackerSchema);

router.get('/:userId', async (req, res) => {
  try {
    const data = await Tracker.find({ userId: req.params.userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tracker data' });
  }
});

module.exports = router;
