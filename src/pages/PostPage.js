import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Header from '../components/Header';
import './PostPage.css';
import apiService from '../services/apiService';
import { toast, ToastContainer } from 'react-toastify';
import cloudinaryConfig from '../config/cloudinary';
import { useNavigate } from 'react-router-dom';
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

const PostPage = () => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemData: {
      category_id: '',
      item_name: '',
      rental_price: '',
      description: '',
    },
    availability: [{ start_date: null, end_date: null }],
    images: [],
    locations: [{ province: '', district: '', location_detail: '' }],
  });

  const [errors, setErrors] = useState({});

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await apiService.getCategories();
      if (response.success) {
        console.log('Categories response:', response);
        setCategories(response.data || []);
      } else {
        toast.error('Không thể tải danh mục');
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Lỗi khi tải danh mục');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const validateDates = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (!startDate || !endDate) {
      return 'Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc';
    }
    
    if (start < today) {
      return 'Ngày bắt đầu phải lớn hơn ngày hiện tại';
    }
    
    if (end < start) {
      return 'Ngày kết thúc phải lớn hơn ngày bắt đầu';
    }
    
    return null;
  };

  const handleNextStep = () => {
    // Basic validation for Step 1 before proceeding
    const newErrors = {};
    if (!formData.itemData.category_id) newErrors.category = 'Vui lòng chọn danh mục';
    if (!formData.itemData.item_name) newErrors.title = 'Vui lòng nhập tên sản phẩm';
    if (!formData.itemData.rental_price) newErrors.price = 'Vui lòng nhập giá cho thuê';
    if (!formData.itemData.description) newErrors.description = 'Vui lòng nhập mô tả';
    if (formData.images.length === 0) newErrors.images = 'Vui lòng tải lên ít nhất một ảnh';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    let hasErrors = false;
    
    formData.availability.forEach((period, index) => {
      const error = validateDates(period.start_date, period.end_date);
      if (error) {
        newErrors[`availability_${index}`] = error;
        hasErrors = true;
      }
    });

    formData.locations.forEach((location, index) => {
      if (!location.province || !location.district || !location.location_detail) {
        newErrors[`location_${index}`] = 'Vui lòng nhập đầy đủ thông tin địa chỉ';
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (!hasErrors) {
      setLoading(true);
      console.log('Form data:', formData);
      try {
        // Ensure at least one image is marked as primary
        const hasPrimaryImage = formData.images.some(img => img.is_primary);
        if (!hasPrimaryImage && formData.images.length > 0) {
          formData.images[0].is_primary = true;
        }

        const result = await apiService.createItem(formData);
        if(result?.success) {
          console.log('Đăng tin thành công');
          toast.success('Đăng tin thành công');
          // Reload page after successful post
          setTimeout(() => {
            window.location.reload();
          }, 1500); // Wait for 1.5 seconds to show success message
        }
      } catch (error) {
        console.error('Error creating item:', error);
        toast.error('Lỗi khi đăng tin');
        setLoading(false); // Only set loading to false if there's an error
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'rental_price') {
      // Remove all non-digit characters
      const numericValue = value.replace(/\D/g, '');
      
      // Check if value exceeds 10 million
      if (parseInt(numericValue) > 10000000) {
        setErrors(prev => ({
          ...prev,
          price: 'Giá thuê không được vượt quá 10 triệu đồng'
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        itemData: {
          ...prev.itemData,
          [name]: numericValue,
        },
      }));

      // Clear price error if value is valid
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.price;
        return newErrors;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        itemData: {
          ...prev.itemData,
          [name]: value,
        },
      }));
    }

    // Clear error for other fields being changed
    setErrors((prev) => {
      const newErrors = { ...prev };
      switch (name) {
        case 'category_id':
          delete newErrors.category;
          break;
        case 'item_name':
          delete newErrors.title;
          break;
        case 'description':
          delete newErrors.description;
          break;
      }
      return newErrors;
    });
  };

  const handleAvailabilityChange = (index, field, value) => {
    setFormData((prev) => {
      const newAvailability = prev.availability.map((period, i) =>
        i === index ? { ...period, [field]: value } : period
      );

      // Clear error if both dates are filled and valid
      const period = newAvailability[index];
      if (period.start_date && period.end_date) {
        const error = validateDates(period.start_date, period.end_date);
        setErrors(prev => {
          const newErrors = { ...prev };
          if (!error) {
            delete newErrors[`availability_${index}`];
          } else {
            newErrors[`availability_${index}`] = error;
          }
          return newErrors;
        });
      }

      return {
        ...prev,
        availability: newAvailability
      };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    try {
      // Upload each image to Cloudinary
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        formData.append('cloud_name', cloudinaryConfig.cloudName);
        formData.append('api_key', cloudinaryConfig.apiKey);

        const response = await fetch(
          `${cloudinaryConfig.apiUrl}/${cloudinaryConfig.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return {
          image_url: data.secure_url,
          is_primary: false
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages].slice(0, MAX_IMAGES),
      }));

      // Clear image error if images are uploaded
      if (uploadedImages.length > 0) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.images;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'Lỗi khi tải ảnh lên');
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      
      // Add error if no images left
      if (newImages.length === 0) {
        setErrors(prev => ({
          ...prev,
          images: 'Vui lòng tải lên ít nhất một ảnh'
        }));
      }

      return {
        ...prev,
        images: newImages
      };
    });
  };

  const setPrimaryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index,
      })),
    }));
  };

  const handleLocationChange = (index, field, value) => {
    setFormData((prev) => {
      const newLocations = prev.locations.map((location, i) =>
        i === index ? { ...location, [field]: value } : location
      );

      // Clear error if all location fields are filled
      const location = newLocations[index];
      if (location.province && location.district && location.location_detail) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`location_${index}`];
          return newErrors;
        });
      }

      return {
        ...prev,
        locations: newLocations
      };
    });
  };

  const addLocation = () => {
    setFormData((prev) => ({
      ...prev,
      locations: [...prev.locations, { province: '', district: '', location_detail: '' }],
    }));
  };

  const addAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [...prev.availability, { start_date: null, end_date: null }],
    }));
  };

  const removeAvailability = (index) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const removeLocation = (index) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index),
    }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData((prev) => ({
      ...prev,
      images: items,
    }));
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

  return (
    <div className="container">
      <Header onSearch={handleHeaderSearch} onLocationChange={handleHeaderLocationChange} />
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
      <div className="post-form">
        <h1 className="form-title">Đăng tin mới</h1>

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="form-step">
              <div className="form-column">
                <div className="form-section">
                  <h2>Hình ảnh ({formData.images.length}/{MAX_IMAGES})</h2>
                  {
                    formData.images.length < MAX_IMAGES && (
                      <label className="upload-button">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={formData.images.length >= MAX_IMAGES}
                        />
                        <i className="material-icons">cloud_upload</i>
                      </label>
                  )}
                  {errors.images && <p style={{textAlign: 'center'}} className="error-text">{errors.images}</p>}
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="images" direction="horizontal" type="IMAGE">
                      {(provided, snapshot) => (
                        <div 
                          className={`image-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                          ref={provided.innerRef} 
                          {...provided.droppableProps}
                        >
                          {formData.images.map((image, index) => (
                            <Draggable 
                              key={`image-${index}`} 
                              draggableId={`image-${index}`} 
                              index={index}
                              isDragDisabled={false}
                            >
                              {(provided, snapshot) => (
                                <div 
                                  className={`image-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                  ref={provided.innerRef} 
                                  {...provided.draggableProps} 
                                  {...provided.dragHandleProps}
                                >
                                  <img src={image.image_url} alt={`Preview ${index + 1}`} />
                                  <div className="image-actions">
                                    <button type="button" onClick={() => removeImage(index)}>
                                      <i className="delete-icon"></i>
                                    </button>
                                  </div>
                                  {image.is_primary && (
                                    <span className="primary-badge">Ảnh chính</span>
                                  )}
                                  <button
                                    type="button"
                                    className="set-primary-btn"
                                    onClick={() => setPrimaryImage(index)}
                                    disabled={image.is_primary}
                                  >
                                    <i className={`star-icon ${image.is_primary ? 'disabled' : ''}`}></i>
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>

              <div className="form-column">
                <div className="form-section">
                  <h2>Thông tin cơ bản</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Danh mục tin</label>
                      <select
                        name="category_id"
                        value={formData.itemData.category_id}
                        onChange={handleInputChange}
                        disabled={loadingCategories}
                      >
                        <option value="">Chọn danh mục</option>
                        {loadingCategories ? (
                          <option disabled>Đang tải danh mục...</option>
                        ) : categories && categories.length > 0 ? (
                          categories.map(category => (
                            <option key={category.category_id} value={category.category_id}>
                              {category.category_name}
                            </option>
                          ))
                        ) : (
                          <option disabled>Không có danh mục</option>
                        )}
                      </select>
                      {errors.category && <p className="error-text">{errors.category}</p>}
                    </div>

                    <div className="form-group">
                      <label>Giá thuê</label>
                      <div className="price-input">
                        <span className="currency">₫</span>
                        <input
                          type="text"
                          name="rental_price"
                          value={formData.itemData.rental_price ? new Intl.NumberFormat('vi-VN').format(formData.itemData.rental_price) : ''}
                          onChange={handleInputChange}
                          placeholder="Nhập giá thuê"
                          maxLength={10}
                          className={errors.price ? 'error-input' : ''}
                        />
                      </div>
                      {errors.price && <p className="error-text">{errors.price}</p>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tên hiển thị</label>
                    <input
                      type="text"
                      name="item_name"
                      value={formData.itemData.item_name}
                      onChange={handleInputChange}
                    />
                    {errors.title && <p className="error-text">{errors.title}</p>}
                  </div>

                  <div className="form-group">
                    <label>Chi tiết</label>
                    <textarea
                      name="description"
                      value={formData.itemData.description}
                      onChange={handleInputChange}
                      rows={4}
                    />
                    {errors.description && <p className="error-text">{errors.description}</p>}
                  </div>
                </div>
                <button type="button" className="btn-next" onClick={handleNextStep}>
                  <i className="material-icons">arrow_forward</i>
                </button>
              </div>

            </div>
          ) : (
            <div className="form-step">
              <div className="form-section">
                <h2>Thời gian cho thuê</h2>
                {formData.availability.map((period, index) => (
                  <div key={index} className="availability-item">
                    <div className="section-header">
                      <h3>Kỳ {index + 1}</h3>
                      {index > 0 && (
                        <button type="button" className="btn-delete" onClick={() => removeAvailability(index)}>
                          <i className="material-icons">delete</i>
                        </button>
                      )}
                    </div>
                    <div className="date-inputs">
                      <div className="form-group">
                        <label>Ngày bắt đầu</label>
                        <input
                          type="date"
                          value={period.start_date || ''}
                          onChange={(e) => handleAvailabilityChange(index, 'start_date', e.target.value)}
                          className={errors[`availability_${index}`] ? 'error-input' : ''}
                        />
                      </div>
                      <div className="form-group">
                        <label>Ngày kết thúc</label>
                        <input
                          type="date"
                          value={period.end_date || ''}
                          onChange={(e) => handleAvailabilityChange(index, 'end_date', e.target.value)}
                          className={errors[`availability_${index}`] ? 'error-input' : ''}
                        />
                      </div>
                    </div>
                    {errors[`availability_${index}`] && (
                      <p className="error-text">{errors[`availability_${index}`]}</p>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-add" onClick={addAvailability}>
                  <i className="material-icons">add</i>
                </button>
              </div>

              <div className="form-section">
                <h2>Địa chỉ cho thuê</h2>
                {formData.locations.map((location, index) => (
                  <div key={index} className="location-item">
                    <div className="section-header">
                      <h3>Địa chỉ {index + 1}</h3>
                      {index > 0 && (
                        <button type="button" className="btn-delete" onClick={() => removeLocation(index)}>
                          <i className="delete-icon"></i>
                        </button>
                      )}
                    </div>
                    <div className="location-inputs">
                      <div className="form-group">
                        <label>Tỉnh/Thành</label>
                        <select
                          value={location.province}
                          onChange={(e) => handleLocationChange(index, 'province', e.target.value)}
                          className={errors[`location_${index}`] ? 'error-input' : ''}
                        >
                          <option value="">Chọn tỉnh/thành</option>
                          {provinces.map(province => (
                            <option key={province.id} value={province.name}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Quận/Huyện</label>
                        <input
                          type="text"
                          value={location.district}
                          onChange={(e) => handleLocationChange(index, 'district', e.target.value)}
                          className={errors[`location_${index}`] ? 'error-input' : ''}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Địa chỉ chi tiết</label>
                      <input
                        type="text"
                        value={location.location_detail}
                        onChange={(e) => handleLocationChange(index, 'location_detail', e.target.value)}
                        className={errors[`location_${index}`] ? 'error-input' : ''}
                      />
                    </div>
                    {errors[`location_${index}`] && (
                      <p className="error-text">{errors[`location_${index}`]}</p>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-add" onClick={addLocation}>
                  <i className="material-icons">add</i>
                </button>
              </div>

              <div className="form-actions-back">
                <button 
                  type="button" 
                  className="btn-back" 
                  onClick={handlePreviousStep}
                  disabled={loading}
                  style={{ 
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <i className="material-icons">arrow_back</i>
                </button>
              </div>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
                style={{ 
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Đang đăng tin...' : 'Đăng tin'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostPage;