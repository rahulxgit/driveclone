const Image = require('../models/Image');
const Folder = require('../models/Folder');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

/**
 * @desc    Upload image to a folder
 * @route   POST /api/images/upload/:folderId
 * @access  Protected
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const { folderId } = req.params;

    // Verify folder belongs to user
    const folder = await Folder.findOne({ _id: folderId, owner: req.user._id });
    if (!folder) {
      // Cleanup uploaded file from Cloudinary if folder validation fails
      if (req.file.filename) await cloudinary.uploader.destroy(req.file.filename);
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    // Cloudinary provides path (public_id) and size
    const fileSize = req.file.size || 0;

    const image = await Image.create({
      name: req.file.originalname || req.file.filename,
      url: req.file.path,       // Cloudinary secure URL
      publicId: req.file.filename, // Cloudinary public_id
      size: fileSize,
      mimeType: req.file.mimetype,
      folder: folderId,
      uploadedBy: req.user._id,
      width: req.file.width || null,
      height: req.file.height || null,
    });

    // Update user storage used
    await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: fileSize } });

    await image.populate('folder', 'name');

    res.status(201).json({ success: true, message: 'Image uploaded successfully', image });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all images in a folder (owner only)
 * @route   GET /api/images/folder/:folderId
 * @access  Protected
 */
const getImagesByFolder = async (req, res, next) => {
  try {
    const { folderId } = req.params;

    // Verify folder ownership
    const folder = await Folder.findOne({ _id: folderId, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    const images = await Image.find({ folder: folderId, uploadedBy: req.user._id }).sort({ createdAt: -1 });

    res.json({ success: true, count: images.length, images });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all images uploaded by the user
 * @route   GET /api/images
 * @access  Protected
 */
const getAllImages = async (req, res, next) => {
  try {
    const images = await Image.find({ uploadedBy: req.user._id })
      .populate('folder', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: images.length, images });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an image (also removes from Cloudinary)
 * @route   DELETE /api/images/:id
 * @access  Protected
 */
const deleteImage = async (req, res, next) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, uploadedBy: req.user._id });
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Remove from Cloudinary
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    // Decrement user storage
    await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: -image.size } });

    await image.deleteOne();

    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage, getImagesByFolder, getAllImages, deleteImage };
