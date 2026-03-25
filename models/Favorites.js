const mongoose = require('mongoose')

const FavoritesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  drinkIds: {
    type: [String],
    default: []
  }
})

module.exports = mongoose.model('Favorites', FavoritesSchema)