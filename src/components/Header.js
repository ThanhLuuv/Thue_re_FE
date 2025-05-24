import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Button,
  MenuItem,
  Link,
  Select,
  InputBase,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Menu,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MessageIcon from '@mui/icons-material/Message';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SavedSearchIcon from '@mui/icons-material/SavedSearch';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import slogan from '../assets/img/slogan.png';
import avatar from '../assets/img/avatar.png';
import tokenService from '../services/tokenService';
// ============= CSS Styles as Styled Components =============
const StyledAppBar = styled(AppBar)({
  backgroundColor: '#1976d2',
  padding: '0px 16px',
  color: 'white',
  position: 'fixed',
  right: 0,
  left: 0,
  top: 0,
  zIndex: 10,
  '@media (max-width: 480px)': {
    padding: '0px 8px'
  }
});

const MainToolbar = styled(Toolbar)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'nowrap',
  padding: '0 16px',
  '@media (max-width: 768px)': {
    padding: '0 8px',
    justifyContent: 'space-between'
  }
});

const Logo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  color: 'white',
  '& img': {
    height: '28px',
    '@media (max-width: 480px)': {
      height: '24px'
    }
  }
});

const RightSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
});

const SearchContainer = styled(Box)({
  display: 'flex',
  flex: 1,
  maxWidth: '600px',
  margin: '0 15px',
  height: '40px',
  position: 'relative',
  '@media (max-width: 768px)': {
    display: 'none',
    '&.show': {
      display: 'flex',
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      margin: 0,
      padding: '8px',
      maxWidth: 'none',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '4px'
    }
  }
});

const LocationDropdown = styled(Select)({
  position: 'relative',
  backgroundColor: 'white',
  borderRadius: '20px 0 0 20px',
  padding: '0 10px',
  display: 'flex',
  alignItems: 'center',
  borderRight: 'none',
  color: '#222222',
  cursor: 'pointer',
  minWidth: '200px',
  transition: 'border-color 0.3s ease',
  '@media (max-width: 768px)': {
    minWidth: '120px',
    borderRadius: '20px',
    '& .MuiSelect-select': {
      padding: '6px 8px',
      fontSize: '12px'
    }
  },
  '& .MuiSelect-select': {
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    color: '#222222',
    cursor: 'pointer',
    width: '100%',
    appearance: 'none',
    boxShadow: 'none !important',
    border: 'none !important',
    outline: 'none'
  },
  '& .MuiSelect-select:focus': {
    color: '#6699CC'
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  }
});

const SearchBox = styled(Box)({
  flex: 1,
  position: 'relative',
  backgroundColor: 'white',
  '@media (max-width: 768px)': {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: '20px',
    padding: '0 10px'
  }
});

const SearchInput = styled(InputBase)({
  width: '100%',
  padding: '10px',
  borderLeft: 'none',
  borderRight: 'none',
  outline: 'none',
  fontSize: '14px',
  transition: 'border-color 0.3s ease',
  '& .MuiInputBase-input': {
    padding: '0'
  },
  '@media (max-width: 768px)': {
    padding: '8px 0',
    fontSize: '13px'
  }
});

const SearchBtn = styled(Button)({
  backgroundColor: '#FF6700',
  color: 'white',
  border: 'none',
  padding: '0 15px',
  borderRadius: '0 20px 20px 0',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  transition: 'background-color 0.3s ease',
  minWidth: '40px',
  height: '40px',
  '&:hover': {
    backgroundColor: '#e65c00'
  },
  '@media (max-width: 768px)': {
    borderRadius: '20px',
    padding: '0 12px',
    height: '36px',
    minWidth: '36px'
  }
});

const HeaderIcons = styled(Box)({
  display: 'flex',
  gap: '15px',
  alignItems: 'center',
  marginRight: '15px',
  position: 'relative',
  '@media (max-width: 768px)': {
    display: 'none'
  }
});

const HeaderIconButton = styled(IconButton)({
  color: '#FFFFFF !important',
  fontSize: '20px',
  display: 'flex',
  alignItems: 'center',
  '@media (max-width: 480px)': {
    padding: '4px',
    '& svg': {
      fontSize: '20px'
    }
  }
});

const PostBtn = styled(Button)({
  backgroundColor: '#FF6700',
  color: 'white',
  padding: '4px 9px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '14px',
  textDecoration: 'none',
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
  border: 'none',
  cursor: 'pointer',
  '@media (max-width: 480px)': {
    padding: '4px',
    minWidth: '36px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    '& .MuiButton-label': {
      margin: 0
    }
  },
  '&:hover': {
    backgroundColor: '#e65c00'
  }
});

const MobileMenuButton = styled(IconButton)({
  display: 'none',
  color: 'white',
  '@media (max-width: 768px)': {
    display: 'block'
  }
});

const CloseSearchButton = styled(IconButton)({
  display: 'none',
  color: '#666',
  padding: '4px',
  '@media (max-width: 768px)': {
    '&.show': {
      display: 'flex'
    }
  }
});

const MobileSearchButton = styled(IconButton)({
  display: 'none',
  color: 'white',
  '@media (max-width: 768px)': {
    display: 'flex'
  }
});

const HeaderComponent = ({ onSearch, onLocationChange, selectedLocation }) => {
  const [city, setCity] = useState(selectedLocation || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  React.useEffect(() => {
    console.log('Header - selectedLocation changed:', selectedLocation);
    setCity(selectedLocation || '');
    const name = tokenService.getName();
    if (name) {
      setUsername(name);
    }
  }, [selectedLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleLocationChange = (e) => {
    const newCity = e.target.value;
    console.log('Header - handleLocationChange:', newCity);
    setCity(newCity);
    onLocationChange(newCity);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const userMenuItems = [
    { text: 'Quản lý đơn hàng', icon: <ShoppingCartIcon /> },
    { text: 'Đơn đã thuê', icon: <ShoppingCartIcon /> },
    { text: 'Cài đặt tài khoản', icon: <SettingsIcon /> },
    { text: 'Trợ giúp', icon: <HelpIcon /> },
    { text: 'Đăng xuất', icon: <LogoutIcon /> }
  ];

  const mobileMenuItems = [
    { text: 'Thông báo', icon: <NotificationsIcon /> },
    { text: 'Tin nhắn', icon: <MessageIcon /> },
    { text: 'Giỏ hàng', icon: <ShoppingCartIcon /> },
    { text: 'Quản lý đơn hàng', icon: <ShoppingCartIcon /> },
    { text: 'Đơn đã thuê', icon: <ShoppingCartIcon /> },
    { text: 'Cài đặt tài khoản', icon: <SettingsIcon /> },
    { text: 'Trợ giúp', icon: <HelpIcon /> },
    { text: 'Đăng xuất', icon: <LogoutIcon /> }
  ];

  return (
    <StyledAppBar position="static">
      <MainToolbar disableGutters>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MobileMenuButton onClick={toggleMobileMenu}>
            <MenuIcon />
          </MobileMenuButton>

          <Logo>
            <Link to="/" onClick={() => window.location.href = '/'} style={{textDecoration: 'none', cursor: 'pointer', color: 'inherit', padding: '0'}}>
              <img src={slogan} alt="Thuê rẻ" />   
            </Link>
          </Logo>
        </Box>

        {/* Search Container */}
        <SearchContainer className={searchOpen ? 'show' : ''}>
          <LocationDropdown
            value={city}
            onChange={handleLocationChange}
            displayEmpty
            startAdornment={<LocationOnIcon sx={{ color: '#222', mr: 1 }} />}
          >
            <MenuItem value="">Chọn tỉnh/thành</MenuItem>
            <MenuItem value="hanoi">Hà Nội</MenuItem>
            <MenuItem value="hochiminh">TP. Hồ Chí Minh</MenuItem>
            <MenuItem value="danang">Đà Nẵng</MenuItem>
            <MenuItem value="haiphong">Hải Phòng</MenuItem>
            <MenuItem value="cantho">Cần Thơ</MenuItem>
            <MenuItem value="angiang">An Giang</MenuItem>
            <MenuItem value="bacgiang">Bắc Giang</MenuItem>
            <MenuItem value="backan">Bắc Kạn</MenuItem>
            <MenuItem value="baclieu">Bạc Liêu</MenuItem>
            <MenuItem value="bacninh">Bắc Ninh</MenuItem>
            <MenuItem value="bariavungtau">Bà Rịa - Vũng Tàu</MenuItem>
            <MenuItem value="bentre">Bến Tre</MenuItem>
            <MenuItem value="binhdinh">Bình Định</MenuItem>
            <MenuItem value="binhduong">Bình Dương</MenuItem>
            <MenuItem value="binhphuoc">Bình Phước</MenuItem>
            <MenuItem value="binhthuan">Bình Thuận</MenuItem>
            <MenuItem value="camau">Cà Mau</MenuItem>
            <MenuItem value="caobang">Cao Bằng</MenuItem>
            <MenuItem value="daklak">Đắk Lắk</MenuItem>
            <MenuItem value="daknong">Đắk Nông</MenuItem>
            <MenuItem value="dienbien">Điện Biên</MenuItem>
            <MenuItem value="dongnai">Đồng Nai</MenuItem>
            <MenuItem value="dongthap">Đồng Tháp</MenuItem>
            <MenuItem value="gialai">Gia Lai</MenuItem>
            <MenuItem value="hagiang">Hà Giang</MenuItem>
            <MenuItem value="hanam">Hà Nam</MenuItem>
            <MenuItem value="hatinh">Hà Tĩnh</MenuItem>
            <MenuItem value="haugiang">Hậu Giang</MenuItem>
            <MenuItem value="hoabinh">Hòa Bình</MenuItem>
            <MenuItem value="hungyen">Hưng Yên</MenuItem>
            <MenuItem value="khanhhoa">Khánh Hòa</MenuItem>
            <MenuItem value="kiengiang">Kiên Giang</MenuItem>
            <MenuItem value="kontum">Kon Tum</MenuItem>
            <MenuItem value="laichau">Lai Châu</MenuItem>
            <MenuItem value="lamdong">Lâm Đồng</MenuItem>
            <MenuItem value="langson">Lạng Sơn</MenuItem>
            <MenuItem value="laocai">Lào Cai</MenuItem>
            <MenuItem value="longan">Long An</MenuItem>
            <MenuItem value="namdinh">Nam Định</MenuItem>
            <MenuItem value="nghean">Nghệ An</MenuItem>
            <MenuItem value="ninhbinh">Ninh Bình</MenuItem>
            <MenuItem value="ninhthuan">Ninh Thuận</MenuItem>
            <MenuItem value="phutho">Phú Thọ</MenuItem>
            <MenuItem value="phuyen">Phú Yên</MenuItem>
            <MenuItem value="quangbinh">Quảng Bình</MenuItem>
            <MenuItem value="quangnam">Quảng Nam</MenuItem>
            <MenuItem value="quangngai">Quảng Ngãi</MenuItem>
            <MenuItem value="quangninh">Quảng Ninh</MenuItem>
            <MenuItem value="quangtri">Quảng Trị</MenuItem>
            <MenuItem value="soctrang">Sóc Trăng</MenuItem>
            <MenuItem value="sonla">Sơn La</MenuItem>
            <MenuItem value="tayninh">Tây Ninh</MenuItem>
            <MenuItem value="thaibinh">Thái Bình</MenuItem>
            <MenuItem value="thainguyen">Thái Nguyên</MenuItem>
            <MenuItem value="thanhhoa">Thanh Hóa</MenuItem>
            <MenuItem value="thuathienhue">Thừa Thiên Huế</MenuItem>
            <MenuItem value="tiengiang">Tiền Giang</MenuItem>
            <MenuItem value="travinh">Trà Vinh</MenuItem>
            <MenuItem value="tuyenquang">Tuyên Quang</MenuItem>
            <MenuItem value="vinhlong">Vĩnh Long</MenuItem>
            <MenuItem value="vinhphuc">Vĩnh Phúc</MenuItem>
            <MenuItem value="yenbai">Yên Bái</MenuItem>
          </LocationDropdown>

          <SearchBox>
            <SearchInput
              placeholder="Tìm kiếm sản phẩm trên Thuê rẻ"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                  closeSearch();
                }
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </SearchBox>

          <SearchBtn onClick={(e) => {
            handleSearch(e);
            closeSearch();
          }}>
            <SearchIcon />
          </SearchBtn>
        </SearchContainer>

        {/* Right Section */}
        <RightSection>
          {/* Mobile Search Button - Chỉ hiển thị khi search chưa mở */}
          {!searchOpen && (
            <MobileSearchButton onClick={toggleSearch}>
              <SearchIcon />
            </MobileSearchButton>
          )}

          {/* Close Search Button - Chỉ hiển thị khi search đang mở */}
          {searchOpen && (
            <CloseSearchButton onClick={closeSearch} className="show">
              <CloseIcon sx={{ color: 'white'}}/>
            </CloseSearchButton>
          )}

          {/* Desktop Icons - Only show on laptop screens */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '8px', mr: 2 }}>
            <IconButton color="inherit" sx={{ padding: '4px' }}>
              <NotificationsIcon sx={{ fontSize: '20px' }} />
            </IconButton>
            <IconButton color="inherit" sx={{ padding: '4px' }}>
              <MessageIcon sx={{ fontSize: '20px' }} />
            </IconButton>
            <IconButton color="inherit" sx={{ padding: '4px' }}>
              <ShoppingCartIcon sx={{ fontSize: '20px' }} />
            </IconButton>
          </Box>

          {/* User Menu */}
          {tokenService.getToken() ? (
            <>
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ 
                  display: { xs: 'none', md: 'flex' },
                  padding: '4px'
                }}
              >
                <Avatar
                  src={avatar}
                  sx={{ width: 28, height: 28 }}
                />
              </IconButton>
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                disableScrollLock
                PaperProps={{
                  sx: { 
                    width: 220,
                    mt: 0.5,
                    '& .MuiMenuItem-root': {
                      py: 1
                    },
                    '& .MuiListItemIcon-root': {
                      minWidth: 36
                    }
                  }
                }}
              >
                <Box sx={{ p: 1.5, borderBottom: '1px solid #eee' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ mr: 1.5 }}>
                      <Avatar
                        src={avatar}
                        sx={{ width: 36, height: 36 }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ fontWeight: 'bold', fontSize: '14px' }}> 
                        <Link to="/my-profile" onClick={() => {
                          window.location.href = '/my-profile';
                          handleUserMenuClose();
                        }} style={{textDecoration: 'none', color: 'inherit', marginLeft: '5px'}}>
                          {username || 'Người dùng'}
                        </Link>
                      </Box>
                      <Box sx={{ fontSize: '11px', color: '#777' }}>0.0 ⭐⭐⭐⭐⭐</Box>
                    </Box>
                  </Box>
                </Box>
                {userMenuItems.map((item, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => {
                      if (item.text === 'Đăng xuất') {
                        tokenService.removeToken();
                        window.location.href = '/login';
                      }
                      handleUserMenuClose();
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                window.location.href = '/login';
              }}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              Đăng nhập
            </Button>
          )}

          <PostBtn 
            variant="contained"
            onClick={() => {
              if (!tokenService.getToken()) {
                window.location.href = '/login';
                return;
              }else{
                window.location.href = '/post';
              }
            }}
          >
            <AddIcon sx={{ fontSize: 20 }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Đăng tin</Box>
          </PostBtn>
        </RightSection>
      </MainToolbar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
      >
        <Box sx={{ width: 280, pt: 2 }}>
          {tokenService.getToken() ? (
            <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ mr: 2 }}>
                  <img 
                    src={avatar}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%'
                    }}
                    alt="User"
                  />
                </Box>
                <Box>
                  <Box sx={{ fontWeight: 'bold' }}> 
                    <Link to="/my-profile" onClick={() => {
                      window.location.href = '/my-profile';
                    }} style={{textDecoration: 'none', color: 'inherit', marginLeft: '5px'}}>
                      {username || 'Người dùng'}
                    </Link>
                  </Box>
                  <Box sx={{ fontSize: '12px', color: '#777' }}>0.0 ⭐⭐⭐⭐⭐</Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => {
                  window.location.href = '/login';
                }}
              >
                Đăng nhập
              </Button>
            </Box>
          )}

          <List>
            {mobileMenuItems.map((item, index) => (
              <ListItem 
                button 
                key={index}
                onClick={() => {
                  if (item.text === 'Đăng xuất') {
                    tokenService.removeToken();
                    window.location.href = '/login';
                  }
                  toggleMobileMenu();
                }}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </StyledAppBar>
  );
};

export default HeaderComponent;