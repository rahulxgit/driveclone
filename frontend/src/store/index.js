import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import folderReducer from './slices/folderSlice';
import imageReducer from './slices/imageSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    folders: folderReducer,
    images: imageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Needed for File objects in upload payloads
    }),
});

export default store;
