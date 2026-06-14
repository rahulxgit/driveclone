import { useSelector, useDispatch } from 'react-redux';
import { logout, clearError } from '../store/slices/authSlice';

/**
 * Convenience hook for auth state and actions
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    ...auth,
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
};
