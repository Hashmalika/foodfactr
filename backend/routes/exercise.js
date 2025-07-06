// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');

// const exerciseSchema = new mongoose.Schema({
//   userId: mongoose.Schema.Types.ObjectId,
//   date: String,
//   exerciseType: String,
//   durationMinutes: Number,
//   caloriesBurned: Number,
//   notes: String
// });

// const Exercise = mongoose.model('Exercise', exerciseSchema);

// router.get('/:userId', async (req, res) => {
//   try {
//     const logs = await Exercise.find({ userId: req.params.userId });
//     res.json(logs);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch exercise logs' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const cardioSchema = new mongoose.Schema({
  name: String,
  minutes: Number,
  calories: Number
}, { _id: false });

const strengthSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  reps: Number,
  weight: Number
}, { _id: false });

const exerciseLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  cardio: [cardioSchema],
  strength: [strengthSchema],
  note: { type: String, default: '' }
}, { timestamps: true });

const ExerciseLog = mongoose.model('ExerciseLog', exerciseLogSchema);

// GET exercises by userId and date
router.get('/:userId/:date', async (req, res) => {
  try {
    const log = await ExerciseLog.findOne({ userId: req.params.userId, date: req.params.date });
    res.json(log || { cardio: [], strength: [], note: '' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// POST add exercise to cardio or strength
router.post('/:userId/:date', async (req, res) => {
  const { type, exercise } = req.body;
  if (!['cardio', 'strength'].includes(type)) {
    return res.status(400).json({ error: 'Invalid exercise type' });
  }

  try {
    let log = await ExerciseLog.findOne({ userId: req.params.userId, date: req.params.date });
    if (!log) {
      log = new ExerciseLog({ userId: req.params.userId, date: req.params.date, cardio: [], strength: [] });
    }

    log[type].push(exercise);
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save exercise' });
  }
});

// PUT update a specific exercise entry (by index)
router.put('/:userId/:date/:type/:index', async (req, res) => {
  const { type, index } = req.params;
  const updated = req.body;

  if (!['cardio', 'strength'].includes(type)) {
    return res.status(400).json({ error: 'Invalid exercise type' });
  }

  try {
    const log = await ExerciseLog.findOne({ userId: req.params.userId, date: req.params.date });
    if (!log || !log[type][index]) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    log[type][index] = updated;
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update exercise' });
  }
});

// DELETE a specific exercise entry (by index)
router.delete('/:userId/:date/:type/:index', async (req, res) => {
  const { type, index } = req.params;

  if (!['cardio', 'strength'].includes(type)) {
    return res.status(400).json({ error: 'Invalid exercise type' });
  }

  try {
    const log = await ExerciseLog.findOne({ userId: req.params.userId, date: req.params.date });
    if (!log || !log[type][index]) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    log[type].splice(index, 1);
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

// PUT update note for a date
router.put('/:userId/:date/note', async (req, res) => {
  const { note } = req.body;
  try {
    const log = await ExerciseLog.findOneAndUpdate(
      { userId: req.params.userId, date: req.params.date },
      { $set: { note } },
      { new: true, upsert: true }
    );
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

module.exports = router;


