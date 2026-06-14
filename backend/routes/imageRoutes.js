const express = require('express');
const router = express.Router();
const { uploadImage, getImagesByFolder, getAllImages, deleteImage } = require('../controllers/imageController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// All image routes are protected
router.use(protect);

router.get('/', getAllImages);
router.post('/upload/:folderId', upload.single('image'), uploadImage);
router.get('/folder/:folderId', getImagesByFolder);
router.delete('/:id', deleteImage);

module.exports = router;
