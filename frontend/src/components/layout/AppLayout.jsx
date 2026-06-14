import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import CreateFolderModal from '../folders/CreateFolderModal';
import { fetchFolderTree, fetchFolders } from '../../store/slices/folderSlice';

const AppLayout = () => {
  const dispatch = useDispatch();
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const handleFolderCreated = () => {
    setShowCreateFolder(false);
    dispatch(fetchFolderTree());   // Refresh sidebar tree
    dispatch(fetchFolders(null));  // Refresh dashboard root list
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">
      <Sidebar onNewFolder={() => setShowCreateFolder(true)} />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Global root-folder creation modal */}
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={handleFolderCreated}
        parentFolder={null}
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1c1c22',
            color: '#f4f4f5',
            border: '1px solid #3a3a46',
            borderRadius: '12px',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#d98c1a', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          duration: 3500,
        }}
      />
    </div>
  );
};

export default AppLayout;
