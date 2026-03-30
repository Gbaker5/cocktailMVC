const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home')
const authController = require("../controllers/auth");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get('/favorites', ensureAuth,homeController.getFavorites)
router.put('/favorites/:id', ensureAuth,homeController.putFavorites)
router.delete('/favorites/:id', ensureAuth,homeController.deleteFavorites)



module.exports = router