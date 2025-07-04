// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    boDe: { type: mongoose.Schema.Types.ObjectId, ref: 'BoDe' },
    rating: { type: Number, min: 1, max: 5 },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
