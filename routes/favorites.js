const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home')
const authController = require("../controllers/auth");
const favoritesController = require("../controllers/favorites");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get('/favorites', ensureAuth, favoritesController.getFavorites)
router.put('/favorites/:id', ensureAuth, favoritesController.putFavorites)
//router.delete('/favorites/:id', ensureAuth, favoritesController.deleteFavorites)



module.exports = router