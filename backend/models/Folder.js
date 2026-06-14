const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      minlength: [1, 'Folder name cannot be empty'],
      maxlength: [100, 'Folder name cannot exceed 100 characters'],
    },
    // Reference to parent folder — null means it's a root folder
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    // Owner of this folder
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Materialized path for efficient tree queries (e.g. "/rootId/childId/")
    path: {
      type: String,
      default: '/',
    },
    // Depth level: 0 = root, 1 = child, 2 = grandchild, etc.
    depth: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#F59E0B', // Amber as default folder color
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Compound Index: owner + parentFolder for fast tree queries ───────────────
folderSchema.index({ owner: 1, parentFolder: 1 });
folderSchema.index({ owner: 1, path: 1 });

// ─── Virtual: child folders (populated manually in service) ──────────────────
folderSchema.virtual('children', {
  ref: 'Folder',
  localField: '_id',
  foreignField: 'parentFolder',
});

// ─── Virtual: images inside this folder ──────────────────────────────────────
folderSchema.virtual('images', {
  ref: 'Image',
  localField: '_id',
  foreignField: 'folder',
});

module.exports = mongoose.model('Folder', folderSchema);
