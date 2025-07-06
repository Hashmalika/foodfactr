// const mongoose = require('mongoose');

// const ProductSchema = new mongoose.Schema({
//   id: { type: String, required: true, unique: true }, // Barcode
//   name: String,
//   format: String,
//   category: String,
//   nutritionFacts: {
//     calories: Number,
//     protein: Number,
//     carbs: Number,
//     fat: Number,
//     sugar: Number,
//     sodium: Number
//   },
//   ingredients: [String],
//   allergens: [String],
//   image: String,
//   prediction: String // Optional ML result
// });

// module.exports = mongoose.model('Product', ProductSchema);


// const express = require('express');
// const router = express.Router();
// const Product = require('../models/Product');

// // Lookup product by barcode
// router.post('/product-lookup', async (req, res) => {
//   const { barcode, format } = req.body;

//   if (!barcode) {
//     return res.status(400).json({ error: 'Barcode is required' });
//   }

//   try {
//     const product = await Product.findOne({ id: barcode });

//     if (!product) {
//       return res.status(404).json({
//         error: 'Product not found in database',
//         id: barcode,
//         name: `Product ${barcode}`,
//         format: format || 'unknown'
//       });
//     }

//     res.json(product);
//   } catch (err) {
//     console.error('Lookup error:', err);
//     res.status(500).json({ error: 'Server error during lookup' });
//   }
// });

// // Add product manually
// router.post('/add-product', async (req, res) => {
//   const { product } = req.body;

//   if (!product || !product.id) {
//     return res.status(400).json({ error: 'Valid product with ID is required' });
//   }

//   try {
//     const newProduct = new Product(product);
//     await newProduct.save();
//     res.json({ success: true, message: 'Product added successfully' });
//   } catch (err) {
//     console.error('Add product error:', err);
//     res.status(500).json({ error: 'Failed to add product' });
//   }
// });

// module.exports = router;


const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Define Product Schema
const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Barcode
  name: String,
  format: String,
  category: String,
  nutritionFacts: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    sugar: Number,
    sodium: Number
  },
  ingredients: [String],
  allergens: [String],
  image: String,
  prediction: String // Optional ML result
});

// Define and export model
const Product = mongoose.model('Product', ProductSchema);

// Route: Lookup product by barcode
router.post('/product-lookup', async (req, res) => {
  const { barcode, format } = req.body;

  if (!barcode) {
    return res.status(400).json({ error: 'Barcode is required' });
  }

  try {
    const product = await Product.findOne({ id: barcode });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found in database',
        id: barcode,
        name: `Product ${barcode}`,
        format: format || 'unknown'
      });
    }

    res.json(product);
  } catch (err) {
    console.error('Lookup error:', err);
    res.status(500).json({ error: 'Server error during lookup' });
  }
});

// Route: Add product manually
router.post('/add-product', async (req, res) => {
  const { product } = req.body;

  if (!product || !product.id) {
    return res.status(400).json({ error: 'Valid product with ID is required' });
  }

  try {
    const newProduct = new Product(product);
    await newProduct.save();
    res.json({ success: true, message: 'Product added successfully' });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

module.exports = router;

