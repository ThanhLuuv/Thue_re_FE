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
  InputBase
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
  zIndex: 10
});

const MainToolbar = styled(Toolbar)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'nowrap',
  '@media (max-width: 768px)': {
    flexWrap: 'wrap',
    gap: '10px'
  }
});

const Logo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  color: 'white',
  '& img': {
    height: '28px'
  }
});

const SearchContainer = styled(Box)({
  display: 'flex',
  flex: 1,
  maxWidth: '600px',
  margin: '0 15px',
  height: '40px',
  position: 'relative',
  '@media (max-width: 768px)': {
    order: 3,
    marginTop: '10px',
    width: '100%',
    maxWidth: 'none',
    marginLeft: 0,
    marginRight: 0
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
  backgroundColor: 'white'
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
  }
});

const HeaderIcons = styled(Box)({
  display: 'flex',
  gap: '15px',
  alignItems: 'center',
  marginRight: '15px',
  position: 'relative',
  '@media (max-width: 768px)': {
    marginLeft: 'auto'
  }
});

const HeaderIconButton = styled(IconButton)({
  color: '#FFFFFF !important',
  fontSize: '20px',
  display: 'flex',
  alignItems: 'center'
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
  '&:hover': {
    backgroundColor: '#e65c00'
  }
});

const HeaderComponent = ({ onSearch, onLocationChange, selectedLocation }) => {
  const [city, setCity] = useState(selectedLocation || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState('');

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

  return (
    <StyledAppBar position="static">
      <MainToolbar disableGutters>
        {/* Logo */}
        <Logo>
          <Link to="/" onClick={() => window.location.href = '/'} style={{textDecoration: 'none', cursor: 'pointer', color: 'inherit', padding: '0'}}>
            <img src={slogan} alt="Thuê rẻ" />   
          </Link>
        </Logo>

        {/* Search Container */}
        <SearchContainer>
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
                }
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </SearchBox>

          <SearchBtn onClick={handleSearch}>
            <SearchIcon />
          </SearchBtn>
        </SearchContainer>

        {/* Header Icons */}
        <HeaderIcons>
          <HeaderIconButton
            onClick={() => {
              if (!tokenService.getToken()) {
                window.location.href = '/login';
                return;
              }
            }}
          >
            <NotificationsIcon sx={{ fontSize: 18 }} />
          </HeaderIconButton>
          <HeaderIconButton
            onClick={() => {
              if (!tokenService.getToken()) {
                window.location.href = '/login';
                return;
              }
            }}
          >
            <MessageIcon sx={{ fontSize: 18 }} />
          </HeaderIconButton>
          <HeaderIconButton
            onClick={() => {
              if (!tokenService.getToken()) {
                window.location.href = '/login';
                return;
              }
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 18 }} />
          </HeaderIconButton>
          <HeaderIconButton
            onClick={() => {
              const token = localStorage.getItem('token');
              if (!token) {
                window.location.href = '/login';
                return;
              }
            }}
            sx={{
              position: 'relative',
              '&:hover .user-menu': {
                display: tokenService.getToken() ? 'block' : 'none'
              }
            }}
          >
            <PersonIcon sx={{ fontSize: 18 }} />
            {tokenService.getToken() && (
              <Box
                className="user-menu"
                sx={{
                  display: 'none',
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  width: '200px',
                  color: '#555555',
                  zIndex: 1000
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ mr: 1 }}>
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
                    <Box sx={{ fontWeight: 'bold', color: '#000', fontSize: '14px' }}>{username? username : 'Người dùng'}</Box>
                    <Box sx={{ fontSize: '11px', color: '#777' }}>0.0 ⭐⭐⭐⭐⭐</Box>
                    <Box sx={{ fontSize: '11px', color: '#777' }}>Chưa có đánh giá</Box>
                  </Box>
                </Box>
                
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  <MenuItem sx={{ fontSize: '13px' }}><ShoppingCartIcon sx={{mr: 1, fontSize: 16}} /> Quản lý đơn hàng</MenuItem>
                  <MenuItem sx={{ fontSize: '13px' }}><ShoppingCartIcon sx={{mr: 1, fontSize: 16}} /> Đơn đã thuê</MenuItem>
                  <MenuItem sx={{ fontSize: '13px' }}><LocalOfferIcon sx={{mr: 1, fontSize: 16}} /> Bài đăng</MenuItem>
                  {/* <MenuItem sx={{ fontSize: '13px' }}><FavoriteIcon sx={{mr: 1, fontSize: 16}} /> Tin đăng đã lưu</MenuItem>
                  <MenuItem sx={{ fontSize: '13px' }}><SavedSearchIcon sx={{mr: 1, fontSize: 16}} /> Tìm kiếm đã lưu</MenuItem> */}
                  <MenuItem sx={{ fontSize: '13px' }}><SettingsIcon sx={{mr: 1, fontSize: 16}} /> Cài đặt tài khoản</MenuItem>
                  <MenuItem sx={{ fontSize: '13px' }}><HelpIcon sx={{mr: 1, fontSize: 16}} /> Trợ giúp</MenuItem>
                  <MenuItem sx={{ fontSize: '13px' }}><LogoutIcon sx={{mr: 1, fontSize: 16}} /> <Link style={{textDecoration: 'none', color: 'inherit'}} to="/login" onClick={() => {
                    tokenService.removeToken();
                    window.location.href = '/login';
                  }}>Đăng xuất</Link></MenuItem>
                </Box>
              </Box>
            )}
          </HeaderIconButton>
        </HeaderIcons>

        {/* Post Button */}
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
          Đăng tin
        </PostBtn>
      </MainToolbar>
    </StyledAppBar>
  );
};

export default HeaderComponent;