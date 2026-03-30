const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home')
const authController = require("../controllers/auth");
const { ensureAuth, ensureGuest } = require("../middleware/auth");


router.post('/myLists', ensureAuth,homeController.postLists)
router.get('/myLists', ensureAuth,homeController.getLists)
router.get('/myCustomList/:id', ensureAuth,homeController.getCustomList)
router.put('/myLists/:id', ensureAuth,homeController.putLists)
router.delete('/myLists/:id', ensureAuth,homeController.deleteLists)


module.exports = router