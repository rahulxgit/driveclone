import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { imageService } from '../../services/imageService';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchImagesByFolder = createAsyncThunk('images/byFolder', async (folderId, { rejectWithValue }) => {
  try {
    const res = await imageService.getImagesByFolder(folderId);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load images');
  }
});

export const fetchAllImages = createAsyncThunk('images/all', async (_, { rejectWithValue }) => {
  try {
    const res = await imageService.getAllImages();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load images');
  }
});

export const uploadImage = createAsyncThunk('images/upload', async ({ folderId, file, onProgress }, { rejectWithValue }) => {
  try {
    const res = await imageService.uploadImage(folderId, file, onProgress);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Upload failed');
  }
});

export const deleteImage = createAsyncThunk('images/delete', async (id, { rejectWithValue }) => {
  try {
    await imageService.deleteImage(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete image');
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const imageSlice = createSlice({
  name: 'images',
  initialState: {
    images: [],
    uploading: false,
    uploadProgress: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearImageError: (state) => { state.error = null; },
    setUploadProgress: (state, action) => { state.uploadProgress = action.payload; },
  },
  extraReducers: (builder) => {
    // fetchImagesByFolder
    builder
      .addCase(fetchImagesByFolder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchImagesByFolder.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload.images;
      })
      .addCase(fetchImagesByFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchAllImages
    builder
      .addCase(fetchAllImages.pending, (state) => { state.loading = true; })
      .addCase(fetchAllImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload.images;
      })
      .addCase(fetchAllImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // uploadImage
    builder
      .addCase(uploadImage.pending, (state) => { state.uploading = true; state.uploadProgress = 0; state.error = null; })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 100;
        state.images.unshift(action.payload.image);
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      });

    // deleteImage
    builder
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.images = state.images.filter((img) => img._id !== action.payload);
      });
  },
});

export const { clearImageError, setUploadProgress } = imageSlice.actions;
export default imageSlice.reducer;
