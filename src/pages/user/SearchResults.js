import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Range } from 'react-range';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../../services/apiService';
import { useErrorHandler } from '../../services/errorService';
import Header from '../../components/Header';
import images from '../../assets/img/img.png';
import empty from '../../assets/img/empty.png';
import styles from './SearchResults.module.css';
import Footer from '../../components/Footer';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [openPriceModal, setOpenPriceModal] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState([0, 10000000]);

  const { handleApiError } = useErrorHandler();
  const location = useLocation();
  const urlQuery = useQuery();
  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await apiService.getCategories();
        if (response.success) {
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
    fetchCategories();
  }, []);

  // Always fetch items using params from URL
  useEffect(() => {
    const query = urlQuery.get('q') || '';
    const category = urlQuery.get('category') || '';
    const province = urlQuery.get('location') || '';
    const lowprice = urlQuery.get('lowprice') || '';
    const highprice = urlQuery.get('highprice') || '';
    const page = parseInt(urlQuery.get('page') || '1', 10);

    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const response = await apiService.getAvailableItems(
        query,
        province,
        category,
        page,
        lowprice,
        highprice
      );
      if (response.success) {
        setItems(response.data);
        setTotalPages(Math.max(1, response.pagination?.totalPages || 1));
      } else {
        setError(response.error);
      }
      setLoading(false);
    };
    fetchItems();
  }, [location.search]);

  // Update URL params for filter/search/pagination
  const updateURLParams = (params) => {
    const currentParams = new URLSearchParams(location.search);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        currentParams.set(key, value);
      } else {
        currentParams.delete(key);
      }
    });
    navigate(`${location.pathname}?${currentParams.toString()}`);
  };

  // Header handlers
  const handleHeaderLocationChange = (loc) => {
    updateURLParams({ location: loc, page: 1 });
  };
  const handleHeaderSearch = (query) => {
    updateURLParams({ q: query, page: 1 });
  };
  const handleHeaderCategoryChange = (category) => {
    updateURLParams({ category, page: 1 });
  };

  // Pagination
  const handlePageChange = (newPage) => {
    updateURLParams({ page: newPage });
  };

  // Price modal logic
  const handleOpenPriceModal = () => {
    const lowPrice = urlQuery.get('lowprice') ? Number(urlQuery.get('lowprice')) : 0;
    const highPrice = urlQuery.get('highprice') ? Number(urlQuery.get('highprice')) : 10000000;
    setTempPriceRange([lowPrice, highPrice]);
    setOpenPriceModal(true);
  };
  const handleClosePriceModal = () => setOpenPriceModal(false);
  const handleApplyPriceFilter = () => {
    updateURLParams({ lowprice: tempPriceRange[0], highprice: tempPriceRange[1], page: 1 });
    setOpenPriceModal(false);
  };
  const handleResetPriceFilter = () => {
    updateURLParams({ lowprice: '', highprice: '', page: 1 });
    setTempPriceRange([0, 10000000]);
    setOpenPriceModal(false);
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => {
      if (prev[itemId]) return prev;
      return { ...prev, [itemId]: true };
    });
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${price/1000000} triệu`;
    }
    return `${price.toLocaleString()} đ`;
  };

  // Get current filter values for UI
  const currentCategory = urlQuery.get('category') || '';
  const currentLocation = urlQuery.get('location') || '';
  const currentQuery = urlQuery.get('q') || '';
  const currentLowPrice = urlQuery.get('lowprice') || '';
  const currentHighPrice = urlQuery.get('highprice') || '';
  const currentPage = parseInt(urlQuery.get('page') || '1', 10);

  return (
    <div className={styles.styledBox}>
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
      <Header
        onSearch={handleHeaderSearch}
        onLocationChange={handleHeaderLocationChange}
        selectedLocation={currentLocation}
        initialQuery={currentQuery}
      />
      <div className={styles.filterSection}>
        <div className={styles.filterContent}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Danh mục</span>
            <select
              value={currentCategory}
              onChange={(e) => handleHeaderCategoryChange(e.target.value)}
              className={styles.filterSelect}
            >
              <option key="all" value="">Tất cả</option>
              {loadingCategories ? (
                <option key="loading" disabled>Đang tải...</option>
              ) : categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.category_name}>
                    {category.category_name}
                  </option>
                ))
              ) : (
                <option key="no-categories" disabled>Không có danh mục</option>
              )}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel} onClick={handleOpenPriceModal}>Giá</span>
            <span className={styles.filterDropdown} onClick={handleOpenPriceModal}>▼</span>
            {(currentLowPrice || currentHighPrice) && (
              <span className={styles.filterActiveIndicator}>●</span>
            )}
          </div>
        </div>
      </div>
      {openPriceModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Lọc theo giá</h2>
              <button className={styles.modalClose} onClick={handleClosePriceModal}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.priceSlider}>
                <Range
                  step={10000}
                  min={0}
                  max={10000000}
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
              <div className={styles.priceInputs}>
                <div className={styles.priceInputFilter}>
                  <input
                    type="text"
                    placeholder="Giá tối thiểu"
                    value={tempPriceRange[0] ? new Intl.NumberFormat('vi-VN').format(tempPriceRange[0]) : ''}
                    onChange={(e) => {
                      const value = Number(e.target.value.replace(/\./g, ''));
                      setTempPriceRange([value, tempPriceRange[1]]);
                    }}
                  />
                  <span className={styles.currencyFilter}>đ</span>
                </div>
                <span>-</span>
                <div className={styles.priceInputFilter}>
                  <input
                    type="text"
                    placeholder="Giá tối đa"
                    value={tempPriceRange[1] ? new Intl.NumberFormat('vi-VN').format(tempPriceRange[1]) : ''}
                    onChange={(e) => {
                      const value = Number(e.target.value.replace(/\./g, ''));
                      setTempPriceRange([tempPriceRange[0], value]);
                    }}
                  />
                  <span className={styles.currencyFilter}>đ</span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${styles.modalButton} ${styles.modalButtonOutline}`} onClick={handleResetPriceFilter}>
                Xóa lọc
              </button>
              <button className={`${styles.modalButton} ${styles.modalButtonPrimary}`} onClick={handleApplyPriceFilter}>
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.productsSection}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <img src={empty} alt="empty" className={styles.emptyImage} />
            <p>Không tìm thấy kết quả</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {items.map((item) => (
              <Link key={item.item_id} to={`/product/${item.item_id}`} className={styles.productCard}>
                <div className={styles.productImage}>
                  <img
                    src={imageErrors[item.item_id] ? images : (item.images?.find(img => img.is_primary)?.image_url || images)}
                    alt={item.item_name}
                    onError={() => handleImageError(item.item_id)}
                    loading="lazy"
                  />
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productTitle}>{item.item_name}</h3>
                  <p className={styles.productPrice}>{new Intl.NumberFormat('vi-VN').format(item.rental_price)} VND/ngày</p>
                  <div className={styles.productMeta}>
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
        <div className={styles.pagination}>
          <button
            className={`${styles.pageButton} ${styles.iconButton}`}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <span className="material-icons">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`${styles.pageButton} ${styles.pageNumber} ${p === currentPage ? styles.pageNumberActive : ''}`}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={`${styles.pageButton} ${styles.iconButton}`}
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
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