import Home from '../pages/user/Home';
import SearchResults from '../pages/user/SearchResults';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import PostPage from '../pages/user/PostPage';
import EditPostPage from '../pages/user/EditPostPage';
import ProfilePage from '../pages/user/ProfilePage';
// Public routes - accessible without authentication
export const publicRoutes = [
  {
    path: '/',
    component: Home,
    exact: true
  },
  {
    path: '/search',
    component: SearchResults,
    exact: true
  },
  {
    path: '/login',
    component: Login,
    exact: true
  },
  {
    path: '/forgot-password',
    component: ForgotPassword,
    exact: true
  },
  {
    path: '/register',
    component: Register,
    exact: true
  },
  {
    path: '/post',
    component: PostPage,
    exact: true
  },
  {
    path: '/edit-post',
    component: EditPostPage,
    exact: true
  },
  {
    path: '/my-profile',
    component: ProfilePage,
    exact: true
  }
];

// Private routes - require authentication
export const privateRoutes = [
  // Add private routes here
];

// Auth routes - for login/register
export const authRoutes = [
  // Add auth routes here
]; 