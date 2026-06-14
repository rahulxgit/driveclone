const express = require('express');
const router = express.Router();
const {
  createFolder,
  getFolders,
  getFolderTree,
  getFolder,
  getFolderSize,
  updateFolder,
  deleteFolder,
} = require('../controllers/folderController');
const { protect } = require('../middleware/authMiddleware');
const { createFolderValidator } = require('../middleware/validators');

// All folder routes are protected
router.use(protect);

router.route('/').get(getFolders).post(createFolderValidator, createFolder);

router.get('/tree', getFolderTree);

router.route('/:id').get(getFolder).put(updateFolder).delete(deleteFolder);

router.get('/:id/size', getFolderSize);

module.exports = router;
