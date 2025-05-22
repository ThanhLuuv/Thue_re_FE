import Home from '../pages/Home';
import SearchResults from '../pages/SearchResults';
import ForgotPassword from '../pages/ForgotPassword';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Upload from '../pages/Upload';
import PostPage from '../pages/PostPage';
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
    path: '/upload',
    component: Upload,
    exact: true
  },
  {
    path: '/post',
    component: PostPage,
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