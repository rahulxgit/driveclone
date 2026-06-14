const Folder = require('../models/Folder');
const Image = require('../models/Image');

/**
 * Recursively calculate total size of a folder (all nested images included)
 * Uses a BFS/iterative approach to avoid stack overflow on deep nesting
 *
 * @param {string} folderId - Root folder to calculate from
 * @param {string} ownerId  - Owner id for access control
 * @returns {number} Total size in bytes
 */
const calculateFolderSize = async (folderId, ownerId) => {
  let totalSize = 0;
  const queue = [folderId]; // BFS queue

  while (queue.length > 0) {
    const currentFolderId = queue.shift();

    // Sum direct image sizes in this folder
    const imageAgg = await Image.aggregate([
      { $match: { folder: currentFolderId, uploadedBy: ownerId } },
      { $group: { _id: null, total: { $sum: '$size' } } },
    ]);

    if (imageAgg.length > 0) {
      totalSize += imageAgg[0].total;
    }

    // Find all direct sub-folders and enqueue them
    const childFolders = await Folder.find(
      { parentFolder: currentFolderId, owner: ownerId },
      '_id'
    );

    childFolders.forEach((cf) => queue.push(cf._id));
  }

  return totalSize;
};

/**
 * Build a full nested folder tree for a user starting from a given parent
 * @param {string|null} parentId - null for root-level folders
 * @param {string} ownerId
 * @returns {Array} nested folder tree with children arrays
 */
const buildFolderTree = async (parentId, ownerId) => {
  const folders = await Folder.find({ parentFolder: parentId, owner: ownerId }).sort({ name: 1 });

  const tree = await Promise.all(
    folders.map(async (folder) => {
      const children = await buildFolderTree(folder._id, ownerId);
      const size = await calculateFolderSize(folder._id, ownerId);
      return { ...folder.toObject(), children, size };
    })
  );

  return tree;
};

/**
 * Get folder breadcrumb path (from root → current folder)
 * @param {string} folderId
 * @param {string} ownerId
 * @returns {Array} array of { _id, name } from root to current
 */
const getFolderBreadcrumb = async (folderId, ownerId) => {
  const breadcrumb = [];
  let currentId = folderId;

  while (currentId) {
    const folder = await Folder.findOne({ _id: currentId, owner: ownerId }).select('_id name parentFolder');
    if (!folder) break;

    breadcrumb.unshift({ _id: folder._id, name: folder.name });
    currentId = folder.parentFolder;
  }

  return breadcrumb;
};

module.exports = { calculateFolderSize, buildFolderTree, getFolderBreadcrumb };
