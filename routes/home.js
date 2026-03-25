//Split routes and controllers into home, searches, lists, favorites, etc. for better organization. 
// Home page and search results page will be in home.js for now since they share a lot of code and functionality. Can split them later if needed.

const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home')
const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);


router.get('/', homeController.getIndex) 
router.get('/home', homeController.getHome)

router.get('/letter/:letter', homeController.getLetterSearch)
router.get('/ingredient', homeController.redirectIngredient)
router.get('/ingredient/:ingredient', homeController.getIngredientSearch)


router.post('/myLists', homeController.postLists)
router.get('/myLists', homeController.getLists)
router.get('/myCustomList/:id', homeController.getCustomList)
router.put('/myLists/:id', homeController.putLists)
router.delete('/myLists/:id', homeController.deleteLists)


router.get('/favorites', homeController.getFavorites)
router.put('/favorites/:id', homeController.putFavorites)
router.delete('/favorites/:id', homeController.deleteFavorites)



module.exports = router