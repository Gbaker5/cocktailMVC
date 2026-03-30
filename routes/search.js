const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home')
const authController = require("../controllers/auth");
const { ensureAuth, ensureGuest } = require("../middleware/auth");



router.get('/letter/:letter', ensureAuth,homeController.getLetterSearch)
router.get('/ingredient', ensureAuth,homeController.redirectIngredient)
router.get('/ingredient/:ingredient', ensureAuth,homeController.getIngredientSearch)

module.exports = router