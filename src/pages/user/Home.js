import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../../services/apiService';
import { useErrorHandler } from '../../services/errorService';
import '../../styles/ErrorDisplay.css';
import Header from '../../components/Header';
import images from '../../assets/img/img.png';
import banner1 from '../../assets/img/banner1.jpg';
import banner2 from '../../assets/img/banner2.jpg';
import banner3 from '../../assets/img/banner3.jpg';
import empty from '../../assets/img/empty.png';
import styles from './Home.module.css';
import Footer from '../../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLoginNotification, setShowLoginNotification] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const [carouselImageErrors, setCarouselImageErrors] = useState({});
  const { handleApiError } = useErrorHandler();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const carouselImages = [
    { src: banner1, alt: 'Banner quảng cáo 1' },
    { src: banner2, alt: 'Banner quảng cáo 2' },
    { src: banner3, alt: 'Banner quảng cáo 3' },
  ];

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

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (token) {
        setShowLoginNotification(false);
      }
      const response = await apiService.get24LastestItems(page);
      if (response.success) {
        setItems(response.data);
        const totalPages = Math.max(1, response.pagination?.totalPages || 1);
        setTotalPages(totalPages);
        if (page > totalPages) {
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
  }, [page, handleApiError]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const handleIndicatorClick = (index) => {
    setCurrentSlide(index);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.category_name);
    const params = new URLSearchParams();
    params.append('category', category.category_name);
    if (selectedLocation) params.append('location', selectedLocation);
    if (searchQuery) params.append('q', searchQuery);
    navigate(`/search?${params.toString()}`);
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

  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  const handleCarouselImageError = (index) => {
    setCarouselImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className={styles.styledBoxHome}>
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
      <div className={styles.banner}>
        <div className={styles.carousel}>
          <div className={styles.carouselInner} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {carouselImages.map((image, index) => (
              <img
                key={index}
                src={carouselImageErrors[index] ? '/img/placeholder.jpg' : image.src}
                alt={image.alt}
                className={styles.carouselImage}
                onError={() => handleCarouselImageError(index)}
              />
            ))}
          </div>
          <button className={`${styles.carouselControl} ${styles.left}`} onClick={prevSlide}>
            <span className="material-icons">chevron_left</span>
          </button>
          <button className={`${styles.carouselControl} ${styles.right}`} onClick={nextSlide}>
            <span className="material-icons">chevron_right</span>
          </button>
          <div className={styles.carouselIndicators}>
            {carouselImages.map((_, index) => (
              <div
                key={index}
                className={`${styles.indicator} ${currentSlide === index ? styles.active : ''}`}
                onClick={() => handleIndicatorClick(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.categories}>
        {loadingCategories ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        ) : categories && categories.length > 0 ? (
          categories.map((category) => (
            <a
              key={category.id}
              href="#"
              className={`${styles.categoryItem} ${selectedCategory === category.category_name ? styles.categoryItemActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick(category);
              }}
            >
              <div className={styles.categoryIcon}>
                <span className="material-symbols-outlined">{category.icon || 'border_clear'}</span>
              </div>
              <span className={styles.categoryName} >{category.category_name}</span>
            </a>
          ))
        ) : (
          <div className={styles.emptyState}>Không có danh mục nào</div>
        )}
      </div>

      <div className={styles.productsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Sản phẩm mới nhất</h2>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        ) : (
          <div className={`${styles.productsGrid} ${items.length === 0 ? styles.productsGridEmpty : ''}`}>
            {items && items.length > 0 ? (
              items.map((item) => (
                <a key={item.item_id} href={`/product/${item.item_id}`} className={styles.productCard}>
                  <div className={styles.productImage}>
                    <img
                      src={imageErrors[item.item_id] ? images : (item.images?.find(img => img.is_primary)?.image_url || images)}
                      alt={item.item_name}
                      onError={() => handleImageError(item.item_id)}
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productTitle}>{item.item_name}</h3>
                    <p className={styles.productPrice}>{new Intl.NumberFormat('vi-VN').format(item.rental_price)} VND/ngày</p>
                    <div className={styles.productMeta}>
                      <span>{item?.item_locations?.[0]?.location?.province || ''}</span>
                      <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : ''}</span>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className={styles.emptyState}>
                <img src={empty} alt="Không có sản phẩm" className={styles.emptyImage} />
                <h3>Không có sản phẩm nào</h3>
              </div>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && items.length > 0 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.pageButton} ${styles.iconButton}`}
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            <span className="material-icons">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`${styles.pageButton} ${styles.pageNumber} ${p === page ? styles.pageNumberActive : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={`${styles.pageButton} ${styles.iconButton}`}
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      )}

      {showLoginNotification && (
        <div className={styles.loginNotification}>
          <div>
            <h3 className={styles.loginTitle}>Đăng nhập để xem thêm thông tin</h3>
          </div>
          <div className={styles.loginActions}>
            <a href="/login" className={styles.loginButton}>Đăng nhập</a>
            <button className={styles.closeButton} onClick={() => setShowLoginNotification(false)}>
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Home;

// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import apiService from '../services/apiService';
// import { useErrorHandler, ErrorDisplay } from '../services/errorService';
// import '../styles/ErrorDisplay.css';
// import Header from '../components/Header';
// import images from '../assets/img/img.png';
// import banner1 from '../assets/img/banner1.jpg';
// import banner2 from '../assets/img/banner2.jpg';
// import banner3 from '../assets/img/banner3.jpg';
// import empty from '../assets/img/empty.png';
// import './Home.css';
// import Footer from '../components/Footer';

// const Home = () => {
//   const navigate = useNavigate();
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [showLoginNotification, setShowLoginNotification] = useState(true);
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedLocation, setSelectedLocation] = useState('');
//   const [imageErrors, setImageErrors] = useState({});
//   const [carouselImageErrors, setCarouselImageErrors] = useState({});
//   const { handleApiError } = useErrorHandler();
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [categories, setCategories] = useState([]);
//   const [loadingCategories, setLoadingCategories] = useState(true);

//   const carouselImages = [
//     { src: banner1, alt: 'Banner quảng cáo 1' },
//     { src: banner2, alt: 'Banner quảng cáo 2' },
//     { src: banner3, alt: 'Banner quảng cáo 3' },
//   ];

//   const fetchCategories = async () => {
//     try {
//       setLoadingCategories(true);
//       const response = await apiService.getCategories();
//       if (response.success) {
//         console.log('Categories response:', response);
//         setCategories(response.data || []);
//       } else {
//         const errorResult = handleApiError(response);
//         setError(errorResult);
//         setCategories([]);
//       }
//     } catch (err) {
//       const errorResult = handleApiError(err);
//       setError(errorResult);
//       setCategories([]);
//     } finally {
//       setLoadingCategories(false);
//     }
//   };

//   const fetchItems = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const token = localStorage.getItem('token');
//       if (token) {
//         setShowLoginNotification(false);
//       }
//       const response = await apiService.get24LastestItems(page);
//       if (response.success) {
//         setItems(response.data);
//         const totalPages = Math.max(1, response.pagination?.totalPages || 1);
//         setTotalPages(totalPages);
//         if (page > totalPages) {
//           setPage(1);
//         }
//       } else {
//         const errorResult = handleApiError(response);
//         setError(errorResult);
//       }
//     } catch (err) {
//       const errorResult = handleApiError(err);
//       setError(errorResult);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, handleApiError]);

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [carouselImages.length]);

//   useEffect(() => {
//     fetchItems();
//   }, [fetchItems]);

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
//   };

//   const handleIndicatorClick = (index) => {
//     setCurrentSlide(index);
//   };

//   const handleCategoryClick = (category) => {
//     setSelectedCategory(category.category_name);
//     const params = new URLSearchParams();
//     params.append('category', category.category_name);
//     if (selectedLocation) params.append('location', selectedLocation);
//     if (searchQuery) params.append('q', searchQuery);
//     console.log('Navigating to search with params:', params.toString());
//     navigate(`/search?${params.toString()}`);
//   };

//   const handleHeaderSearch = (query) => {
//     setSearchQuery(query);
//     const params = new URLSearchParams();
//     if (query) params.append('q', query);
//     if (selectedLocation) params.append('location', selectedLocation);
//     if (selectedCategory) params.append('category', selectedCategory);
//     console.log('Navigating to search with params:', params.toString());
//     navigate(`/search?${params.toString()}`);
//   };

//   const handleHeaderLocationChange = (location) => {
//     setSelectedLocation(location);
//     const params = new URLSearchParams();
//     if (location) params.append('location', location);
//     if (searchQuery) params.append('q', searchQuery);
//     if (selectedCategory) params.append('category', selectedCategory);
//     console.log('Navigating to search with params:', params.toString());
//     navigate(`/search?${params.toString()}`);
//   };

//   const handleImageError = (itemId) => {
//     setImageErrors((prev) => ({ ...prev, [itemId]: true }));
//   };

//   const handleCarouselImageError = (index) => {
//     setCarouselImageErrors((prev) => ({ ...prev, [index]: true }));
//   };

//   return (
//     <div className="styled-box-home">
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar
//         newestOnTop
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss={false}
//         draggable={false}
//         pauseOnHover={false}
//         theme="light"
//         closeButton={false}
//         style={{ top: '20px', right: '20px' }}
//         toastStyle={{
//           background: 'white',
//           color: '#333',
//           fontSize: '12px',
//           padding: '8px 12px',
//           borderRadius: '4px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//           maxWidth: '300px',
//           lineHeight: '1.2',
//           minHeight: 'auto',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100%',
//           cursor: 'pointer'
//         }}
//         bodyStyle={{
//           margin: 0,
//           padding: 0,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           height: '100%'
//         }}
//       />
//       <Header onSearch={handleHeaderSearch} onLocationChange={handleHeaderLocationChange} />
//       <div className="banner">
//         <div className="carousel">
//           <div className="carousel-inner" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
//             {carouselImages.map((image, index) => (
//               <img
//                 key={index}
//                 src={carouselImageErrors[index] ? '/img/placeholder.jpg' : image.src}
//                 alt={image.alt}
//                 className="carousel-image"
//                 onError={() => handleCarouselImageError(index)}
//               />
//             ))}
//           </div>
//           <button className="carousel-control left" onClick={prevSlide}>
//             <span className="material-icons">chevron_left</span>
//           </button>
//           <button className="carousel-control right" onClick={nextSlide}>
//             <span className="material-icons">chevron_right</span>
//           </button>
//           <div className="carousel-indicators">
//             {carouselImages.map((_, index) => (
//               <div
//                 key={index}
//                 className={`indicator ${currentSlide === index ? 'active' : ''}`}
//                 onClick={() => handleIndicatorClick(index)}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="categories">
//         {loadingCategories ? (
//           <div className="loading-categories">
//             <div className="spinner"></div>
//           </div>
//         ) : categories && categories.length > 0 ? (
//           categories.map((category) => (
//             <a
//               key={category.id}
//               href="#"
//               className={`category-item ${selectedCategory === category.category_name ? 'active' : ''}`}
//               onClick={(e) => {
//                 e.preventDefault();
//                 handleCategoryClick(category);
//               }}
//             >
//               <div className="category-icon">
//                 <span className="material-icons">{category.icon || 'border_clear'}</span>
//               </div>
//               <span className="category-name">{category.category_name}</span>
//             </a>
//           ))
//         ) : (
//           <div className="no-categories">Không có danh mục nào</div>
//         )}
//       </div>

//       <div className="products-section">
//         <div className="section-header">
//           <h2 className="section-title">Sản phẩm mới nhất</h2>
//         </div>

//         {loading ? (
//           <div className="loading">
//             <div className="spinner"></div>
//           </div>
//         ) : (
//           <div className={`products-grid ${items.length === 0 ? 'empty' : ''}`}>
//             {items && items.length > 0 ? (
//               items.map((item) => (
//                 <a key={item.item_id} href={`/product/${item.item_id}`} className="product-card">
//                   <div className="product-image">
//                     <img
//                       src={imageErrors[item.item_id] ? images : (item.images?.find(img => img.is_primary)?.image_url || images)}
//                       alt={item.item_name}
//                       onError={() => handleImageError(item.item_id)}
//                     />
//                   </div>
//                   <div className="product-info">
//                     <h3 className="product-title">{item.item_name}</h3>
//                     <p className="product-price">{new Intl.NumberFormat('vi-VN').format(item.rental_price)} VND/ngày</p>
//                     <div className="product-meta">
//                       <span>{item?.item_locations?.[0]?.location?.province || ''}</span>
//                       <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : ''}</span>
//                     </div>
//                   </div>
//                 </a>
//               ))
//             ) : (
//               <div className="empty-state">
//                 <img src={empty} alt="Không có sản phẩm" className="empty-image" />
//                 <h3>Không có sản phẩm nào</h3>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {totalPages > 1 && items.length > 0 && (
//         <div className="pagination">
//           <button
//             className="page-button icon-button"
//             disabled={page === 1}
//             onClick={() => setPage((prev) => prev - 1)}
//           >
//             <span className="material-icons">chevron_left</span>
//           </button>
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
//             <button
//               key={p}
//               className={`page-button page-number ${p === page ? 'active' : ''}`}
//               onClick={() => setPage(p)}
//             >
//               {p}
//             </button>
//           ))}
//           <button
//             className="page-button icon-button"
//             disabled={page === totalPages}
//             onClick={() => setPage((prev) => prev + 1)}
//           >
//             <span className="material-icons">chevron_right</span>
//           </button>
//         </div>
//       )}

//       {showLoginNotification && (
//         <div className="login-notification">
//           <div>
//             <h3 className="login-title">Đăng nhập để xem thêm thông tin</h3>
//           </div>
//           <div className="login-actions">
//             <a href="/login" className="login-button">Đăng nhập</a>
//             <button className="close-button" onClick={() => setShowLoginNotification(false)}>
//               <span className="material-icons">close</span>
//             </button>
//           </div>
//         </div>
//       )}
//       <Footer />
//     </div>
//   );
// };

// export default Home;