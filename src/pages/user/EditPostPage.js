import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Header from '../../components/Header';
import styles from './PostPage.module.css';
import apiService from '../../services/apiService';
import { toast, ToastContainer } from 'react-toastify';
import cloudinaryConfig from '../../config/cloudinary';
import { useNavigate, useLocation } from 'react-router-dom';
import { useErrorHandler, ErrorDisplay } from '../../services/errorService';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useEditPost } from '../../contexts/EditPostContext';
import PostPage from './PostPage';
import tokenService from '../../services/tokenService';
// Add Google Material Icons
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Constants
const MAX_IMAGES = 6;

// Mock data - replace with actual data from your API
const provinces = [
  { id: 1, name: 'Hà Nội' },
  { id: 2, name: 'Hồ Chí Minh' },
];

const EditPostPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postData, setPostData] = useState(null);

  const token = tokenService.getToken();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const itemId = location.state?.itemId;
        if (!itemId) {
          setError('Không tìm thấy ID bài đăng');
          setLoading(false);
          return;
        }
        const response = await apiService.getItemById(itemId);
        console.log(response);
        if (!response.success || !response.data) {
          setError('Không thể tải thông tin bài đăng');
          setLoading(false);
          return;
        }
        const post = response.data;

        if (!token) {
          setError('Vui lòng đăng nhập để chỉnh sửa bài đăng');
          setLoading(false);
          return;
        }
        setPostData(post);
        setLoading(false);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải thông tin bài đăng');
        setLoading(false);
      }
    };
    fetchPost();
  }, [location.state, user]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const result = await apiService.updateItem(postData.id, formData);
      if (result.success) {
        toast.success('Cập nhật bài đăng thành công');
        navigate(`/item/${postData.id}`);
      } else {
        toast.error(result.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật bài đăng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Đang tải thông tin bài đăng...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.errorContainer}>
          <i className="material-icons">error_outline</i>
          <p>{error}</p>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/my-profile')}
          >
            Quay lại trang cá nhân
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!postData) {
    return null;
  }

  return (
    <div className={styles.container}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
        closeButton={false}
        style={{ top: '20px', right: '20px' }}
        toastStyle={{
          background: 'white',
          color: '#333',
          fontSize: '12px',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          maxWidth: 'fit-content',
          lineHeight: '1.2',
          minHeight: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          cursor: 'pointer'
        }}
        bodyStyle={{
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}
      />
      <Header />
      <PostPage 
        initialData={postData}
        onSubmit={handleSubmit}
        isEditing={true}
        loading={loading}
      />
      <Footer />
    </div>
  );
};

export default EditPostPage; 