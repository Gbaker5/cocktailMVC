//Split routes and controllers into home, searches, lists, favorites, etc. for better organization. 
// Home page and search results page will be in home.js for now since they share a lot of code and functionality. Can split them later if needed.

const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home')
const authController = require("../controllers/auth");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);


router.get('/', homeController.getIndex) 
router.get('/home', ensureAuth,homeController.getHome)

//router.get('/letter/:letter', ensureAuth,homeController.getLetterSearch)
//router.get('/ingredient', ensureAuth,homeController.redirectIngredient)
//router.get('/ingredient/:ingredient', ensureAuth,homeController.getIngredientSearch)


//router.post('/myLists', ensureAuth,homeController.postLists)
//router.get('/myLists', ensureAuth,homeController.getLists)
//router.get('/myCustomList/:id', ensureAuth,homeController.getCustomList)
//router.put('/myLists/:id', ensureAuth,homeController.putLists)
//router.delete('/myLists/:id', ensureAuth,homeController.deleteLists)


//router.get('/favorites', ensureAuth,homeController.getFavorites)
//router.put('/favorites/:id', ensureAuth,homeController.putFavorites)
//router.delete('/favorites/:id', ensureAuth,homeController.deleteFavorites)



module.exports = router