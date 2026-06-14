import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { folderService } from '../../services/folderService';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchFolders = createAsyncThunk(
  'folders/fetch',
  async (parentFolder, { rejectWithValue }) => {
    try {
      const res = await folderService.getFolders(parentFolder);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load folders');
    }
  }
);

export const fetchFolderTree = createAsyncThunk(
  'folders/tree',
  async (_, { rejectWithValue }) => {
    try {
      const res = await folderService.getFolderTree();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load tree');
    }
  }
);

export const fetchFolder = createAsyncThunk(
  'folders/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await folderService.getFolder(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load folder');
    }
  }
);

export const createFolder = createAsyncThunk(
  'folders/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await folderService.createFolder(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create folder');
    }
  }
);

export const updateFolder = createAsyncThunk(
  'folders/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await folderService.updateFolder(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update folder');
    }
  }
);

export const deleteFolder = createAsyncThunk(
  'folders/delete',
  async (id, { rejectWithValue }) => {
    try {
      await folderService.deleteFolder(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete folder');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const folderSlice = createSlice({
  name: 'folders',
  initialState: {
    folders: [],          // Child folders at current level
    tree: [],             // Full sidebar tree
    currentFolder: null,  // Currently open folder
    breadcrumb: [],       // Breadcrumb trail
    loading: false,
    treeLoading: false,
    error: null,
  },
  reducers: {
    clearFolderError:   (state) => { state.error = null; },
    clearCurrentFolder: (state) => { state.currentFolder = null; state.breadcrumb = []; },
  },
  extraReducers: (builder) => {

    // fetchFolders — list of children at current level
    builder
      .addCase(fetchFolders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.loading = false;
        state.folders = action.payload.folders;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchFolderTree — sidebar tree
    builder
      .addCase(fetchFolderTree.pending,   (state) => { state.treeLoading = true; })
      .addCase(fetchFolderTree.fulfilled, (state, action) => { state.treeLoading = false; state.tree = action.payload.tree; })
      .addCase(fetchFolderTree.rejected,  (state) => { state.treeLoading = false; });

    // fetchFolder — single folder + breadcrumb
    builder
      .addCase(fetchFolder.pending, (state) => { state.loading = true; })
      .addCase(fetchFolder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFolder = action.payload.folder;
        state.breadcrumb    = action.payload.breadcrumb;
      })
      .addCase(fetchFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // createFolder — add to folders list only if parentFolder matches current level
    builder
      .addCase(createFolder.fulfilled, (state, action) => {
        const newFolder = action.payload.folder;
        // Check if this folder belongs in the current list
        const currentParentId = state.currentFolder?._id ?? null;
        const newFolderParent = newFolder.parentFolder ?? null;
        const sameLevel =
          String(newFolderParent) === String(currentParentId) ||
          (newFolderParent === null && currentParentId === null);

        if (sameLevel) {
          state.folders.unshift(newFolder);
        }
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.error = action.payload;
      });

    // updateFolder — update in list + currentFolder if it's the open one
    builder
      .addCase(updateFolder.fulfilled, (state, action) => {
        const updated = action.payload.folder;
        const idx = state.folders.findIndex((f) => f._id === updated._id);
        if (idx !== -1) state.folders[idx] = { ...state.folders[idx], ...updated };
        if (state.currentFolder?._id === updated._id) {
          state.currentFolder = { ...state.currentFolder, ...updated };
        }
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.error = action.payload;
      });

    // deleteFolder — remove from list
    builder
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter((f) => f._id !== action.payload);
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearFolderError, clearCurrentFolder } = folderSlice.actions;
export default folderSlice.reducer;
