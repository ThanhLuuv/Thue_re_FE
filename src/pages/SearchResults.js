import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Range } from 'react-range';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../services/apiService';
import { useErrorHandler, ErrorDisplay } from '../services/errorService';
import Header from '../components/Header';
import { Link, useLocation } from 'react-router-dom';
import images from '../assets/img/img.png';
import empty from '../assets/img/empty.png';
import './SearchResults.css';
import Footer from '../components/Footer';
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchParams, setSearchParams] = useState({
    query: '',
    location: '',
    category: '',
    lowprice: '',
    highprice: ''
  });
  const [openPriceModal, setOpenPriceModal] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState([0, 100000000]);
  
  const { handleApiError } = useErrorHandler();
  const urlQuery = useQuery();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await apiService.getCategories();
      if (response.success) {
        console.log('Categories response:', response);
        setCategories(response.data || []);
      } else {
        const errorResult = handleApiError(response);
        setError(errorResult);
        setCategories([]);
      }
    } catch (err) {
      const errorResult = handleApiError(err);
      setError(errorResult);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Lấy tham số từ URL và thiết lập searchParams khi component được tải hoặc URL thay đổi
  useEffect(() => {
    const queryFromUrl = urlQuery.get('q') || '';
    const selectedCategory = urlQuery.get('category') || '';
    const locationFromUrl = urlQuery.get('location') || '';
    const lowpriceFromUrl = urlQuery.get('lowprice') || '';
    const highpriceFromUrl = urlQuery.get('highprice') || '';
    
    const newParams = {
      query: queryFromUrl,
      location: locationFromUrl,
      category: selectedCategory,
      lowprice: lowpriceFromUrl,
      highprice: highpriceFromUrl
    };
    
    console.log('Initial URL params:', newParams);
    setSearchParams(newParams);
    setPage(1);

    // Gọi API ngay lập tức với các tham số từ URL
    const fetchInitialItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getAvailableItems(
          queryFromUrl,
          locationFromUrl,
          selectedCategory,
          1,
          lowpriceFromUrl,
          highpriceFromUrl
        );
        
        if (response.success) {
          setItems(response.data);
          const calculatedTotalPages = Math.max(1, response.pagination?.totalPages || 1);
          setTotalPages(calculatedTotalPages);
        } else {
          const errorResult = handleApiError(response);
          setError(errorResult);
        }
      } catch (err) {
        const errorResult = handleApiError(err);
        setError(errorResult);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialItems();
  }, [location.search]); // Thêm dependency location.search để theo dõi khi URL thay đổi

  // Fetch items khi searchParams hoặc page thay đổi (trừ lần đầu tiên)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const { query, location, category, lowprice, highprice } = searchParams;
        console.log('SearchResults - fetching items with params:', { query, location, category, lowprice, highprice });
        
        const response = await apiService.getAvailableItems(
          query,
          location,
          category,
          page,
          lowprice,
          highprice
        );
        
        if (response.success) {
          setItems(response.data);
          const calculatedTotalPages = Math.max(1, response.pagination?.totalPages || 1);
          setTotalPages(calculatedTotalPages);
          
          if (page > calculatedTotalPages) {
            setPage(1);
          }
        } else {
          const errorResult = handleApiError(response);
          setError(errorResult);
        }
      } catch (err) {
        const errorResult = handleApiError(err);
        setError(errorResult);
      } finally {
        setLoading(false);
      }
    };

    // Gọi fetchItems khi searchParams hoặc page thay đổi
    fetchItems();
  }, [searchParams, page, handleApiError]);

  const handleHeaderLocationChange = (location) => {
    console.log('SearchResults - handleHeaderLocationChange:', location);
    // Reset location and update search params
    const newParams = {
      ...searchParams,
      location: location
    };
    console.log('SearchResults - new search params:', newParams);
    setSearchParams(newParams);
    setPage(1);
    updateURLParams(newParams);
  };

  const handleHeaderSearch = (query) => {
    const newParams = { ...searchParams, query };
    setSearchParams(newParams);
    setPage(1);
    updateURLParams(newParams);
  };

  const handleHeaderCategoryChange = (category) => {
    const newParams = { ...searchParams, category };
    setSearchParams(newParams);
    setPage(1);
    updateURLParams(newParams);
  };

  // Hàm cập nhật URL params mà không reload trang
  const updateURLParams = (params) => {
    const currentParams = new URLSearchParams();
    
    // Thêm các tham số có giá trị vào URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        currentParams.set(key, value);
      }
    });
    
    // Cập nhật URL mà không reload trang
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
    console.log('SearchResults - updating URL:', newUrl);
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => {
      if (prev[itemId]) return prev;
      return { ...prev, [itemId]: true };
    });
  };

  const handleOpenPriceModal = () => {
    // Thiết lập giá trị ban đầu dựa trên searchParams hiện tại
    const lowPrice = searchParams.lowprice ? Number(searchParams.lowprice) : 0;
    const highPrice = searchParams.highprice ? Number(searchParams.highprice) : 100000000;
    setTempPriceRange([lowPrice, highPrice]);
    setOpenPriceModal(true);
  };

  const handleClosePriceModal = () => {
    setOpenPriceModal(false);
  };

  const handleApplyPriceFilter = () => {
    const newParams = {
      ...searchParams,
      lowprice: tempPriceRange[0].toString(),
      highprice: tempPriceRange[1].toString()
    };
    setSearchParams(newParams);
    setPage(1);
    setOpenPriceModal(false);
    
    // Cập nhật URL khi áp dụng bộ lọc giá
    updateURLParams(newParams);
  };

  const handleResetPriceFilter = () => {
    const newParams = {
      ...searchParams,
      lowprice: '',
      highprice: ''
    };
    setTempPriceRange([0, 100000000]);
    setSearchParams(newParams);
    setPage(1);
    setOpenPriceModal(false);
    
    // Xóa các tham số giá trong URL
    updateURLParams(newParams);
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${price/1000000} triệu`;
    }
    return `${price.toLocaleString()} đ`;
  };

  return (
    <div className="styled-box">
      <ToastContainer />
      <Header 
        onSearch={handleHeaderSearch}
        onLocationChange={handleHeaderLocationChange}
        selectedLocation={searchParams.location}
        initialQuery={searchParams.query}
      />
      
      <div className="filter-section">
        <div className="filter-content">
          <div className="filter-group">
            <span className="filter-label">Danh mục</span>
            <select 
              value={searchParams.category || ''}
              onChange={(e) => handleHeaderCategoryChange(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              {loadingCategories ? (
                <option disabled>Đang tải...</option>
              ) : categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.category_name}>
                    {category.category_name}
                  </option>
                ))
              ) : (
                <option disabled>Không có danh mục</option>
              )}
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label" onClick={handleOpenPriceModal}>Giá</span>
            <span className="filter-dropdown" onClick={handleOpenPriceModal}>▼</span>
            {(searchParams.lowprice || searchParams.highprice) && (
              <span className="filter-active-indicator">●</span>
            )}
          </div>
        </div>
      </div>

      {openPriceModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Lọc theo giá</h2>
              <button className="modal-close" onClick={handleClosePriceModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="price-slider">
                <Range
                  step={100000}
                  min={0}
                  max={100000000}
                  values={tempPriceRange}
                  onChange={(values) => setTempPriceRange(values)}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '4px',
                        width: '100%',
                        backgroundColor: '#ddd',
                        borderRadius: '2px'
                      }}
                    >
                      {children}
                    </div>
                  )}
                  renderThumb={({ props }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '20px',
                        width: '20px',
                        backgroundColor: '#FF6700',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  )}
                />
              </div>
              <div className="price-inputs">
                <div className="price-input-filter">
                  <input
                    type="text"
                    placeholder="Giá tối thiểu"
                    value={tempPriceRange[0] ? new Intl.NumberFormat('vi-VN').format(tempPriceRange[0]) : ''}
                    onChange={(e) => {
                      const value = Number(e.target.value.replace(/\./g, ''));
                      setTempPriceRange([value, tempPriceRange[1]]);
                    }}
                  />
                  <span className="currency-filter">đ</span>
                </div>
                <span>-</span>
                <div className="price-input-filter">
                  <input
                    type="text"
                    placeholder="Giá tối đa"
                    value={tempPriceRange[1] ? new Intl.NumberFormat('vi-VN').format(tempPriceRange[1]) : ''}
                    onChange={(e) => {
                      const value = Number(e.target.value.replace(/\./g, ''));
                      setTempPriceRange([tempPriceRange[0], value]);
                    }}
                  />
                  <span className="currency-filter">đ</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button outline" onClick={handleResetPriceFilter}>
                Xóa lọc
              </button>
              <button className="modal-button primary" onClick={handleApplyPriceFilter}>
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="products-section">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <img src={empty} alt="empty" className="empty-image" />
            <p>Không tìm thấy kết quả</p>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((item) => (
              <Link key={item.item_id} to={`/product/${item.item_id}`} className="product-card">
                <div className="product-image">
                  <img 
                    src={imageErrors[item.item_id] ? images : (item.images?.find(img => img.is_primary)?.image_url || images)}
                    alt={item.item_name}
                    onError={() => handleImageError(item.item_id)}
                    loading="lazy"
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-title">{item.item_name}</h3>
                  <p className="product-price">{new Intl.NumberFormat('vi-VN').format(item.rental_price)} VND/ngày</p>
                  <div className="product-meta">
                    <span>{item.item_locations?.[0]?.location?.province || ''}</span>
                    <span>{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && items.length > 0 && (
        <div className="pagination">
          <button
            className="page-button icon-button"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            <span className="material-icons">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-button page-number ${p === page ? 'active' : ''}`}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="page-button icon-button"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      )}
    <Footer />
    </div>
  );
};

export default SearchResults;