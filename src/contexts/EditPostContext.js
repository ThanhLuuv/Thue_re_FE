import React, { createContext, useContext, useState } from 'react';

const EditPostContext = createContext(null);

export const EditPostProvider = ({ children }) => {
  const [postToEdit, setPostToEdit] = useState(null);

  const setPostData = (postData) => {
    setPostToEdit(postData);
  };

  const clearPostData = () => {
    setPostToEdit(null);
  };

  return (
    <EditPostContext.Provider value={{ postToEdit, setPostData, clearPostData }}>
      {children}
    </EditPostContext.Provider>
  );
};

export const useEditPost = () => {
  const context = useContext(EditPostContext);
  if (!context) {
    throw new Error('useEditPost must be used within an EditPostProvider');
  }
  return context;
}; 