const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', verifyToken, recipeController.getAllRecipes);
router.post('/', verifyToken, upload.single('image'), recipeController.createRecipe);

module.exports = router;
