const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home')
const authController = require("../controllers/auth");
const searchesController = require('../controllers/searches')
const { ensureAuth, ensureGuest } = require("../middleware/auth");



router.get('/letter/:letter', ensureAuth, searchesController.getLetterSearch)
router.get('/ingredient', ensureAuth, searchesController.redirectIngredient)
router.get('/ingredient/:ingredient', ensureAuth, searchesController.getIngredientSearch)

module.exports = router 