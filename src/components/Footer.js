import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const FooterContainer = styled('div')({
  backgroundColor: '#ffffff',
  textAlign: 'center',
  paddingTop: '10px',
  paddingBottom: '10px',
  borderTop: '1px solid #ddd',
  fontSize: '0.8rem',
  '@media (max-width: 480px)': {
    paddingTop: '8px',
    paddingBottom: '8px',
    fontSize: '0.7rem'
  }
});

const Footer = () => {
  return (
    <FooterContainer>
      <p>&copy; {new Date().getFullYear()} ThueRe. Tất cả quyền được bảo lưu.</p>
    </FooterContainer>
  );
};

export default Footer; 