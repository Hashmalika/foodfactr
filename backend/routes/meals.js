const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  mealType: String,
  foods: [{
    name: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  }]
});

const Meal = mongoose.model('Meal', mealSchema);

router.get('/:userId', async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.params.userId });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newMeal = new Meal(req.body);
    await newMeal.save();
    res.status(201).json(newMeal);
  } catch (err) {
    console.error('Error saving meal:', err);
    res.status(500).json({ error: 'Failed to save meal' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Meal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Meal not found' });
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});




module.exports = router;
