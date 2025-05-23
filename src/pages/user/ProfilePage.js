import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditPost } from '../../contexts/EditPostContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import { ToastContainer, toast } from 'react-toastify';
import styles from './ProfilePage.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EditPostForm from './EditPostForm';
import emptyPost from '../../assets/img/empty.png';
import cloudinaryConfig from '../../config/cloudinary';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [activePosts, setActivePosts] = useState([]);
  const [inactivePosts, setInactivePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [userError, setUserError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();
  const { setPostData, clearPostData } = useEditPost();
  const { user, fetchUserInfo } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showMenuId, setShowMenuId] = useState(null);
  const [editModalPost, setEditModalPost] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  // Chỉ chuyển hướng nếu chắc chắn chưa login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user && !token) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Lấy thông tin user mới nhất
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserError(null);
        const res = await apiService.getCurrentUser();

        setUserInfo(res || null);
      } catch (err) {
        setUserInfo(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getItemsByAccount();
      if (response.success) {
        const active = (response.data || []).filter(post => post.status === "available");
        const inactive = (response.data || []).filter(post => post.status !== "available");
        setActivePosts(active);
        setInactivePosts(inactive);
      } else {
        // Nếu API lỗi, set mảng rỗng
        setActivePosts([]);
        setInactivePosts([]);
      }
    } catch (error) {
      // Nếu có lỗi, set mảng rỗng
      setActivePosts([]);
      setInactivePosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Modal edit profile
  const openEditModal = () => {
    setEditName(userInfo?.name || '');
    setEditAvatar(null);
    setEditAvatarPreview(userInfo?.avatar || null);
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditAvatar(null);
    setEditAvatarPreview(null);
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setEditAvatar(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setEditAvatarPreview(userInfo?.avatar || null);
    }
  };
  const handleAvatarClick = () => {
    // Tạo input file ẩn và kích hoạt nó
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          setEditLoading(true);
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', cloudinaryConfig.uploadPreset);
          formData.append('cloud_name', cloudinaryConfig.cloudName);
          formData.append('api_key', cloudinaryConfig.apiKey);
          const response = await fetch(
            `${cloudinaryConfig.apiUrl}/${cloudinaryConfig.cloudName}/image/upload`,
            { method: 'POST', body: formData, headers: { 'X-Requested-With': 'XMLHttpRequest' } }
          );
          if (!response.ok) {
            console.log("response", response);
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
          }
          const data = await response.json();
          const avatarUrl = data.secure_url;

          // Cập nhật avatar
          const result = await apiService.updateAvatar({ avatar: avatarUrl });
          console.log("result", result);
          if (result.success) {
            toast.success('Cập nhật ảnh đại diện thành công!');
            setUserInfo(prev => ({ ...prev, avatar: avatarUrl }));
          } else {
            toast.error(result.message || 'Cập nhật thất bại');
          }
        } catch (error) {
          toast.error('Có lỗi xảy ra khi cập nhật ảnh đại diện');
        } finally {
          setEditLoading(false);
        }
      }
    };
    input.click();
  };

  const handleEditProfile = () => {
    if (isEditingName) {
      // Nếu đang trong chế độ edit, lưu thay đổi
      handleNameSave();
    } else {
      // Nếu chưa trong chế độ edit, bắt đầu edit
      setEditNameValue(userInfo?.full_name || '');
      setIsEditingName(true);
    }
  };

  const handleNameSave = async () => {
    if (editNameValue.trim() === '') {
      toast.error('Tên không được để trống');
      return;
    }
    try {
      setEditLoading(true);
      const result = await apiService.updateName({ full_name: editNameValue });
      if (result.success) {
        toast.success('Cập nhật tên thành công!');
        setUserInfo(prev => ({ ...prev, full_name: editNameValue }));
        setIsEditingName(false);
      } else {
        toast.error(result.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật tên');
    } finally {
      setEditLoading(false);
    }
  };

  const handleHeaderSearch = (query) => {
    setSearchQuery(query);
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (selectedLocation) params.append('location', selectedLocation);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/search?${params.toString()}`);
  };

  const handleHeaderLocationChange = (location) => {
    setSelectedLocation(location);
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (searchQuery) params.append('q', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/search?${params.toString()}`);
  };

  const handleEdit = (post) => {
    setEditModalPost(post);
    setShowMenuId(null);
  };

  const handleDelete = async (postId) => {
    setShowMenuId(null);
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) {
      try {
        const response = await apiService.deleteItem(postId);
        if (response.success) {
          toast.success('Xóa bài đăng thành công');
          fetchMyPosts();
        } else {
          toast.error(response.message || 'Không thể xóa bài đăng');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Có lỗi xảy ra khi xóa bài đăng');
      }
    }
  };

  const handleMenuClick = (postId) => {
    setShowMenuId(showMenuId === postId ? null : postId);
  };

  const handlePostNow = () => {
    clearPostData();
    navigate('/post');
  };

  // Thông tin xác thực (giả lập)
  const joined = userInfo?.createdAt ? userInfo.createdAt : '3 năm 2 tháng';

  function mapPostToInitialData(post) {
    if (!post) return null;
    return {
      itemData: {
        category_id: post.category_id,
        item_name: post.item_name,
        rental_price: post.rental_price,
        description: post.description,
      },
      images: post.images?.map(img => ({
        image_url: img.image_url,
        is_primary: img.is_primary,
      })) || [],
      availability: post.availabilities?.map(a => ({
        start_date: a.start_date?.slice(0, 10) || '',
        end_date: a.end_date?.slice(0, 10) || '',
      })) || [],
      locations: post.item_locations?.map(loc => ({
        province: loc.location.province || '',
        district: loc.location.district || '',
        location_detail: loc.location.location_detail || '',
      })) || [],
    };
  }

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditNameValue('');
  };

  return (
    <>
    <div className={styles.profileContainer}>
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
      <Header onSearch={handleHeaderSearch} onLocationChange={handleHeaderLocationChange} />
      <div className={styles.profileSidebar}>
        <div className={styles.avatarWrapper}>
          {userInfo?.avatar ? (
            <img className={styles.avatar} src={userInfo.avatar} alt="avatar" />
          ) : (
            <span className={styles.avatarIcon}><i className="material-icons">account_circle</i></span>
          )}
          <button 
            className={styles.avatarCamera} 
            title="Đổi ảnh đại diện" 
            onClick={handleAvatarClick}
            disabled={editLoading}
          >
            {editLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              <i className="material-icons">photo_camera</i>
            )}
          </button>
        </div>
        <div className={styles.profileName}>
          {isEditingName ? (
            <div className={styles.nameEditContainer}>
              <input
                type="text"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                className={styles.nameEditInput}
                maxLength={40}
                autoFocus
              />
            </div>
          ) : (
            userInfo?.full_name || 'Chưa đặt tên'
          )}
        </div>
        <div className={styles.profileRating}>Chưa có đánh giá</div>
        <div className={styles.profileActionRow}>
          {!isEditingName && (
            <button className={styles.iconBtn} title="Chia sẻ trang">
              <i className="material-icons">share</i>
            </button>
          )}
          {isEditingName ? (
            <>
              <button 
                className={styles.iconBtn} 
                title="Hủy" 
                onClick={handleCancelEdit}
                disabled={editLoading}
              >
                <i className="material-icons">close</i>
              </button>
              <button 
                className={styles.iconBtn} 
                title="Lưu thay đổi" 
                onClick={handleEditProfile}
                disabled={editLoading}
              >
                {editLoading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  <i className="material-icons">check</i>
                )}
              </button>
            </>
          ) : (
            <button 
              className={styles.iconBtn} 
              title="Chỉnh sửa thông tin" 
              onClick={handleEditProfile}
              disabled={editLoading}
            >
              <i className="material-icons">edit</i>
            </button>
          )}
        </div>
        <div className={styles.profileMeta}>
          <div><i className="material-icons">chat</i> <span>Phản hồi chat: Chưa có thông tin</span></div>
          <div><i className="material-icons">event</i> <span>Đã tham gia: {joined}</span></div>
          <div className={styles.verifiedRow}>
            <i className="material-icons">verified_user</i> <span>Đã xác thực:</span>
            <span className={styles.verifiedIcons}>
              <i className="icon-zalo" />
              <i className="icon-facebook" />
              <i className="icon-google" />
              <i className="icon-apple" />
            </span>
          </div>
        </div>
        {userError && <div className={styles.userError}>{userError}</div>}
      </div>
      {/* Modal edit profile */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Chỉnh sửa thông tin cá nhân</h3>
            <form onSubmit={handleEditProfile}>
              <div className={styles.editAvatarWrapper}>
                <label htmlFor="edit-avatar-input" className={styles.editAvatarLabel}>
                  {editAvatarPreview ? (
                    <img src={editAvatarPreview} alt="avatar preview" className={styles.editAvatarPreview} />
                  ) : (
                    <span className={styles.avatarIcon}><i className="material-icons">account_circle</i></span>
                  )}
                  <input
                    id="edit-avatar-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                  <span className={styles.editAvatarBtn}>Đổi ảnh</span>
                </label>
              </div>
              <div className={styles.editNameGroup}>
                <label htmlFor="edit-name">Tên hiển thị</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className={styles.editNameInput}
                  maxLength={40}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeEditModal} disabled={editLoading}>Hủy</button>
                <button type="submit" className={styles.saveBtn} disabled={editLoading}>
                  {editLoading ? <span className={styles.spinner}></span> : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Right: Posts Tabs */}
      <div className={styles.profileContent}>
        <div className={styles.tabs}>
          <div
            className={activeTab === 'active' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('active')}
          >
            Đang hiển thị ({activePosts.length})
          </div>
          <div
            className={activeTab === 'inactive' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('inactive')}
          >
            Tin đã tắt ({inactivePosts.length})
          </div>
        </div>
        <div className={styles.tabContent}>
          {loading ? (
            <div className={styles.loadingSpinner}><span className={styles.spinner}></span></div>
          ) : (
            <>
              {activeTab === 'active' && (
                activePosts.length === 0 ? (
                  <div className={styles.emptyState}>
                    <img src={emptyPost} alt="empty" style={{width: 120, margin: '24px auto'}} />
                    <div className={styles.emptyText}>Bạn chưa có tin đăng nào</div>
                    <button className={styles.postNowBtn} onClick={handlePostNow}>ĐĂNG TIN NGAY</button>
                  </div>
                ) : (
                  <div className={styles.postList}>
                    {activePosts.map((post) => (
                      <div key={post.item_id} className={styles.postItem}>
                        <div className={styles.postImage}>
                          <img 
                            src={post.images?.[0]?.image_url || '/placeholder-image.jpg'} 
                            alt={post.item_name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                        <div className={styles.postInfo}>
                          <h3>{post.item_name}</h3>
                          <p className={styles.price}>{new Intl.NumberFormat('vi-VN').format(post.rental_price)}đ/ngày</p>
                          <p className={styles.description}>{post.description}</p>
                        </div>
                        <div className={styles.postActions}>
                          <div className={styles.menuWrapper}>
                            <button 
                              className={styles.menuButton} 
                              onClick={() => handleMenuClick(post.item_id)}
                              title="Tùy chọn"
                            >
                              <i className="material-icons">more_vert</i>
                            </button>
                            {showMenuId === post.item_id && (
                              <div className={styles.menuDropdown}>
                                <button 
                                  className={styles.menuItem}
                                  onClick={() => handleEdit(post)}
                                >
                                  <i className="material-icons">edit</i>
                                  Chỉnh sửa
                                </button>
                                <button 
                                  className={styles.menuItem}
                                  onClick={() => handleDelete(post.item_id)}
                                >
                                  <i className="material-icons">delete</i>
                                  Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              {activeTab === 'inactive' && (
                inactivePosts.length === 0 ? (
                  <div className={styles.emptyState}>
                    <img src={emptyPost} alt="empty" style={{width: 120, margin: '24px auto'}} />
                    <div className={styles.emptyText}>Không có tin đã tắt</div>
                  </div>
                ) : (
                  <div className={styles.postList}>
                    {inactivePosts.map((post) => (
                      <div key={post.item_id} className={styles.postItem}>
                        <div className={styles.postImage}>
                          <img 
                            src={post.images?.[0]?.image_url || '/placeholder-image.jpg'} 
                            alt={post.item_name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                        <div className={styles.postInfo}>
                          <h3>{post.item_name}</h3>
                          <p className={styles.price}>{new Intl.NumberFormat('vi-VN').format(post.rental_price)}đ/ngày</p>
                          <p className={styles.description}>{post.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
    <Footer />
    {/* Modal chỉnh sửa bài đăng */}
    {editModalPost && (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent} style={{maxWidth: 900, width: '100%', padding: 0, position: 'relative'}}>
          <button 
            onClick={() => setEditModalPost(null)} 
            className={styles.closeModalBtn} 
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',  
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <i className="material-icons">close</i>
          </button>
          <EditPostForm
            initialData={mapPostToInitialData(editModalPost)}
            isEditing={true}
            onSubmit={async (formData) => {
              console.log("chỉnh sửa", formData);
              try {
                const result = await apiService.updateItem(editModalPost.item_id, {
                  itemData: formData.itemData,
                  availability: formData.availability,
                  images: formData.images,
                  locations: formData.locations
                });
                if (result.success) {
                  toast.success('Cập nhật thành công!');
                  setEditModalPost(null);
                  fetchMyPosts();
                } else {
                  toast.error(result.message || 'Cập nhật thất bại');
                }
              } catch (error) {
                console.error('Error updating item:', error);
                toast.error('Có lỗi xảy ra khi cập nhật');
              }
            }}
            loading={false}
          />
        </div>
      </div>
    )}
    </>
  );
};

export default ProfilePage;