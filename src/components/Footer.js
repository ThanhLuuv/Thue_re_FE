import React from 'react';
import { Link } from 'react-router-dom';

const footerStyles = {
  bottom: {
    backgroundColor: '#ffffff',
    textAlign: 'center',
    marginTop: '20px',
    paddingTop: '10px',
    paddingBottom: '10px',
    borderTop: '1px solid #ddd',
    fontSize: '0.8rem'
  }
};

const Footer = () => {
  return (
      <div style={footerStyles.bottom}>
        <p>&copy; {new Date().getFullYear()} ThueXe. Tất cả quyền được bảo lưu.</p>
      </div>
  );
};

export default Footer; 