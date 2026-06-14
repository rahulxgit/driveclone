const mongoose = require('mongoose');
const Folder = require('../models/Folder');
const Image = require('../models/Image');
const { calculateFolderSize, buildFolderTree, getFolderBreadcrumb } = require('../services/folderService');

/**
 * @desc    Create a new folder
 * @route   POST /api/folders
 * @access  Protected
 */
const createFolder = async (req, res, next) => {
  try {
    const { name, parentFolder, color } = req.body;

    // If parentFolder provided, verify it exists and belongs to the user
    let depth = 0;
    let path = '/';

    if (parentFolder) {
      const parent = await Folder.findOne({ _id: parentFolder, owner: req.user._id });
      if (!parent) {
        return res.status(404).json({ success: false, message: 'Parent folder not found' });
      }
      depth = parent.depth + 1;
      path = `${parent.path}${parent._id}/`;
    }

    const folder = await Folder.create({
      name,
      parentFolder: parentFolder || null,
      owner: req.user._id,
      depth,
      path,
      color: color || '#F59E0B',
    });

    res.status(201).json({ success: true, message: 'Folder created', folder });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get folders at a given level (direct children of parentFolder)
 * @route   GET /api/folders?parentFolder=<id>
 * @access  Protected
 */
const getFolders = async (req, res, next) => {
  try {
    const { parentFolder } = req.query;

    const query = {
      owner: req.user._id,
      parentFolder: parentFolder ? new mongoose.Types.ObjectId(parentFolder) : null,
    };

    const folders = await Folder.find(query).sort({ name: 1 });

    // Attach size to each folder
    const foldersWithSize = await Promise.all(
      folders.map(async (folder) => {
        const size = await calculateFolderSize(folder._id, req.user._id);
        return { ...folder.toObject(), size };
      })
    );

    res.json({ success: true, folders: foldersWithSize });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get full nested folder tree for the authenticated user
 * @route   GET /api/folders/tree
 * @access  Protected
 */
const getFolderTree = async (req, res, next) => {
  try {
    const tree = await buildFolderTree(null, req.user._id);
    res.json({ success: true, tree });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single folder with breadcrumb
 * @route   GET /api/folders/:id
 * @access  Protected
 */
const getFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    const size = await calculateFolderSize(folder._id, req.user._id);
    const breadcrumb = await getFolderBreadcrumb(folder._id, req.user._id);

    res.json({ success: true, folder: { ...folder.toObject(), size }, breadcrumb });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get folder size (recursive)
 * @route   GET /api/folders/:id/size
 * @access  Protected
 */
const getFolderSize = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    const size = await calculateFolderSize(folder._id, req.user._id);
    res.json({ success: true, folderId: folder._id, name: folder.name, size });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update folder (rename / recolor)
 * @route   PUT /api/folders/:id
 * @access  Protected
 */
const updateFolder = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { ...(name && { name }), ...(color && { color }) },
      { new: true, runValidators: true }
    );

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    res.json({ success: true, message: 'Folder updated', folder });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete folder and all nested contents recursively
 * @route   DELETE /api/folders/:id
 * @access  Protected
 */
const deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    // Recursively collect all descendant folder ids using materialized path
    const descendantFolders = await Folder.find({
      owner: req.user._id,
      path: { $regex: `${folder._id}` },
    });

    const allFolderIds = [folder._id, ...descendantFolders.map((f) => f._id)];

    // Delete all images in these folders
    await Image.deleteMany({ folder: { $in: allFolderIds }, uploadedBy: req.user._id });

    // Delete all folders
    await Folder.deleteMany({ _id: { $in: allFolderIds }, owner: req.user._id });

    res.json({ success: true, message: 'Folder and all contents deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createFolder, getFolders, getFolderTree, getFolder, getFolderSize, updateFolder, deleteFolder };
