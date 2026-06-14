const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Image name is required'],
      trim: true,
    },
    // Cloudinary secure URL or local path
    url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    // Cloudinary public_id for deletion
    publicId: {
      type: String,
      default: null,
    },
    // File size in bytes
    size: {
      type: Number,
      required: [true, 'Image size is required'],
      min: 0,
    },
    // MIME type (image/jpeg, image/png, etc.)
    mimeType: {
      type: String,
      default: 'image/jpeg',
    },
    // Folder this image belongs to
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      required: [true, 'Folder is required'],
    },
    // Owner reference
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Image dimensions (optional, enriched from Cloudinary)
    width: { type: Number, default: null },
    height: { type: Number, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
imageSchema.index({ folder: 1, uploadedBy: 1 });
imageSchema.index({ uploadedBy: 1 });

// ─── Virtual: human-readable file size ───────────────────────────────────────
imageSchema.virtual('sizeFormatted').get(function () {
  const bytes = this.size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
});

module.exports = mongoose.model('Image', imageSchema);
