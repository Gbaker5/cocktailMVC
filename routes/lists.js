const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home')
const authController = require("../controllers/auth");
const listsController = require('../controllers/lists')
const { ensureAuth, ensureGuest } = require("../middleware/auth");


router.post('/myLists', ensureAuth,listsController.postLists)
router.get('/myLists', ensureAuth,listsController.getLists)
router.get('/myCustomList/:id', ensureAuth,listsController.getCustomList)
router.put('/myLists/:id', ensureAuth,listsController.putLists)
router.delete('/myLists/:id', ensureAuth,listsController.deleteLists)


module.exports = router 